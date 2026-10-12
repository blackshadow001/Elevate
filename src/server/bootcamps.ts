import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError, number, optionalText, text } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

type Row = Record<string, unknown>;
const select = `SELECT b.*,u.name instructor_name,
  (SELECT COUNT(*) FROM bootcamp_registrations r WHERE r.bootcamp_id=b.id) registered_count
  FROM bootcamps b JOIN users u ON u.id=b.instructor_id`;
function date(value: unknown, field: string) {
  const input = text(value, field, 10, 50);
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) throw new ApiError(422, "INVALID_DATE", `${field} must be a valid date.`);
  return parsed.toISOString();
}
function dto(row: Row) {
  const sessions = getDb().prepare(`SELECT s.id,s.title,s.description,s.duration_minutes,s.assignment_title,s.session_date,s.position,s.live_class_id,l.status live_class_status
    FROM bootcamp_sessions s LEFT JOIN live_classes l ON l.id=s.live_class_id WHERE s.bootcamp_id=? ORDER BY s.position`)
    .all(String(row.id)).map((session) => ({
      id: String(session.id), title: String(session.title), description: String(session.description || ""),
      durationMinutes: Number(session.duration_minutes), assignmentTitle: session.assignment_title ? String(session.assignment_title) : null,
      sessionDate: String(session.session_date),
      position: Number(session.position), liveClassId: session.live_class_id ? String(session.live_class_id) : null,
      liveClassStatus: session.live_class_status ? String(session.live_class_status) : null,
    }));
  return { id: String(row.id), slug: String(row.slug), title: String(row.title), description: String(row.description),
    status: String(row.status), startDate: String(row.start_date), endDate: String(row.end_date),
    registeredCount: Number(row.registered_count || 0),
    instructor: { id: String(row.instructor_id), name: String(row.instructor_name) }, sessions };
}
export function listBootcamps() {
  return getDb().prepare(`${select} WHERE b.status='published' ORDER BY b.start_date LIMIT 100`).all().map(dto);
}
export function getBootcamp(slug: string) {
  const row = getDb().prepare(`${select} WHERE (b.slug=? OR b.id=?) AND b.status='published'`).get(slug, slug);
  if (!row) throw new ApiError(404, "BOOTCAMP_NOT_FOUND", "Bootcamp not found.");
  return dto(row);
}
function ownedBootcamp(id: string, user: SessionUser) {
  const row = getDb().prepare(`${select} WHERE b.id=?`).get(id);
  if (!row) throw new ApiError(404, "BOOTCAMP_NOT_FOUND", "Bootcamp not found.");
  if (user.role !== "admin" && row.instructor_id !== user.id) throw new ApiError(403, "FORBIDDEN", "You can manage only your own bootcamps.");
  return row;
}
export function listOwnBootcamps(user: SessionUser) {
  return getDb().prepare(`${select} ${user.role === "admin" ? "" : "WHERE b.instructor_id=?"} ORDER BY b.updated_at DESC`)
    .all(...(user.role === "admin" ? [] : [user.id])).map(dto);
}
export function createBootcamp(user: SessionUser, body: Record<string, unknown>) {
  const title = text(body.title, "Title", 3, 200);
  const slug = text(body.slug, "Slug", 3, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ApiError(422, "INVALID_SLUG", "Use lowercase words separated by hyphens.");
  const start = date(body.startDate, "Start date");
  const end = date(body.endDate, "End date");
  if (end < start) throw new ApiError(422, "INVALID_DATE", "End date must follow start date.");
  if (getDb().prepare("SELECT 1 FROM bootcamps WHERE slug=?").get(slug)) throw new ApiError(409, "SLUG_EXISTS", "Bootcamp slug is already used.");
  const id = randomUUID();
  getDb().prepare(`INSERT INTO bootcamps (id,title,slug,description,instructor_id,start_date,end_date)
    VALUES (?,?,?,?,?,?,?)`).run(id, title, slug, optionalText(body.description, "Description", 10_000) || "", user.id, start, end);
  return dto(ownedBootcamp(id, user));
}
export function updateBootcamp(id: string, user: SessionUser, body: Record<string, unknown>) {
  const prior = ownedBootcamp(id, user);
  const updates: string[] = [];
  const values: Array<string> = [];
  if (body.title !== undefined) { updates.push("title=?"); values.push(text(body.title, "Title", 3, 200)); }
  if (body.description !== undefined) { updates.push("description=?"); values.push(text(body.description, "Description", 0, 10_000)); }
  if (body.startDate !== undefined) { updates.push("start_date=?"); values.push(date(body.startDate, "Start date")); }
  if (body.endDate !== undefined) { updates.push("end_date=?"); values.push(date(body.endDate, "End date")); }
  const start = values[updates.indexOf("start_date=?")] || String(prior.start_date);
  const end = values[updates.indexOf("end_date=?")] || String(prior.end_date);
  if (end < start) throw new ApiError(422, "INVALID_DATE", "End date must follow start date.");
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!["draft", "published", "archived"].includes(status)) throw new ApiError(422, "INVALID_STATUS", "Invalid bootcamp status.");
    if (status === "published" && !getDb().prepare("SELECT 1 FROM bootcamp_sessions WHERE bootcamp_id=?").get(id)) {
      throw new ApiError(422, "BOOTCAMP_INCOMPLETE", "Add a session before publishing.");
    }
    updates.push("status=?"); values.push(status);
  }
  if (!updates.length) throw new ApiError(422, "NO_CHANGES", "No editable fields were provided.");
  getDb().prepare(`UPDATE bootcamps SET ${updates.join(",")},updated_at=? WHERE id=?`)
    .run(...values, new Date().toISOString(), id);
  return dto(ownedBootcamp(id, user));
}
function validClass(liveClassId: unknown, user: SessionUser): string | null {
  if (liveClassId === undefined || liveClassId === null) return null;
  const id = text(liveClassId, "Live class ID", 1, 100);
  const row = getDb().prepare("SELECT instructor_id FROM live_classes WHERE id=?").get(id);
  if (!row) throw new ApiError(404, "LIVE_CLASS_NOT_FOUND", "Linked live class not found.");
  if (user.role !== "admin" && row.instructor_id !== user.id) throw new ApiError(403, "FORBIDDEN", "Link only your own live class.");
  return id;
}
export function addSession(bootcampId: string, user: SessionUser, body: Record<string, unknown>) {
  ownedBootcamp(bootcampId, user);
  const title = text(body.title, "Session title", 1, 200);
  const sessionDate = date(body.sessionDate, "Session date");
  const liveClassId = validClass(body.liveClassId, user);
  const durationMinutes = body.durationMinutes === undefined ? 90 : number(body.durationMinutes, "Duration", 1, 1440);
  if (!Number.isInteger(durationMinutes)) throw new ApiError(422, "INVALID_DURATION", "Duration must be whole minutes.");
  const description = optionalText(body.description, "Description", 5000) || "";
  const assignmentTitle = optionalText(body.assignmentTitle, "Assignment title", 200) || null;
  return transaction((db) => {
    const position = Number(db.prepare("SELECT COALESCE(MAX(position)+1,0) position FROM bootcamp_sessions WHERE bootcamp_id=?").get(bootcampId)?.position);
    const id = randomUUID();
    db.prepare("INSERT INTO bootcamp_sessions (id,bootcamp_id,live_class_id,title,description,duration_minutes,assignment_title,session_date,position) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(id, bootcampId, liveClassId, title, description, durationMinutes, assignmentTitle, sessionDate, position);
    return { id, title, description, durationMinutes, assignmentTitle, sessionDate, liveClassId, position };
  });
}
export function updateSession(bootcampId: string, sessionId: string, user: SessionUser, body: Record<string, unknown>) {
  ownedBootcamp(bootcampId, user);
  if (!getDb().prepare("SELECT 1 FROM bootcamp_sessions WHERE id=? AND bootcamp_id=?").get(sessionId, bootcampId)) {
    throw new ApiError(404, "SESSION_NOT_FOUND", "Bootcamp session not found.");
  }
  const updates: string[] = [];
  const values: Array<string | number | null> = [];
  if (body.title !== undefined) { updates.push("title=?"); values.push(text(body.title, "Session title", 1, 200)); }
  if (body.description !== undefined) { updates.push("description=?"); values.push(text(body.description, "Description", 0, 5000)); }
  if (body.assignmentTitle !== undefined) { updates.push("assignment_title=?"); values.push(optionalText(body.assignmentTitle, "Assignment title", 200) || null); }
  if (body.durationMinutes !== undefined) {
    const duration = number(body.durationMinutes, "Duration", 1, 1440);
    if (!Number.isInteger(duration)) throw new ApiError(422, "INVALID_DURATION", "Duration must be whole minutes.");
    updates.push("duration_minutes=?"); values.push(duration);
  }
  if (body.sessionDate !== undefined) { updates.push("session_date=?"); values.push(date(body.sessionDate, "Session date")); }
  if (body.liveClassId !== undefined) { updates.push("live_class_id=?"); values.push(validClass(body.liveClassId, user)); }
  if (!updates.length) throw new ApiError(422, "NO_CHANGES", "No editable fields were provided.");
  getDb().prepare(`UPDATE bootcamp_sessions SET ${updates.join(",")} WHERE id=?`).run(...values, sessionId);
  return { updated: true };
}
export function deleteSession(bootcampId: string, sessionId: string, user: SessionUser) {
  ownedBootcamp(bootcampId, user);
  return transaction((db) => {
    const result = db.prepare("DELETE FROM bootcamp_sessions WHERE id=? AND bootcamp_id=?").run(sessionId, bootcampId);
    if (!result.changes) throw new ApiError(404, "SESSION_NOT_FOUND", "Bootcamp session not found.");
    const rows = db.prepare("SELECT id FROM bootcamp_sessions WHERE bootcamp_id=? ORDER BY position").all(bootcampId);
    db.prepare("UPDATE bootcamp_sessions SET position=position+100000 WHERE bootcamp_id=?").run(bootcampId);
    rows.forEach((row, position) => db.prepare("UPDATE bootcamp_sessions SET position=? WHERE id=?").run(position, String(row.id)));
    return { deleted: true };
  });
}
export function reorderSessions(bootcampId: string, user: SessionUser, orderedIds: unknown) {
  ownedBootcamp(bootcampId, user);
  if (!Array.isArray(orderedIds) || !orderedIds.every((item) => typeof item === "string")) throw new ApiError(422, "INVALID_ORDER", "Provide ordered session IDs.");
  const rows = getDb().prepare("SELECT id FROM bootcamp_sessions WHERE bootcamp_id=?").all(bootcampId);
  if (rows.length !== orderedIds.length || new Set(orderedIds).size !== rows.length || rows.some((row) => !orderedIds.includes(String(row.id)))) {
    throw new ApiError(422, "INVALID_ORDER", "Order must contain every session once.");
  }
  return transaction((db) => {
    db.prepare("UPDATE bootcamp_sessions SET position=position+100000 WHERE bootcamp_id=?").run(bootcampId);
    orderedIds.forEach((id, position) => db.prepare("UPDATE bootcamp_sessions SET position=? WHERE id=?").run(position, id));
    return { orderedIds };
  });
}
export function registerBootcamp(bootcampId: string, user: SessionUser) {
  return transaction((db) => {
    const bootcamp = db.prepare("SELECT status FROM bootcamps WHERE id=?").get(bootcampId);
    if (!bootcamp || bootcamp.status !== "published") throw new ApiError(404, "BOOTCAMP_NOT_FOUND", "Bootcamp not found.");
    db.prepare("INSERT OR IGNORE INTO bootcamp_registrations (id,bootcamp_id,user_id) VALUES (?,?,?)")
      .run(randomUUID(), bootcampId, user.id);
    const row = db.prepare("SELECT id,created_at FROM bootcamp_registrations WHERE bootcamp_id=? AND user_id=?").get(bootcampId, user.id)!;
    return { id: String(row.id), registeredAt: String(row.created_at) };
  });
}

export function ownBootcampRegistration(slug: string, user: SessionUser) {
  const row = getDb().prepare(`SELECT r.id FROM bootcamp_registrations r JOIN bootcamps b ON b.id=r.bootcamp_id
    WHERE b.slug=? AND r.user_id=?`).get(slug, user.id);
  return { registered: Boolean(row), registrationId: row ? String(row.id) : null };
}

export function unregisterBootcamp(slug: string, user: SessionUser) {
  getDb().prepare(`DELETE FROM bootcamp_registrations WHERE user_id=? AND bootcamp_id=(SELECT id FROM bootcamps WHERE slug=?)`)
    .run(user.id, slug);
  return { registered: false };
}
