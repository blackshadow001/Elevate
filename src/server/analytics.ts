import "server-only";
import { SessionUser } from "@/server/auth";
import { getDb } from "@/server/db";

export function learnerAnalytics(user: SessionUser) {
  const db = getDb();
  const enrollment = db.prepare(`SELECT COUNT(*) enrolled,COALESCE(SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END),0) completed,
    COALESCE(AVG(progress_percent),0) average_progress FROM enrollments WHERE user_id=?`).get(user.id)!;
  const activity = db.prepare("SELECT COUNT(*) completed_lessons,MAX(updated_at) last_activity FROM lesson_progress WHERE user_id=? AND completed=1").get(user.id)!;
  return { enrolledCourses: Number(enrollment.enrolled), completedCourses: Number(enrollment.completed),
    averageProgressPercent: Number(enrollment.average_progress), completedLessons: Number(activity.completed_lessons),
    lastActivityAt: activity.last_activity ? String(activity.last_activity) : null };
}

export function instructorAnalytics(user: SessionUser) {
  const db = getDb();
  const where = user.role === "admin" ? "" : "WHERE c.instructor_id=?";
  const params = user.role === "admin" ? [] : [user.id];
  const courses = db.prepare(`SELECT COUNT(*) total,COALESCE(SUM(CASE WHEN status='published' THEN 1 ELSE 0 END),0) published
    FROM courses c ${where}`).get(...params)!;
  const enrollment = db.prepare(`SELECT COUNT(*) enrolled,COALESCE(SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END),0) completed,
    COUNT(DISTINCT e.user_id) learners FROM enrollments e JOIN courses c ON c.id=e.course_id ${where}`).get(...params)!;
  const reviews = db.prepare(`SELECT COUNT(*) reviews,AVG(r.rating) average_rating FROM reviews r
    JOIN courses c ON c.id=r.course_id ${where}`).get(...params)!;
  const live = db.prepare(`SELECT COUNT(*) total,COALESCE(SUM(CASE WHEN status='live' THEN 1 ELSE 0 END),0) live
    FROM live_classes c ${where}`).get(...params)!;
  return {
    courses: Number(courses.total), publishedCourses: Number(courses.published),
    enrollments: Number(enrollment.enrolled), completedEnrollments: Number(enrollment.completed),
    learners: Number(enrollment.learners), reviews: Number(reviews.reviews),
    averageRating: reviews.average_rating === null ? null : Number(reviews.average_rating),
    liveClasses: Number(live.total), activeLiveClasses: Number(live.live),
    courseViews: null, revenueMinor: null,
  };
}

export function instructorStudents(user: SessionUser) {
  const where = user.role === "admin" ? "" : "AND c.instructor_id=?";
  return getDb().prepare(`SELECT e.id enrollment_id,e.status,e.progress_percent,e.enrolled_at,
    u.id user_id,u.name user_name,u.email user_email,c.id course_id,c.title course_title
    FROM enrollments e JOIN users u ON u.id=e.user_id JOIN courses c ON c.id=e.course_id
    WHERE 1=1 ${where} ORDER BY e.enrolled_at DESC LIMIT 500`).all(...(user.role === "admin" ? [] : [user.id]))
    .map((row) => ({ enrollmentId: String(row.enrollment_id), status: String(row.status), progressPercent: Number(row.progress_percent),
      enrolledAt: String(row.enrolled_at), student: { id: String(row.user_id), name: String(row.user_name), email: String(row.user_email) },
      course: { id: String(row.course_id), title: String(row.course_title) } }));
}
