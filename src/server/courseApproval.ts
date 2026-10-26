import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

type Row = Record<string, unknown>;
export type ReviewAction = "approve" | "reject" | "publish" | "unpublish";

function whole(value: unknown, label: string, max = 100_000_000): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > max)
    throw new ApiError(422, "INVALID_PRICING", `${label} must be a non-negative whole number.`);
  return value;
}

export function finalPriceMinor(base: number, marginBps: number): number {
  return base + Math.round(base * marginBps / 10_000);
}

export function pricingForCourse(courseId: string) {
  const row = getDb().prepare("SELECT * FROM course_pricing WHERE course_id=?").get(courseId) as Row | undefined;
  if (!row) return null;
  const base = row.base_price_minor === null ? null : Number(row.base_price_minor);
  const proposedMargin = row.proposed_margin_bps === null ? null : Number(row.proposed_margin_bps);
  const approvedMargin = row.approved_margin_bps === null ? null : Number(row.approved_margin_bps);
  return {
    basePriceMinor: base, currency: String(row.currency),
    minMarginBps: Number(row.min_margin_bps), maxMarginBps: Number(row.max_margin_bps),
    maxFinalMinor: row.max_final_minor === null ? null : Number(row.max_final_minor),
    proposedMarginBps: proposedMargin, proposedFinalMinor: row.proposed_final_minor === null ? null : Number(row.proposed_final_minor),
    approvedMarginBps: approvedMargin,
    finalPriceMinor: base !== null && approvedMargin !== null ? finalPriceMinor(base, approvedMargin) : null,
    status: String(row.pricing_status), updatedAt: String(row.updated_at),
  };
}

function history(db: ReturnType<typeof getDb>, courseId: string, actorId: string, action: string, feedback = "", changes: Record<string, unknown> = {}) {
  db.prepare("INSERT INTO course_approval_history(id,course_id,actor_id,action,feedback,change_json) VALUES (?,?,?,?,?,?)")
    .run(randomUUID(), courseId, actorId, action, feedback, JSON.stringify(changes));
}

export function proposal(courseId: string, user: SessionUser, body: Record<string, unknown>) {
  const db = getDb();
  const course = db.prepare("SELECT instructor_id,status FROM courses WHERE id=?").get(courseId);
  if (!course || course.instructor_id !== user.id) throw new ApiError(403, "FORBIDDEN", "You can change only your own proposal.");
  if (course.status === "published") throw new ApiError(409, "REVIEW_REQUIRED", "Published courses must be unpublished by an admin before editing.");
  const policy = pricingForCourse(courseId);
  if (body.marginBps !== undefined) {
    const margin = whole(body.marginBps, "Tutor margin", 10_000);
    if (!policy || policy.basePriceMinor === null) throw new ApiError(409, "POLICY_REQUIRED", "An admin must set a base price before you can propose a margin.");
    if (margin < policy.minMarginBps || margin > policy.maxMarginBps) throw new ApiError(422, "MARGIN_OUT_OF_RANGE", "Tutor margin is outside the admin-approved range.");
    const final = finalPriceMinor(policy.basePriceMinor, margin);
    if (policy.maxFinalMinor !== null && final > policy.maxFinalMinor) throw new ApiError(422, "PRICE_CAP", "The proposed price exceeds the admin cap.");
    db.prepare(`UPDATE course_pricing SET proposed_margin_bps=?,proposed_final_minor=?,pricing_status='pending',updated_by=?,updated_at=? WHERE course_id=?`)
      .run(margin, final, user.id, new Date().toISOString(), courseId);
  } else if (body.price !== undefined) {
    const amount = body.price;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 1_000_000 ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) throw new ApiError(422, "INVALID_PRICE", "Proposed price must be in INR with two decimals.");
    if (policy?.basePriceMinor !== null && policy?.basePriceMinor !== undefined)
      throw new ApiError(422, "MARGIN_REQUIRED", "Propose a margin within the admin policy instead of a direct price.");
    db.prepare(`INSERT INTO course_pricing(course_id,proposed_final_minor,updated_by) VALUES (?,?,?)
      ON CONFLICT(course_id) DO UPDATE SET proposed_final_minor=excluded.proposed_final_minor,pricing_status='pending',updated_by=excluded.updated_by,updated_at=?`)
      .run(courseId, Math.round(amount * 100), user.id, new Date().toISOString());
  }
}

export function markRevision(courseId: string, user: SessionUser) {
  const db = getDb();
  const row = db.prepare("SELECT review_status FROM courses WHERE id=?").get(courseId);
  if (row?.review_status !== "draft") {
    db.prepare("UPDATE courses SET review_status='draft',updated_at=? WHERE id=?").run(new Date().toISOString(), courseId);
    history(db, courseId, user.id, "revision");
  }
}

export function adminCourseList(filters: { search?: string; courseId?: string; status?: string; tutorId?: string; category?: string;
  minPriceMinor?: number; maxPriceMinor?: number; updatedFrom?: string; updatedTo?: string;
  sort?: "updated_desc" | "updated_asc" | "price_asc" | "price_desc" | "title_asc"; page?: number; pageSize?: number } = {}) {
  const db = getDb();
  const where = ["1=1"];
  const values: Array<string | number> = [];
  if (filters.courseId) { where.push("c.id=?"); values.push(filters.courseId); }
  if (filters.search) {
    const query = `%${filters.search.replace(/[\\%_]/g, "\\$&")}%`;
    where.push("(c.title LIKE ? ESCAPE '\\' OR u.name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\' OR c.category LIKE ? ESCAPE '\\')");
    values.push(query, query, query, query);
  }
  if (filters.status) { where.push("(c.review_status=? OR c.status=?)"); values.push(filters.status, filters.status); }
  if (filters.tutorId) { where.push("c.instructor_id=?"); values.push(filters.tutorId); }
  if (filters.category) { where.push("c.category=?"); values.push(filters.category); }
  if (filters.minPriceMinor !== undefined) { where.push("c.price_minor>=?"); values.push(filters.minPriceMinor); }
  if (filters.maxPriceMinor !== undefined) { where.push("c.price_minor<=?"); values.push(filters.maxPriceMinor); }
  if (filters.updatedFrom) { where.push("c.updated_at>=?"); values.push(`${filters.updatedFrom}T00:00:00.000Z`); }
  if (filters.updatedTo) { where.push("c.updated_at<=?"); values.push(`${filters.updatedTo}T23:59:59.999Z`); }
  const sort = { updated_desc: "c.updated_at DESC", updated_asc: "c.updated_at ASC", price_asc: "c.price_minor ASC",
    price_desc: "c.price_minor DESC", title_asc: "c.title COLLATE NOCASE ASC" }[filters.sort || "updated_desc"];
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 25;
  const from = "courses c JOIN users u ON u.id=c.instructor_id";
  const clause = where.join(" AND ");
  const total = Number(db.prepare(`SELECT COUNT(*) n FROM ${from} WHERE ${clause}`).get(...values)?.n || 0);
  const rows = db.prepare(`SELECT c.id,c.slug,c.title,c.category,c.thumbnail,c.status,c.review_status,c.price_minor,c.currency,c.updated_at,
    u.id instructor_id,u.name instructor_name,u.email instructor_email
    FROM ${from} WHERE ${clause} ORDER BY ${sort},c.id LIMIT ? OFFSET ?`)
    .all(...values, pageSize, (page - 1) * pageSize);
  return { items: rows.map((row) => ({ ...row, pricing: pricingForCourse(String(row.id)) })), total, page, pageSize };
}

export function adminCourseDetail(courseId: string) {
  const db = getDb();
  const row = db.prepare("SELECT status FROM courses WHERE id=?").get(courseId);
  if (!row) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
  const events = db.prepare(`SELECT h.id,h.action,h.feedback,h.change_json,h.created_at,u.name actor_name FROM course_approval_history h
    JOIN users u ON u.id=h.actor_id WHERE h.course_id=? ORDER BY h.created_at DESC`).all(courseId);
  return { rawStatus: String(row.status), pricing: pricingForCourse(courseId), history: events };
}

export function adminSetPricing(courseId: string, admin: SessionUser, body: Record<string, unknown>) {
  return transaction((db) => {
    const course = db.prepare("SELECT status,price_minor FROM courses WHERE id=?").get(courseId);
    if (!course) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    if (course.status === "published") throw new ApiError(409, "UNPUBLISH_FIRST", "Unpublish before changing an official price.");
    const base = whole(body.basePriceMinor, "Base price");
    const min = whole(body.minMarginBps, "Minimum margin", 10_000);
    const max = whole(body.maxMarginBps, "Maximum margin", 10_000);
    if (min > max) throw new ApiError(422, "INVALID_MARGIN_RANGE", "Minimum margin exceeds maximum margin.");
    const cap = body.maxFinalMinor === null || body.maxFinalMinor === undefined ? null : whole(body.maxFinalMinor, "Maximum final price");
    if (base === 0 && (min !== 0 || max !== 0)) throw new ApiError(422, "INVALID_FREE_POLICY", "Free courses must have zero margin.");
    if (cap !== null && cap < finalPriceMinor(base, min)) throw new ApiError(422, "PRICE_CAP", "Price cap is below the minimum permitted final price.");
    const before = pricingForCourse(courseId);
    if (before?.basePriceMinor === base && before.minMarginBps === min && before.maxMarginBps === max && before.maxFinalMinor === cap)
      return before;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (reason.length > 500 || (before?.basePriceMinor !== null && before?.basePriceMinor !== undefined && reason.length < 3))
      throw new ApiError(422, "REASON_REQUIRED", "Explain a change to an existing pricing policy in 3–500 characters.");
    const current = db.prepare("SELECT proposed_margin_bps FROM course_pricing WHERE course_id=?").get(courseId);
    const proposed = current?.proposed_margin_bps === null || current?.proposed_margin_bps === undefined ? null : Number(current.proposed_margin_bps);
    const validProposal = proposed !== null && proposed >= min && proposed <= max && (cap === null || finalPriceMinor(base, proposed) <= cap);
    db.prepare(`INSERT INTO course_pricing(course_id,base_price_minor,currency,min_margin_bps,max_margin_bps,max_final_minor,
      proposed_margin_bps,proposed_final_minor,approved_margin_bps,pricing_status,updated_by)
      VALUES (?,?,'INR',?,?,?,?,?,NULL,'pending',?)
      ON CONFLICT(course_id) DO UPDATE SET base_price_minor=excluded.base_price_minor,currency='INR',
      min_margin_bps=excluded.min_margin_bps,max_margin_bps=excluded.max_margin_bps,max_final_minor=excluded.max_final_minor,
      proposed_margin_bps=excluded.proposed_margin_bps,proposed_final_minor=excluded.proposed_final_minor,
      approved_margin_bps=NULL,pricing_status='pending',updated_by=excluded.updated_by,updated_at=?`)
      .run(courseId, base, min, max, cap, validProposal ? proposed : null,
        validProposal ? finalPriceMinor(base, proposed) : null, admin.id, new Date().toISOString());
    const after = pricingForCourse(courseId);
    history(db, courseId, admin.id, "pricing_updated", reason, { before, after });
    return after;
  });
}

export function adminPricingDecision(courseId: string, admin: SessionUser, action: "approve" | "reject" | "request_changes", marginInput?: unknown, feedback = "") {
  return transaction((db) => {
    const course = db.prepare("SELECT status,price_minor FROM courses WHERE id=?").get(courseId);
    if (!course) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    if (course.status === "published") throw new ApiError(409, "UNPUBLISH_FIRST", "Unpublish before changing pricing approval.");
    const policy = pricingForCourse(courseId);
    if (!policy || policy.basePriceMinor === null) throw new ApiError(422, "POLICY_REQUIRED", "Set a base price first.");
    const margin = marginInput === undefined ? policy.proposedMarginBps : whole(marginInput, "Approved margin", 10_000);
    if (action === "approve") {
      if (margin === null || margin < policy.minMarginBps || margin > policy.maxMarginBps)
        throw new ApiError(422, "MARGIN_OUT_OF_RANGE", "Margin is outside the policy range.");
      const final = finalPriceMinor(policy.basePriceMinor, margin);
      if (policy.maxFinalMinor !== null && final > policy.maxFinalMinor) throw new ApiError(422, "PRICE_CAP", "Final price exceeds the cap.");
      if (policy.status === "approved" && policy.approvedMarginBps === margin && Number(course.price_minor) === final)
        return policy;
      if (policy.proposedMarginBps !== null && margin !== policy.proposedMarginBps && !feedback.trim())
        throw new ApiError(422, "FEEDBACK_REQUIRED", "Provide a reason when overriding the tutor's proposed margin.");
      db.prepare("UPDATE course_pricing SET approved_margin_bps=?,pricing_status='approved',updated_by=?,updated_at=? WHERE course_id=?")
        .run(margin, admin.id, new Date().toISOString(), courseId);
      db.prepare("UPDATE courses SET price_minor=?,currency=?,updated_at=? WHERE id=?")
        .run(final, policy.currency, new Date().toISOString(), courseId);
      const courseRow = db.prepare("SELECT metadata_json FROM courses WHERE id=?").get(courseId);
      const metadata = JSON.parse(String(courseRow?.metadata_json || "{}"));
      delete metadata.originalPrice;
      db.prepare("UPDATE courses SET metadata_json=? WHERE id=?").run(JSON.stringify(metadata), courseId);
    } else {
      if (!feedback.trim()) throw new ApiError(422, "FEEDBACK_REQUIRED", "Provide pricing feedback.");
      db.prepare("UPDATE course_pricing SET approved_margin_bps=NULL,pricing_status=?,updated_by=?,updated_at=? WHERE course_id=?")
        .run(action === "reject" ? "rejected" : "changes_requested", admin.id, new Date().toISOString(), courseId);
    }
    const after = pricingForCourse(courseId);
    history(db, courseId, admin.id, action === "request_changes" ? "pricing_changes_requested" : `pricing_${action === "approve" ? "approved" : "rejected"}`, feedback, { before: policy, after });
    return after;
  });
}

export function adminReview(courseId: string, admin: SessionUser, action: ReviewAction, feedback = "") {
  return transaction((db) => {
    const course = db.prepare("SELECT * FROM courses WHERE id=?").get(courseId);
    if (!course) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    const review = String(course.review_status);
    if (action === "approve" || action === "reject") {
      const previouslyPublished = Boolean(db.prepare("SELECT 1 FROM course_approval_history WHERE course_id=? AND action='published' LIMIT 1").get(courseId));
      const adminReapproval = action === "approve" && course.status === "draft" &&
        (review === "unpublished" || (review === "draft" && previouslyPublished));
      if (review !== "pending_approval" && !adminReapproval)
        throw new ApiError(409, "INVALID_TRANSITION", "Course is not awaiting review or eligible for admin reapproval.");
      if (action === "reject" && !feedback.trim()) throw new ApiError(422, "FEEDBACK_REQUIRED", "Provide a rejection reason.");
      db.prepare("UPDATE courses SET review_status=?,updated_at=? WHERE id=?")
        .run(action === "approve" ? "approved" : "rejected", new Date().toISOString(), courseId);
    } else if (action === "publish") {
      if (review !== "approved" || course.status === "published") throw new ApiError(409, "INVALID_TRANSITION", "Approve the course before publishing.");
      const pricing = pricingForCourse(courseId);
      if (!pricing || pricing.status !== "approved" || pricing.finalPriceMinor === null || pricing.finalPriceMinor !== Number(course.price_minor))
        throw new ApiError(422, "PRICING_NOT_APPROVED", "Approve a valid course price before publishing.");
      const missing = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id WHERE s.course_id=?
        AND ((l.type='video' AND (l.video_storage_key IS NULL OR l.video_storage_key=''))
        OR (l.type='reading' AND trim(l.description)='' AND l.activity_json IS NULL)
        OR (l.type IN ('quiz','project') AND l.activity_json IS NULL)) LIMIT 1`).get(courseId);
      if (!String(course.description).trim() || !course.thumbnail || !Number(course.lesson_count) || missing)
        throw new ApiError(422, "COURSE_INCOMPLETE", "Course content or hosted media is incomplete.");
      db.prepare("UPDATE courses SET status='published',published_at=COALESCE(published_at,?),updated_at=? WHERE id=?")
        .run(new Date().toISOString(), new Date().toISOString(), courseId);
    } else {
      if (course.status !== "published") throw new ApiError(409, "INVALID_TRANSITION", "Course is not published.");
      db.prepare("UPDATE courses SET status='draft',review_status='unpublished',updated_at=? WHERE id=?")
        .run(new Date().toISOString(), courseId);
    }
    history(db, courseId, admin.id, action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "publish" ? "published" : "unpublished", feedback,
      { before: { status: course.status, reviewStatus: review }, after: { status: action === "publish" ? "published" : action === "unpublish" ? "draft" : course.status,
        reviewStatus: action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "unpublish" ? "unpublished" : review } });
    return { id: courseId, action };
  });
}
