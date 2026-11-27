import "server-only";
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { ApiError } from "@/server/api";
import { getDb, transaction } from "@/server/db";
import type { SessionUser } from "@/server/auth";

type Program = { id: string; slug: string; status: string; project_title: string; exam_json: string };
type ExamQuestion = { question: string; answer: string };

function program(slug: string): Program {
  const row = getDb().prepare("SELECT id,slug,status,project_title,exam_json FROM guided_paths WHERE slug=?").get(slug) as Program | undefined;
  if (!row || row.status !== "published" || !row.project_title) throw new ApiError(404, "PROGRAM_NOT_FOUND", "This assessed program is unavailable.");
  return row;
}

function courseworkComplete(db: DatabaseSync, pathId: string, userId: string) {
  const row = db.prepare(`SELECT COUNT(*) AS total,COUNT(sp.step_id) AS completed FROM guided_steps s
    LEFT JOIN guided_step_progress sp ON sp.step_id=s.id AND sp.user_id=? AND sp.passed=1 WHERE s.path_id=?`)
    .get(userId, pathId) as { total: number; completed: number };
  return row.total > 0 && row.total === row.completed;
}

function requireCoursework(pathId: string, userId: string) {
  if (!courseworkComplete(getDb(), pathId, userId))
    throw new ApiError(409, "COURSEWORK_INCOMPLETE", "Finish every module before starting the final assessment.");
}

function publicUrl(value: unknown, field: string) {
  if (typeof value !== "string" || value.length > 600) throw new ApiError(422, "INVALID_URL", `${field} needs a public HTTPS URL.`);
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new ApiError(422, "INVALID_URL", `${field} needs a public HTTPS URL.`); }
  if (url.protocol !== "https:" || !url.hostname.includes(".") || url.username || url.password || url.port)
    throw new ApiError(422, "INVALID_URL", `${field} needs a public HTTPS URL.`);
  return url.toString();
}

function normalize(value: string) { return value.trim().replace(/\s+/g, " ").toLocaleLowerCase(); }

function tryIssueCertificate(db: DatabaseSync, pathId: string, userId: string) {
  if (!courseworkComplete(db, pathId, userId)) return;
  const project = db.prepare("SELECT id FROM guided_project_submissions WHERE path_id=? AND user_id=? AND status='approved'")
    .get(pathId, userId) as { id: string } | undefined;
  const exam = db.prepare(`SELECT id FROM guided_exam_attempts WHERE path_id=? AND user_id=? AND passed=1
    ORDER BY attempted_at DESC LIMIT 1`).get(pathId, userId) as { id: string } | undefined;
  if (project && exam) db.prepare(`INSERT OR IGNORE INTO guided_certificates
    (id,user_id,path_id,project_submission_id,exam_attempt_id) VALUES(?,?,?,?,?)`)
    .run(randomUUID(), userId, pathId, project.id, exam.id);
}

export function guidedAssessment(pathId: string, userId: string) {
  const db = getDb();
  const project = db.prepare(`SELECT id,project_url,repository_url,notes,status,feedback,submitted_at,reviewed_at
    FROM guided_project_submissions WHERE path_id=? AND user_id=?`).get(pathId, userId) || null;
  const exam = db.prepare(`SELECT score,total,passed,attempted_at FROM guided_exam_attempts WHERE path_id=? AND user_id=?
    ORDER BY attempted_at DESC LIMIT 1`).get(pathId, userId) || null;
  const certificate = db.prepare(`SELECT id,issued_at FROM guided_certificates WHERE path_id=? AND user_id=?`)
    .get(pathId, userId) || null;
  return { courseworkComplete: courseworkComplete(db, pathId, userId), project, exam, certificate };
}

export function submitGuidedProject(slug: string, user: SessionUser, input: Record<string, unknown>) {
  const path = program(slug);
  requireCoursework(path.id, user.id);
  const projectUrl = publicUrl(input.projectUrl, "Project");
  const repositoryUrl = publicUrl(input.repositoryUrl, "Repository");
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  if (notes.length < 80 || notes.length > 4000)
    throw new ApiError(422, "INVALID_INPUT", "Explain your work and testing in 80–4000 characters.");
  return transaction((db) => {
    const existing = db.prepare("SELECT status FROM guided_project_submissions WHERE path_id=? AND user_id=?")
      .get(path.id, user.id) as { status: string } | undefined;
    if (existing?.status === "approved") throw new ApiError(409, "ALREADY_APPROVED", "Your project has already been approved.");
    db.prepare(`INSERT INTO guided_project_submissions
      (id,user_id,path_id,project_url,repository_url,notes) VALUES(?,?,?,?,?,?)
      ON CONFLICT(user_id,path_id) DO UPDATE SET project_url=excluded.project_url,
      repository_url=excluded.repository_url,notes=excluded.notes,status='pending',feedback='',reviewer_id=NULL,
      submitted_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),reviewed_at=NULL`)
      .run(randomUUID(), user.id, path.id, projectUrl, repositoryUrl, notes);
    return guidedAssessment(path.id, user.id);
  });
}

export function guidedExam(slug: string, user: SessionUser) {
  const path = program(slug);
  requireCoursework(path.id, user.id);
  const questions = JSON.parse(path.exam_json) as ExamQuestion[];
  return { questions: questions.map((item, index) => ({ id: index, question: item.question })),
    passingScore: Math.ceil(questions.length * 0.8), total: questions.length,
    assessment: guidedAssessment(path.id, user.id) };
}

export function submitGuidedExam(slug: string, user: SessionUser, input: Record<string, unknown>) {
  const path = program(slug);
  requireCoursework(path.id, user.id);
  const questions = JSON.parse(path.exam_json) as ExamQuestion[];
  const answers = input.answers;
  if (!Array.isArray(answers) || answers.length !== questions.length || answers.some((answer) => typeof answer !== "string" || answer.length > 120))
    throw new ApiError(422, "INVALID_INPUT", `Submit all ${questions.length} short answers.`);
  const recent = getDb().prepare(`SELECT COUNT(*) AS n FROM guided_exam_attempts
    WHERE path_id=? AND user_id=? AND attempted_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day')`).get(path.id, user.id) as { n: number };
  if (recent.n >= 5) throw new ApiError(429, "EXAM_LIMIT", "You can try the final assessment up to five times per day.");
  const score = questions.reduce((total, item, index) => total + Number(normalize(answers[index]) === normalize(item.answer)), 0);
  const passed = score >= Math.ceil(questions.length * 0.8);
  return transaction((db) => {
    db.prepare("INSERT INTO guided_exam_attempts(id,user_id,path_id,score,total,passed) VALUES(?,?,?,?,?,?)")
      .run(randomUUID(), user.id, path.id, score, questions.length, passed ? 1 : 0);
    if (passed) tryIssueCertificate(db, path.id, user.id);
    return { score, total: questions.length, passed, assessment: guidedAssessment(path.id, user.id) };
  });
}

export function pendingGuidedProjects() {
  return getDb().prepare(`SELECT s.id,s.project_url,s.repository_url,s.notes,s.status,s.submitted_at,
    p.title AS path_title,p.slug AS path_slug,p.project_brief,p.project_requirements_json,
    u.name AS learner_name,u.email AS learner_email FROM guided_project_submissions s
    JOIN guided_paths p ON p.id=s.path_id JOIN users u ON u.id=s.user_id
    WHERE s.status='pending' ORDER BY s.submitted_at`).all();
}

export function reviewGuidedProject(id: string, reviewer: SessionUser, input: Record<string, unknown>) {
  const decision = input.decision;
  if (decision !== "approve" && decision !== "changes_requested") throw new ApiError(422, "INVALID_INPUT", "Choose approve or request changes.");
  const feedback = typeof input.feedback === "string" ? input.feedback.trim() : "";
  if (feedback.length > 2000 || (decision === "changes_requested" && feedback.length < 20))
    throw new ApiError(422, "INVALID_INPUT", "Provide at least 20 characters of feedback when requesting changes.");
  return transaction((db) => {
    const submission = db.prepare("SELECT user_id,path_id,status FROM guided_project_submissions WHERE id=?")
      .get(id) as { user_id: string; path_id: string; status: string } | undefined;
    if (!submission) throw new ApiError(404, "PROJECT_NOT_FOUND", "Submission not found.");
    if (submission.status !== "pending") throw new ApiError(409, "ALREADY_REVIEWED", "This submission is no longer pending.");
    db.prepare(`UPDATE guided_project_submissions SET status=?,feedback=?,reviewer_id=?,
      reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`)
      .run(decision === "approve" ? "approved" : "changes_requested", feedback, reviewer.id, id);
    if (decision === "approve") tryIssueCertificate(db, submission.path_id, submission.user_id);
    return { status: decision === "approve" ? "approved" : "changes_requested" };
  });
}
