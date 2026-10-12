import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

function dto(row: Record<string, unknown>) {
  return { id: String(row.id), slug: String(row.slug), title: String(row.title), description: String(row.description),
    eventType: String(row.event_type), scheduledAt: String(row.scheduled_at), status: String(row.status),
    price: Number(row.price_minor) / 100, registeredCount: Number(row.registered_count || 0),
    speaker: row.speaker_name ? { id: String(row.instructor_id), name: String(row.speaker_name) } : null,
    liveClassId: row.live_class_id ? String(row.live_class_id) : null };
}
const select = `SELECT e.*,u.name speaker_name,
  (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id=e.id) registered_count
  FROM events e LEFT JOIN users u ON u.id=e.instructor_id`;
export function listEvents() { return getDb().prepare(`${select} WHERE e.status='published' ORDER BY e.scheduled_at LIMIT 100`).all().map(dto); }
export function getEvent(slug: string) {
  const row = getDb().prepare(`${select} WHERE (e.slug=? OR e.id=?) AND e.status='published'`).get(slug, slug);
  if (!row) throw new ApiError(404, "EVENT_NOT_FOUND", "Event not found.");
  return dto(row);
}
export function registerEvent(slug: string, user: SessionUser) {
  return transaction((db) => {
    const row = db.prepare("SELECT id,price_minor FROM events WHERE slug=? AND status='published'").get(slug);
    if (!row) throw new ApiError(404, "EVENT_NOT_FOUND", "Event not found.");
    if (Number(row.price_minor) > 0) throw new ApiError(409, "PAYMENT_REQUIRED", "Registration for paid events requires a payment provider.");
    const eventId = String(row.id);
    db.prepare("INSERT OR IGNORE INTO event_registrations (id,event_id,user_id) VALUES (?,?,?)")
      .run(randomUUID(), eventId, user.id);
    const registration = db.prepare("SELECT id,created_at FROM event_registrations WHERE event_id=? AND user_id=?").get(eventId, user.id)!;
    return { id: String(registration.id), registeredAt: String(registration.created_at) };
  });
}

export function ownEventRegistration(slug: string, user: SessionUser) {
  const row = getDb().prepare(`SELECT r.id FROM event_registrations r JOIN events e ON e.id=r.event_id
    WHERE e.slug=? AND r.user_id=?`).get(slug, user.id);
  return { registered: Boolean(row), registrationId: row ? String(row.id) : null };
}

export function unregisterEvent(slug: string, user: SessionUser) {
  getDb().prepare(`DELETE FROM event_registrations WHERE user_id=? AND event_id=(SELECT id FROM events WHERE slug=?)`)
    .run(user.id, slug);
  return { registered: false };
}
