import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError, number, optionalText, text } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

type Row = Record<string, unknown>;
function liveDto(row: Row, includeMeeting = false) {
  return {
    id: String(row.id), courseId: row.course_id ? String(row.course_id) : null,
    courseTitle: row.course_title ? String(row.course_title) : null,
    activeParticipants: Number(row.active_participants || 0),
    instructor: { id: String(row.instructor_id), name: String(row.instructor_name) },
    title: String(row.title), description: String(row.description), scheduledAt: String(row.scheduled_at),
    durationMinutes: Number(row.duration_minutes), status: String(row.status),
    provider: row.provider ? String(row.provider) : null, providerReady: Boolean(row.meeting_reference),
    ...(includeMeeting ? { meetingUrl: row.meeting_reference ? String(row.meeting_reference) : null } : {}),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}
const liveSelect = `SELECT l.*,u.name instructor_name,c.title course_title,
  (SELECT COUNT(*) FROM live_participants p WHERE p.live_class_id=l.id AND p.left_at IS NULL) active_participants
  FROM live_classes l JOIN users u ON u.id=l.instructor_id LEFT JOIN courses c ON c.id=l.course_id`;

export function listLiveClasses() {
  return getDb().prepare(`${liveSelect} WHERE l.status IN ('scheduled','live') ORDER BY l.scheduled_at LIMIT 100`).all().map((row) => liveDto(row));
}

export function getLiveClass(id: string) {
  const row = getDb().prepare(`${liveSelect} WHERE l.id=? AND l.status!='cancelled'`).get(id);
  if (!row) throw new ApiError(404, "LIVE_CLASS_NOT_FOUND", "This live class is unavailable.");
  return liveDto(row);
}

function ownedClass(id: string, user: SessionUser): Row {
  const row = getDb().prepare("SELECT * FROM live_classes WHERE id=?").get(id);
  if (!row) throw new ApiError(404, "LIVE_CLASS_NOT_FOUND", "Live class not found.");
  if (user.role !== "admin" && row.instructor_id !== user.id) throw new ApiError(403, "FORBIDDEN", "You can manage only your own live classes.");
  return row;
}

export function listOwnLiveClasses(user: SessionUser) {
  return getDb().prepare(`${liveSelect} ${user.role === "admin" ? "" : "WHERE l.instructor_id=?"} ORDER BY l.scheduled_at DESC`)
    .all(...(user.role === "admin" ? [] : [user.id])).map((row) => liveDto(row, true));
}

function meetingUrlInput(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const raw = text(value, "Meeting link", 1, 2048);
  let url: URL;
  try { url = new URL(raw); } catch { throw new ApiError(422, "INVALID_MEETING_URL", "Enter a valid HTTPS meeting link."); }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
    throw new ApiError(422, "INVALID_MEETING_URL", "Enter a valid HTTPS meeting link.");
  }
  return url.toString();
}

function dateInput(value: unknown): string {
  const input = text(value, "Scheduled date", 10, 50);
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) throw new ApiError(422, "INVALID_DATE", "Provide a valid scheduled date.");
  return date.toISOString();
}

export function createLiveClass(user: SessionUser, body: Record<string, unknown>) {
  const title = text(body.title, "Title", 3, 200);
  const scheduled = dateInput(body.scheduledAt);
  const duration = number(body.durationMinutes, "Duration", 1, 1440);
  if (!Number.isInteger(duration)) throw new ApiError(422, "INVALID_DURATION", "Duration must be whole minutes.");
  const courseId = body.courseId === undefined || body.courseId === null ? null : text(body.courseId, "Course ID", 1, 100);
  const meetingUrl = meetingUrlInput(body.meetingUrl);
  if (courseId) {
    const course = getDb().prepare("SELECT instructor_id FROM courses WHERE id=?").get(courseId);
    if (!course) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    if (user.role !== "admin" && course.instructor_id !== user.id) throw new ApiError(403, "FORBIDDEN", "You can schedule only your own course.");
  }
  const id = randomUUID();
  getDb().prepare(`INSERT INTO live_classes
    (id,course_id,instructor_id,title,description,scheduled_at,duration_minutes,status,provider,meeting_reference)
    VALUES (?,?,?,?,?,?,?,'scheduled',?,?)`).run(id, courseId, user.id, title,
    optionalText(body.description, "Description", 5000) || "", scheduled, duration, meetingUrl ? "external" : null, meetingUrl);
  return liveDto(getDb().prepare(`${liveSelect} WHERE l.id=?`).get(id)!, true);
}

export function updateLiveClass(id: string, user: SessionUser, body: Record<string, unknown>) {
  const prior = ownedClass(id, user);
  const rescheduling = prior.status === "cancelled" && body.status === "scheduled";
  if (prior.status === "ended" || (prior.status === "cancelled" && !rescheduling)) {
    throw new ApiError(409, "CLASS_CLOSED", "A closed class cannot be edited.");
  }
  if (rescheduling && (body.scheduledAt === undefined || new Date(dateInput(body.scheduledAt)).getTime() <= Date.now())) {
    throw new ApiError(422, "INVALID_DATE", "Choose a future date when rescheduling a cancelled class.");
  }
  const updates: string[] = [];
  const values: Array<string | number> = [];
  if (body.title !== undefined) { updates.push("title=?"); values.push(text(body.title, "Title", 3, 200)); }
  if (body.description !== undefined) { updates.push("description=?"); values.push(text(body.description, "Description", 0, 5000)); }
  if (body.scheduledAt !== undefined) { updates.push("scheduled_at=?"); values.push(dateInput(body.scheduledAt)); }
  if (body.durationMinutes !== undefined) {
    const duration = number(body.durationMinutes, "Duration", 1, 1440);
    if (!Number.isInteger(duration)) throw new ApiError(422, "INVALID_DURATION", "Duration must be whole minutes.");
    updates.push("duration_minutes=?"); values.push(duration);
  }
  if (body.meetingUrl !== undefined) {
    const meetingUrl = meetingUrlInput(body.meetingUrl);
    updates.push("provider=?", "meeting_reference=?"); values.push(meetingUrl ? "external" : "", meetingUrl || "");
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    const allowed = prior.status === "scheduled" ? ["live", "cancelled"]
      : prior.status === "cancelled" ? ["scheduled"] : ["ended", "cancelled"];
    if (!allowed.includes(status)) throw new ApiError(409, "INVALID_TRANSITION", "This class status change is not allowed.");
    if (status === "live" && !prior.meeting_reference && !body.meetingUrl) {
      throw new ApiError(409, "MEETING_LINK_REQUIRED", "Add a meeting link before starting this class.");
    }
    updates.push("status=?"); values.push(status);
  }
  if (!updates.length) throw new ApiError(422, "NO_CHANGES", "No editable fields were provided.");
  getDb().prepare(`UPDATE live_classes SET ${updates.join(",")},updated_at=? WHERE id=?`)
    .run(...values, new Date().toISOString(), id);
  return liveDto(getDb().prepare(`${liveSelect} WHERE l.id=?`).get(id)!, true);
}

function canAttend(row: Row, user: SessionUser): boolean {
  if (user.role === "admin" || row.instructor_id === user.id) return true;
  if (getDb().prepare(`SELECT 1 FROM bootcamp_sessions s JOIN bootcamp_registrations r ON r.bootcamp_id=s.bootcamp_id
    WHERE s.live_class_id=? AND r.user_id=?`).get(String(row.id), user.id)) return true;
  if (!row.course_id) return true;
  return Boolean(getDb().prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('active','completed')")
    .get(user.id, String(row.course_id)));
}

export function joinClass(id: string, user: SessionUser) {
  return transaction((db) => {
    const row = db.prepare("SELECT * FROM live_classes WHERE id=?").get(id);
    if (!row || row.status !== "live") throw new ApiError(409, "CLASS_NOT_LIVE", "This classroom is not live.");
    if (!canAttend(row, user)) throw new ApiError(403, "NOT_ELIGIBLE", "Enroll in the linked course before joining this class.");
    const role = row.instructor_id === user.id ? "instructor" : "participant";
    db.prepare("INSERT OR IGNORE INTO live_participants (id,live_class_id,user_id,role) VALUES (?,?,?,?)")
      .run(randomUUID(), id, user.id, role);
    const active = Number(db.prepare("SELECT COUNT(*) total FROM live_participants WHERE live_class_id=? AND left_at IS NULL")
      .get(id)?.total || 0);
    return { classId: id, role, activeParticipants: active, providerReady: Boolean(row.meeting_reference),
      meetingUrl: row.meeting_reference ? String(row.meeting_reference) : null,
      access: row.meeting_reference ? "external_meeting" : "meeting_not_configured" };
  });
}

export function leaveClass(id: string, user: SessionUser) {
  getDb().prepare("UPDATE live_participants SET left_at=? WHERE live_class_id=? AND user_id=? AND left_at IS NULL")
    .run(new Date().toISOString(), id, user.id);
  return { left: true };
}

export function ownReminder(id: string, user: SessionUser) {
  const row = getDb().prepare("SELECT id FROM live_reminders WHERE live_class_id=? AND user_id=?").get(id, user.id);
  return { reminderSet: Boolean(row), delivery: "pending_provider" };
}
export function setReminder(id: string, user: SessionUser) {
  const row = getDb().prepare("SELECT status FROM live_classes WHERE id=?").get(id);
  if (!row || row.status !== "scheduled") throw new ApiError(409, "CLASS_NOT_UPCOMING", "Only upcoming classes can have reminders.");
  getDb().prepare("INSERT OR IGNORE INTO live_reminders (id,live_class_id,user_id) VALUES (?,?,?)")
    .run(randomUUID(), id, user.id);
  return { reminderSet: true, delivery: "pending_provider" };
}
export function removeReminder(id: string, user: SessionUser) {
  getDb().prepare("DELETE FROM live_reminders WHERE live_class_id=? AND user_id=?").run(id, user.id);
  return { reminderSet: false, delivery: "pending_provider" };
}

function requireActiveParticipant(id: string, user: SessionUser) {
  const row = getDb().prepare("SELECT * FROM live_classes WHERE id=? AND status='live'").get(id);
  if (!row || !canAttend(row, user)) throw new ApiError(403, "NOT_ELIGIBLE", "You cannot access this classroom.");
  if (!getDb().prepare("SELECT 1 FROM live_participants WHERE live_class_id=? AND user_id=? AND left_at IS NULL")
    .get(id, user.id)) throw new ApiError(403, "NOT_JOINED", "Join the classroom first.");
}

export function getMessages(id: string, user: SessionUser) {
  requireActiveParticipant(id, user);
  return { delivery: "stored_only", items: getDb().prepare(`SELECT m.id,m.body,m.created_at,u.id user_id,u.name user_name
    FROM live_messages m JOIN users u ON u.id=m.user_id
    WHERE m.live_class_id=? AND m.deleted_at IS NULL ORDER BY m.created_at DESC LIMIT 100`).all(id).reverse().map((row) => ({
      id: String(row.id), body: String(row.body), createdAt: String(row.created_at),
      author: { id: String(row.user_id), name: String(row.user_name) },
    })) };
}

export function sendMessage(id: string, user: SessionUser, body: Record<string, unknown>) {
  requireActiveParticipant(id, user);
  const message = text(body.message, "Message", 1, 2000);
  const messageId = randomUUID();
  getDb().prepare("INSERT INTO live_messages (id,live_class_id,user_id,body) VALUES (?,?,?,?)")
    .run(messageId, id, user.id, message);
  return { id: messageId, body: message, author: { id: user.id, name: user.name }, delivery: "stored_only" };
}

export function moderateMessage(classId: string, messageId: string, user: SessionUser) {
  ownedClass(classId, user);
  const result = getDb().prepare("UPDATE live_messages SET deleted_at=? WHERE id=? AND live_class_id=?")
    .run(new Date().toISOString(), messageId, classId);
  if (!result.changes) throw new ApiError(404, "MESSAGE_NOT_FOUND", "Message not found.");
  return { removed: true };
}
