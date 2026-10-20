import { ApiError, id, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { adminCourseList } from "@/server/courseApproval";
import { getDb } from "@/server/db";

export async function GET(request: Request) {
  return safe(async () => {
    await requireRole("admin");
    const params = new URL(request.url).searchParams;
    const search = params.get("search") || "";
    const courseId = params.get("courseId") || "";
    const status = params.get("status") || "";
    const tutorId = params.get("tutorId") || "";
    const category = params.get("category") || "";
    const sort = params.get("sort") || "updated_desc";
    const page = Number(params.get("page") || 1);
    const pageSize = Number(params.get("pageSize") || 25);
    const minPriceMinor = params.has("minPriceMinor") ? Number(params.get("minPriceMinor")) : undefined;
    const maxPriceMinor = params.has("maxPriceMinor") ? Number(params.get("maxPriceMinor")) : undefined;
    const updatedFrom = params.get("updatedFrom") || "";
    const updatedTo = params.get("updatedTo") || "";
    const validDate = (value: string) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
    if (search.length > 100 || tutorId.length > 100 || category.length > 100 ||
      !["", "draft", "pending_approval", "approved", "published", "rejected", "unpublished"].includes(status) ||
      !["updated_desc", "updated_asc", "price_asc", "price_desc", "title_asc"].includes(sort) ||
      !Number.isInteger(page) || page < 1 || page > 100000 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
      [minPriceMinor, maxPriceMinor].some((value) => value !== undefined && (!Number.isSafeInteger(value) || value < 0 || value > 100_000_000)) ||
      (minPriceMinor !== undefined && maxPriceMinor !== undefined && minPriceMinor > maxPriceMinor) ||
      !validDate(updatedFrom) || !validDate(updatedTo) || (updatedFrom && updatedTo && updatedFrom > updatedTo))
      throw new ApiError(422, "INVALID_FILTER", "Invalid course filter.");
    const db = getDb();
    const metrics = db.prepare(`SELECT
      (SELECT COUNT(*) FROM courses) totalCourses,
      (SELECT COUNT(*) FROM courses WHERE review_status='pending_approval') pendingApprovals,
      (SELECT COUNT(*) FROM courses WHERE status='published') publishedCourses,
      (SELECT COUNT(*) FROM users WHERE role='instructor') tutors,
      (SELECT COUNT(*) FROM users WHERE role='learner') learners`).get();
    const result = adminCourseList({ search, courseId: courseId ? id(courseId) : undefined, status, tutorId, category, sort: sort as "updated_desc", page, pageSize,
      minPriceMinor, maxPriceMinor, updatedFrom, updatedTo });
    return { metrics, courses: result.items, pagination: { total: result.total, page: result.page, pageSize: result.pageSize } };
  });
}
