import { safeCached } from "@/server/api";
import { getDb } from "@/server/db";
import { personalPlanCheckoutAvailable } from "@/server/personalPlan";

export async function GET() {
  return safeCached(async () => {
    const db = getDb();
    const settings = db.prepare("SELECT monthly_price_minor,annual_price_minor FROM personal_plan_settings WHERE id=1").get();
    const selectedCourses = db.prepare(`SELECT c.id,c.slug,c.title,c.thumbnail,c.category FROM personal_plan_courses p
      JOIN courses c ON c.id=p.course_id WHERE c.status='published' AND c.review_status='approved'
      ORDER BY c.title COLLATE NOCASE,c.id`).all()
      .map((course) => ({ id: String(course.id), slug: String(course.slug), title: String(course.title),
        thumbnail: course.thumbnail ? String(course.thumbnail) : null, category: String(course.category) }));
    return { currency: "INR", monthlyPriceMinor: settings?.monthly_price_minor ?? null,
      annualPriceMinor: settings?.annual_price_minor ?? null, includedCourses: selectedCourses,
      includedCourseCount: selectedCourses.length,
      checkoutAvailable: personalPlanCheckoutAvailable() && selectedCourses.length > 0 };
  }, 30, 120);
}
