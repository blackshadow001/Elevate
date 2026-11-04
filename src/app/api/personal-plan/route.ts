import { safe } from "@/server/api";
import { getDb } from "@/server/db";

export async function GET() {
  return safe(async () => {
    const db = getDb();
    const settings = db.prepare("SELECT monthly_price_minor,annual_price_minor FROM personal_plan_settings WHERE id=1").get();
    const publishedCourses = db.prepare("SELECT COUNT(*) total FROM courses WHERE status='published'").get();
    return { currency: "INR", monthlyPriceMinor: settings?.monthly_price_minor ?? null,
      annualPriceMinor: settings?.annual_price_minor ?? null, publishedCourseCount: Number(publishedCourses?.total || 0),
      checkoutAvailable: false };
  });
}
