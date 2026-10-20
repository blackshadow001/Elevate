import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { finalPriceMinor } from "@/server/courseApproval";
import { razorpayConfigured } from "@/server/razorpayGateway";

export function createOrder(courseId: string, user: SessionUser) {
  return transaction((db) => {
    const course = db.prepare("SELECT id,price_minor,currency,status,review_status FROM courses WHERE id=?").get(courseId);
    if (!course || course.status !== "published" || course.review_status !== "approved") throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    const pricing = db.prepare("SELECT base_price_minor,approved_margin_bps,pricing_status,currency FROM course_pricing WHERE course_id=?").get(courseId);
    if (!pricing || pricing.pricing_status !== "approved" || pricing.base_price_minor === null || pricing.approved_margin_bps === null ||
      finalPriceMinor(Number(pricing.base_price_minor), Number(pricing.approved_margin_bps)) !== Number(course.price_minor) ||
      pricing.currency !== course.currency) throw new ApiError(409, "PRICING_NOT_APPROVED", "Course pricing needs admin approval.");
    if (Number(course.price_minor) === 0) throw new ApiError(409, "FREE_COURSE", "Use free enrollment for this course.");
    if (db.prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('active','completed')").get(user.id, courseId)) {
      throw new ApiError(409, "ALREADY_ENROLLED", "You are already enrolled in this course.");
    }
    const existing = db.prepare(`SELECT o.id,o.status,o.total_minor,o.currency,o.provider_reference FROM orders o
      JOIN order_items i ON i.order_id=o.id WHERE o.user_id=? AND i.course_id=? AND o.status='pending' LIMIT 1`).get(user.id, courseId);
    if (existing && (existing.provider_reference || (Number(existing.total_minor) === Number(course.price_minor) && existing.currency === course.currency)))
      return { id: String(existing.id), status: "pending", totalMinor: Number(existing.total_minor), currency: String(existing.currency), checkoutAvailable: razorpayConfigured() };
    if (existing) db.prepare("UPDATE orders SET status='cancelled',updated_at=? WHERE id=?").run(new Date().toISOString(), String(existing.id));
    const id = randomUUID();
    db.prepare("INSERT INTO orders (id,user_id,total_minor,currency) VALUES (?,?,?,?)")
      .run(id, user.id, Number(course.price_minor), String(course.currency));
    db.prepare("INSERT INTO order_items (id,order_id,course_id,price_minor) VALUES (?,?,?,?)")
      .run(randomUUID(), id, courseId, Number(course.price_minor));
    return { id, status: "pending", totalMinor: Number(course.price_minor), currency: String(course.currency), checkoutAvailable: razorpayConfigured() };
  });
}
export function listOwnOrders(user: SessionUser) {
  return getDb().prepare("SELECT id,status,total_minor,currency,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100")
    .all(user.id).map((row) => ({ id: String(row.id), status: String(row.status), totalMinor: Number(row.total_minor),
      currency: String(row.currency), createdAt: String(row.created_at) }));
}
