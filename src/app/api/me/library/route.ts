import { randomUUID } from "node:crypto";
import { ApiError, id, readJson, safe, text } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";

function ownedEnrollment(userId: string, courseId: string) {
  if (!getDb().prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('active','completed')").get(userId, courseId))
    throw new ApiError(404, "ENROLLMENT_NOT_FOUND", "This course is not in your learning library.");
}

function ownedList(userId: string, listId: string) {
  if (!getDb().prepare("SELECT 1 FROM learner_lists WHERE user_id=? AND id=?").get(userId, listId))
    throw new ApiError(404, "LIST_NOT_FOUND", "List not found.");
}

function weekStart(date: Date) {
  const indiaOffset = 330 * 60000;
  const local = new Date(date.getTime() + indiaOffset);
  const day = local.getUTCDay();
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - ((day + 6) % 7)) - indiaOffset;
}

export async function GET() {
  return safe(async () => {
    const user = await requireAuth();
    const db = getDb();
    const lists = db.prepare("SELECT id,name FROM learner_lists WHERE user_id=? ORDER BY created_at DESC").all(user.id)
      .map((row) => ({ id: String(row.id), name: String(row.name), courseIds: db.prepare("SELECT course_id FROM learner_list_courses WHERE list_id=? ORDER BY added_at DESC").all(String(row.id)).map((item) => String(item.course_id)) }));
    const archivedCourseIds = db.prepare("SELECT course_id FROM learner_archives WHERE user_id=?").all(user.id).map((row) => String(row.course_id));
    const completedAt = db.prepare("SELECT completed_at FROM lesson_progress WHERE user_id=? AND completed=1 AND completed_at IS NOT NULL").all(user.id);
    const counts = new Map<number, number>();
    for (const row of completedAt) {
      const time = Date.parse(String(row.completed_at));
      if (Number.isNaN(time)) continue;
      const key = weekStart(new Date(time));
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const currentWeek = weekStart(new Date());
    const weeklyGoal = 3;
    let cursor = currentWeek;
    if ((counts.get(cursor) || 0) < weeklyGoal) cursor -= 7 * 86400000;
    let streakWeeks = 0;
    while ((counts.get(cursor) || 0) >= weeklyGoal) { streakWeeks++; cursor -= 7 * 86400000; }
    return { lists, archivedCourseIds, weekly: { completedLessons: counts.get(currentWeek) || 0, goal: weeklyGoal, streakWeeks } };
  });
}

export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    const db = getDb();
    switch (body.action) {
      case "create-list": {
        const name = text(body.name, "List name", 1, 60);
        if (Number(db.prepare("SELECT COUNT(*) count FROM learner_lists WHERE user_id=?").get(user.id)?.count || 0) >= 20)
          throw new ApiError(409, "LIST_LIMIT", "You can create up to 20 lists.");
        const listId = randomUUID();
        db.prepare("INSERT INTO learner_lists(id,user_id,name) VALUES (?,?,?)").run(listId, user.id, name);
        return { listId };
      }
      case "rename-list": {
        const listId = id(String(body.listId || ""));
        ownedList(user.id, listId);
        db.prepare("UPDATE learner_lists SET name=? WHERE id=?").run(text(body.name, "List name", 1, 60), listId);
        return { listId };
      }
      case "delete-list": {
        const listId = id(String(body.listId || ""));
        ownedList(user.id, listId);
        db.prepare("DELETE FROM learner_lists WHERE id=?").run(listId);
        return { listId };
      }
      case "add-to-list":
      case "remove-from-list": {
        const listId = id(String(body.listId || ""));
        const courseId = id(String(body.courseId || ""));
        ownedList(user.id, listId);
        ownedEnrollment(user.id, courseId);
        if (body.action === "add-to-list") db.prepare("INSERT OR IGNORE INTO learner_list_courses(list_id,course_id) VALUES (?,?)").run(listId, courseId);
        else db.prepare("DELETE FROM learner_list_courses WHERE list_id=? AND course_id=?").run(listId, courseId);
        return { listId, courseId };
      }
      case "archive":
      case "unarchive": {
        const courseId = id(String(body.courseId || ""));
        ownedEnrollment(user.id, courseId);
        if (body.action === "archive") db.prepare("INSERT OR IGNORE INTO learner_archives(user_id,course_id) VALUES (?,?)").run(user.id, courseId);
        else db.prepare("DELETE FROM learner_archives WHERE user_id=? AND course_id=?").run(user.id, courseId);
        return { courseId };
      }
      default: throw new ApiError(422, "INVALID_ACTION", "Choose a valid library action.");
    }
  });
}
