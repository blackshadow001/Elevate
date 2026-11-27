import "server-only";
import { ApiError } from "@/server/api";
import { getDb, transaction } from "@/server/db";
import type { SessionUser } from "@/server/auth";

type PathRow = { id: string; slug: string; title: string; summary: string; owner_id: string | null; status: string };
type StepRow = { id: string; path_id: string; position: number; kind: string; title: string; body: string; starter_code: string; answer_json: string };
const kinds = ["reading", "fill_blank", "code", "project"] as const;
const allowedTags = ["style", "main", "section", "h1", "h2", "p", "a", "ul", "li"];

function value(input: unknown, name: string, min: number, max: number) {
  if (typeof input !== "string" || input.trim().length < min || input.trim().length > max)
    throw new ApiError(422, "INVALID_INPUT", `${name} must be ${min}–${max} characters.`);
  return input.trim();
}

function findPath(slugOrId: string): PathRow {
  const path = getDb().prepare("SELECT * FROM guided_paths WHERE slug=? OR id=?").get(slugOrId, slugOrId) as PathRow | undefined;
  if (!path) throw new ApiError(404, "PATH_NOT_FOUND", "Learning path not found.");
  return path;
}

function canEdit(path: PathRow, user: SessionUser) {
  if (user.role !== "admin" && path.owner_id !== user.id) throw new ApiError(403, "FORBIDDEN", "This learning path belongs to another tutor.");
  if (path.status !== "draft") throw new ApiError(409, "PATH_LOCKED", "Only draft paths can be edited.");
}

function stepsFor(pathId: string): StepRow[] {
  return getDb().prepare("SELECT * FROM guided_steps WHERE path_id=? ORDER BY position").all(pathId) as StepRow[];
}

export function listGuidedPaths(status: "published" | "archived" = "published") {
  return getDb().prepare(`SELECT p.id,p.slug,p.title,p.summary,p.status,COUNT(s.id) AS stepCount
    FROM guided_paths p LEFT JOIN guided_steps s ON s.path_id=p.id
    WHERE p.status=? GROUP BY p.id ORDER BY p.created_at`).all(status);
}

export function guidedPath(slug: string, user: SessionUser | null) {
  const path = findPath(slug);
  if (path.status !== "published" && path.status !== "archived") throw new ApiError(404, "PATH_NOT_FOUND", "Learning path not found.");
  const steps = stepsFor(path.id).map((step) => ({
    id: step.id, path_id: step.path_id, position: step.position, kind: step.kind,
    title: step.title, body: step.body, starter_code: step.starter_code.replaceAll("\\n", "\n"),
  }));
  const completedIds = user ? (getDb().prepare(`SELECT sp.step_id FROM guided_step_progress sp JOIN guided_steps s ON s.id=sp.step_id
    WHERE s.path_id=? AND sp.user_id=? AND sp.passed=1`).all(path.id, user.id) as { step_id: string }[]).map((row) => row.step_id) : [];
  const completion = user ? getDb().prepare("SELECT id,issued_at FROM guided_path_completions WHERE path_id=? AND user_id=?").get(path.id, user.id) : null;
  return { id: path.id, slug: path.slug, title: path.title, summary: path.summary, steps, completedIds, completion };
}

export function submitGuidedStep(slug: string, stepId: string, user: SessionUser, response: unknown) {
  const path = findPath(slug);
  if (path.status !== "published" && path.status !== "archived") throw new ApiError(404, "PATH_NOT_FOUND", "Learning path not found.");
  const steps = stepsFor(path.id);
  const index = steps.findIndex((step) => step.id === stepId);
  if (index < 0) throw new ApiError(404, "STEP_NOT_FOUND", "Step not found in this path.");
  if (index > 0 && !getDb().prepare("SELECT 1 FROM guided_step_progress WHERE user_id=? AND step_id=? AND passed=1").get(user.id, steps[index - 1].id))
    throw new ApiError(409, "PREVIOUS_STEP_REQUIRED", "Complete the previous step first.");
  const step = steps[index];
  const answer = value(response, "Response", 1, 10000);
  const rules = JSON.parse(step.answer_json) as { expected?: string; requiredTags?: string[] };
  let missing: string[] = [];
  let passed = false;
  if (step.kind === "reading") passed = answer === "read";
  else if (step.kind === "fill_blank") passed = answer.toLocaleLowerCase() === rules.expected?.trim().toLocaleLowerCase();
  else {
    const html = answer.replace(/<!--[\s\S]*?-->/g, "");
    missing = (rules.requiredTags || []).filter((tag) => {
      const element = html.match(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}\\s*>`, "i"));
      if (!element) return true;
      if (["h1", "h2", "p", "a", "li"].includes(tag) && !element[2].replace(/<[^>]*>/g, "").trim()) return true;
      if (tag === "a" && !/\bhref\s*=\s*["'][^"']+["']/i.test(element[1])) return true;
      if (tag === "style" && !/[a-z-]+\s*:\s*[^;{}]+/i.test(element[2])) return true;
      return false;
    });
    passed = missing.length === 0;
  }
  let completion: { id: string; issued_at: string } | null = null;
  transaction((db) => {
    db.prepare(`INSERT INTO guided_step_progress(user_id,step_id,response,passed) VALUES(?,?,?,?)
      ON CONFLICT(user_id,step_id) DO UPDATE SET response=excluded.response,
      passed=MAX(guided_step_progress.passed,excluded.passed),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')`)
      .run(user.id, stepId, answer, passed ? 1 : 0);
    if (passed && index === steps.length - 1) {
      const count = (db.prepare(`SELECT COUNT(*) AS n FROM guided_step_progress sp JOIN guided_steps s ON s.id=sp.step_id
        WHERE s.path_id=? AND sp.user_id=? AND sp.passed=1`).get(path.id, user.id) as { n: number }).n;
      if (count === steps.length) db.prepare("INSERT OR IGNORE INTO guided_path_completions(id,user_id,path_id) VALUES(?,?,?)").run(crypto.randomUUID(), user.id, path.id);
    }
    completion = db.prepare("SELECT id,issued_at FROM guided_path_completions WHERE path_id=? AND user_id=?").get(path.id, user.id) as typeof completion;
  });
  return { passed, missing, completion };
}

export function ownGuidedPaths(user: SessionUser) {
  return getDb().prepare(`SELECT p.id,p.slug,p.title,p.summary,p.status,COUNT(s.id) AS stepCount
    FROM guided_paths p LEFT JOIN guided_steps s ON s.path_id=p.id
    WHERE p.owner_id=? GROUP BY p.id ORDER BY p.updated_at DESC`).all(user.id);
}

export function createGuidedPath(user: SessionUser, input: Record<string, unknown>) {
  const title = value(input.title, "Title", 4, 120);
  const summary = value(input.summary, "Summary", 10, 400);
  const id = crypto.randomUUID();
  const slug = `${title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70)}-${id.slice(0, 8)}`;
  getDb().prepare("INSERT INTO guided_paths(id,slug,title,summary,owner_id) VALUES(?,?,?,?,?)").run(id, slug, title, summary, user.id);
  return { id, slug, title, summary, status: "draft" };
}

function stepInput(input: Record<string, unknown>) {
  const kind = value(input.kind, "Type", 1, 20);
  if (!kinds.includes(kind as typeof kinds[number])) throw new ApiError(422, "INVALID_INPUT", "Choose a valid step type.");
  const title = value(input.title, "Step title", 3, 120);
  const body = value(input.body, "Instructions", 10, 4000);
  const starter = typeof input.starterCode === "string" ? input.starterCode.slice(0, 4000) : "";
  let answer: { expected?: string; requiredTags?: string[] } = {};
  if (kind === "fill_blank") answer = { expected: value(input.expected, "Correct answer", 1, 120) };
  if (kind === "code" || kind === "project") {
    const tags = Array.isArray(input.requiredTags) ? input.requiredTags : [];
    if (tags.length < 1 || tags.length > 8 || tags.some((tag) => typeof tag !== "string" || !allowedTags.includes(tag)))
      throw new ApiError(422, "INVALID_INPUT", "Select 1–8 supported HTML tags to check.");
    answer = { requiredTags: [...new Set(tags)] as string[] };
  }
  return { kind, title, body, starter, answerJson: JSON.stringify(answer) };
}

export function ownGuidedPath(id: string, user: SessionUser) {
  const path = findPath(id);
  if (user.role !== "admin" && path.owner_id !== user.id) throw new ApiError(403, "FORBIDDEN", "This learning path belongs to another tutor.");
  return { ...path, steps: stepsFor(path.id).map((step) => ({ ...step, answer: JSON.parse(step.answer_json) })) };
}

export function updateGuidedPath(id: string, user: SessionUser, input: Record<string, unknown>) {
  const path = findPath(id);
  canEdit(path, user);
  const title = value(input.title, "Title", 4, 120);
  const summary = value(input.summary, "Summary", 10, 400);
  getDb().prepare("UPDATE guided_paths SET title=?,summary=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?")
    .run(title, summary, path.id);
  return { id: path.id, title, summary };
}

export function addGuidedStep(id: string, user: SessionUser, input: Record<string, unknown>) {
  const path = findPath(id);
  canEdit(path, user);
  const step = stepInput(input);
  const count = stepsFor(path.id).length;
  if (count >= 40) throw new ApiError(422, "PATH_FULL", "A path can have at most 40 steps.");
  const stepId = crypto.randomUUID();
  getDb().prepare(`INSERT INTO guided_steps(id,path_id,position,kind,title,body,starter_code,answer_json)
    VALUES(?,?,?,?,?,?,?,?)`).run(stepId, path.id, count + 1, step.kind, step.title, step.body, step.starter, step.answerJson);
  return { id: stepId, position: count + 1 };
}

export function editGuidedStep(pathId: string, stepId: string, user: SessionUser, input: Record<string, unknown>) {
  const path = findPath(pathId);
  canEdit(path, user);
  const step = stepInput(input);
  const result = getDb().prepare(`UPDATE guided_steps SET kind=?,title=?,body=?,starter_code=?,answer_json=? WHERE id=? AND path_id=?`)
    .run(step.kind, step.title, step.body, step.starter, step.answerJson, stepId, path.id);
  if (!result.changes) throw new ApiError(404, "STEP_NOT_FOUND", "Step not found.");
  return { id: stepId };
}

export function removeGuidedStep(pathId: string, stepId: string, user: SessionUser) {
  const path = findPath(pathId);
  canEdit(path, user);
  transaction((db) => {
    const result = db.prepare("DELETE FROM guided_steps WHERE id=? AND path_id=?").run(stepId, path.id);
    if (!result.changes) throw new ApiError(404, "STEP_NOT_FOUND", "Step not found.");
    db.prepare("UPDATE guided_steps SET position=-position WHERE path_id=?").run(path.id);
    const remaining = db.prepare("SELECT id FROM guided_steps WHERE path_id=? ORDER BY position DESC").all(path.id) as { id: string }[];
    remaining.forEach((step, index) => db.prepare("UPDATE guided_steps SET position=? WHERE id=?").run(index + 1, step.id));
  });
  return { removed: true };
}

export function submitPathForReview(id: string, user: SessionUser) {
  const path = findPath(id);
  canEdit(path, user);
  const steps = stepsFor(path.id);
  if (steps.length < 3 || !steps.some((step) => step.kind === "reading") || !steps.some((step) => step.kind === "fill_blank") || steps.at(-1)?.kind !== "project")
    throw new ApiError(422, "PATH_INCOMPLETE", "Add at least three steps: an explanation, a fill-in-the-blank check, and a final project.");
  getDb().prepare("UPDATE guided_paths SET status='review',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(path.id);
  return { status: "review" };
}

export function reviewGuidedPaths() {
  return getDb().prepare(`SELECT p.id,p.title,p.summary,p.status,p.slug,u.name AS tutorName,COUNT(s.id) AS stepCount
    FROM guided_paths p LEFT JOIN users u ON u.id=p.owner_id LEFT JOIN guided_steps s ON s.path_id=p.id
    WHERE p.status IN ('review','published') GROUP BY p.id ORDER BY p.updated_at`).all();
}

export function publishGuidedPath(id: string) {
  const path = findPath(id);
  if (path.status !== "review") throw new ApiError(409, "NOT_IN_REVIEW", "Only submitted paths can be published.");
  getDb().prepare("UPDATE guided_paths SET status='published',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(path.id);
  return { status: "published" };
}

export function archiveGuidedPath(id: string) {
  const path = findPath(id);
  if (path.status !== "published") throw new ApiError(409, "NOT_PUBLISHED", "Only a published path can be archived.");
  getDb().prepare("UPDATE guided_paths SET status='archived',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(path.id);
  return { status: "archived" };
}

export function returnGuidedPath(id: string) {
  const path = findPath(id);
  if (path.status !== "review") throw new ApiError(409, "NOT_IN_REVIEW", "Only submitted paths can be returned for edits.");
  getDb().prepare("UPDATE guided_paths SET status='draft',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(path.id);
  return { status: "draft" };
}

export function verifyGuidedCompletion(id: string) {
  const row = getDb().prepare(`SELECT c.id,c.issued_at,p.title AS pathTitle,u.name AS learnerName
    FROM guided_path_completions c JOIN guided_paths p ON p.id=c.path_id
    JOIN users u ON u.id=c.user_id WHERE c.id=?`).get(id);
  if (!row) throw new ApiError(404, "COMPLETION_NOT_FOUND", "Completion record not found.");
  return row;
}
