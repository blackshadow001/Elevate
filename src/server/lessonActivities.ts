import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { type SessionUser } from "@/server/auth";
import { transaction } from "@/server/db";
import { updateProgress } from "@/server/learning";
import { rateLimit } from "@/server/rateLimit";
import { type LessonActivity } from "@/lib/lessonActivities";

export function parseActivity(value: unknown, type: string, complete: boolean): LessonActivity | null {
  if (value === null || value === undefined) {
    if (complete && (type === "quiz" || type === "project")) throw new ApiError(422, "COURSE_ACTIVITY_INCOMPLETE", "Add activity content before submitting the course.");
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(422, "INVALID_ACTIVITY", "Activity content must be an object.");
  const input = value as Record<string, unknown>;
  if (type === "quiz" && input.kind === "quiz") {
    if (!Array.isArray(input.questions) || input.questions.length > 20 || (complete && input.questions.length === 0))
      throw new ApiError(422, "INVALID_QUIZ", "Add 1–20 quiz questions.");
    const questions = input.questions.map((question) => {
      if (!question || typeof question !== "object" || Array.isArray(question)) throw new ApiError(422, "INVALID_QUIZ", "Invalid question.");
      const item = question as Record<string, unknown>;
      const prompt = typeof item.prompt === "string" ? item.prompt.trim() : "";
      if (prompt.length > 500 || (complete && !prompt)) throw new ApiError(422, "INVALID_QUIZ", "Enter a question of up to 500 characters.");
      if (item.type === "fill_blank") {
        const answer = typeof item.answer === "string" ? item.answer.trim() : "";
        if (answer.length > 300 || (complete && !answer))
          throw new ApiError(422, "INVALID_QUIZ", "Enter a fill-in-the-blank answer of up to 300 characters.");
        return { type: "fill_blank" as const, prompt, answer };
      }
      if (item.type !== undefined && item.type !== "multiple_choice")
        throw new ApiError(422, "INVALID_QUIZ", "Unsupported question type.");
      if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6 ||
        item.options.some((option) => typeof option !== "string" || option.trim().length > 300 || (complete && !option.trim())))
        throw new ApiError(422, "INVALID_QUIZ", "Each question needs 2–6 answer choices.");
      const correctIndex = Number(item.correctIndex);
      if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= item.options.length)
        throw new ApiError(422, "INVALID_QUIZ", "Select the correct answer for each question.");
      return { prompt, options: (item.options as string[]).map((option) => option.trim()), correctIndex };
    });
    const passingPercent = Number(input.passingPercent ?? 70);
    if (!Number.isInteger(passingPercent) || passingPercent < 1 || passingPercent > 100)
      throw new ApiError(422, "INVALID_QUIZ", "Passing score must be 1–100%.");
    return { kind: "quiz", questions, passingPercent };
  }
  if (type === "project" && input.kind === "assignment") {
    const instructions = typeof input.instructions === "string" ? input.instructions.trim() : "";
    if (instructions.length > 5000 || (complete && !instructions)) throw new ApiError(422, "INVALID_ASSIGNMENT", "Add assignment instructions of up to 5,000 characters.");
    return { kind: "assignment", instructions };
  }
  if (type === "reading" && input.kind === "resource") {
    const label = typeof input.label === "string" ? input.label.trim() : "";
    const url = typeof input.url === "string" ? input.url.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    if (label.length > 200 || description.length > 2000 || url.length > 2000 || (complete && (!label || !url)))
      throw new ApiError(422, "INVALID_RESOURCE", "Add a resource name and HTTPS link.");
    if (url) {
      try { if (new URL(url).protocol !== "https:") throw new Error("protocol"); }
      catch { throw new ApiError(422, "INVALID_RESOURCE", "Resource links must use HTTPS."); }
    }
    return { kind: "resource", label, url, description };
  }
  throw new ApiError(422, "INVALID_ACTIVITY", "Activity content does not match the lesson type.");
}

export function readActivity(raw: unknown): LessonActivity | null {
  if (typeof raw !== "string" || !raw) return null;
  try { return JSON.parse(raw) as LessonActivity; }
  catch { return null; }
}

export function publicActivity(activity: LessonActivity | null): LessonActivity | null {
  if (activity?.kind !== "quiz") return activity;
  return { ...activity, questions: activity.questions.map((question) => question.type === "fill_blank"
    ? { type: "fill_blank" as const, prompt: question.prompt, answer: "" }
    : { prompt: question.prompt, options: question.options }) };
}

export function submitActivity(courseId: string, lessonId: string, user: SessionUser, response: unknown) {
  rateLimit(`lesson-submit:${user.id}:${lessonId}`, 20);
  const result = transaction((db) => {
    if (!db.prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('active','completed')").get(user.id, courseId))
      throw new ApiError(403, "NOT_ENROLLED", "Enroll before submitting an activity.");
    const lesson = db.prepare(`SELECT l.type,l.activity_json FROM lessons l JOIN course_sections s ON s.id=l.section_id
      JOIN courses c ON c.id=s.course_id WHERE l.id=? AND s.course_id=? AND l.status='published' AND c.status='published'`).get(lessonId, courseId);
    if (!lesson) throw new ApiError(404, "LESSON_NOT_FOUND", "This activity is unavailable.");
    const activity = readActivity(lesson.activity_json);
    if (activity?.kind === "quiz") {
      if (!Array.isArray(response) || response.length !== activity.questions.length)
        throw new ApiError(422, "INVALID_ANSWERS", "Answer every quiz question.");
      const answers = response as (number | string)[];
      if (answers.some((answer, index) => {
        const question = activity.questions[index];
        return question.type === "fill_blank"
          ? typeof answer !== "string" || !answer.trim() || answer.length > 300
          : !Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= question.options.length;
      })) throw new ApiError(422, "INVALID_ANSWERS", "Answer every question using the required format.");
      const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
      const right = answers.filter((answer, index) => {
        const question = activity.questions[index];
        return question.type === "fill_blank"
          ? normalize(answer as string) === normalize(question.answer)
          : answer === question.correctIndex;
      }).length;
      const scorePercent = Math.round(right / activity.questions.length * 100);
      const passed = scorePercent >= activity.passingPercent;
      db.prepare("INSERT INTO lesson_activity_submissions(id,user_id,lesson_id,response_json,score_percent,passed) VALUES(?,?,?,?,?,?)")
        .run(randomUUID(), user.id, lessonId, JSON.stringify(answers), scorePercent, passed ? 1 : 0);
      return { kind: "quiz" as const, scorePercent, passed, passingPercent: activity.passingPercent };
    }
    if (activity?.kind === "assignment") {
      if (typeof response !== "string" || response.trim().length < 10 || response.trim().length > 10_000)
        throw new ApiError(422, "INVALID_SUBMISSION", "Write an assignment response of 10–10,000 characters.");
      db.prepare("INSERT INTO lesson_activity_submissions(id,user_id,lesson_id,response_json,passed) VALUES(?,?,?,?,1)")
        .run(randomUUID(), user.id, lessonId, JSON.stringify(response.trim()));
      return { kind: "assignment" as const, passed: true };
    }
    throw new ApiError(422, "NOT_SUBMITTABLE", "This lesson does not accept submissions.");
  });
  const progress = result.passed ? updateProgress(courseId, lessonId, user, { completed: true }) : null;
  return { ...result, progress };
}
