import { ApiError, id, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getDb } from "@/server/db";
import { razorpayConfigured } from "@/server/razorpayGateway";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    await requireRole("admin");
    const orderId = id((await params).orderId);
    const db = getDb();
    const order = db.prepare(`SELECT o.id,o.status,o.total_minor,o.currency,o.provider_reference,o.created_at,o.updated_at,
      u.id user_id,u.name user_name,u.email user_email FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=?`).get(orderId);
    if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
    const items = db.prepare(`SELECT oi.id,oi.course_id,oi.price_minor,c.title course_title FROM order_items oi
      JOIN courses c ON c.id=oi.course_id WHERE oi.order_id=?`).all(orderId);
    const payments = db.prepare(`SELECT id,provider,provider_payment_id,gateway_order_id,status,amount_minor,currency,verified_at,created_at,updated_at
      FROM payments WHERE order_id=? ORDER BY created_at DESC`).all(orderId);
    return { order, items, payments, paymentProviderConfigured: razorpayConfigured() };
  });
}
