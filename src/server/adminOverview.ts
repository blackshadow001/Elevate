import "server-only";
import { getDb } from "@/server/db";

export interface AdminMetrics {
  grossSalesMinor: number | null;
  platformRevenueMinor: number | null;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  learnersCount: number;
  activeTutorsCount: number;
  totalCoursesCount: number;
  publishedCoursesCount: number;
  pendingApprovalsCount: number;
  draftCoursesCount: number;
  rejectedCoursesCount: number;
  liveClassesCount: number;
  activeLiveClassesCount: number;
  bootcampsCount: number;
  eventsCount: number;
  certificatesIssuedCount: number;
  pendingPayoutsCount: number | null;
  pendingRefundsCount: number | null;
  financialsAvailable: boolean;
}

export interface AdminOverviewData {
  metrics: AdminMetrics;
  revenueTrend: Array<{ date: string; amountMinor: number; orderCount: number }>;
  enrollmentTrend: Array<{ date: string; count: number }>;
  courseStatusDistribution: Array<{ status: string; count: number }>;
  topCourses: Array<{ id: string; title: string; instructorName: string; priceMinor: number; enrollments: number; rating: number }>;
  topTutors: Array<{ id: string; name: string; email: string; courseCount: number; studentCount: number; avgRating: number }>;
  categoriesBreakdown: Array<{ category: string; count: number; publishedCount: number }>;
  recentOrders: Array<{ id: string; userName: string; userEmail: string; courseTitle: string; totalMinor: number; currency: string; status: string; createdAt: string }>;
  actionCenter: {
    pendingApprovals: Array<{ id: string; title: string; instructorName: string; updatedAt: string; priceMinor: number }>;
    publishCandidates: Array<{ id: string; title: string; instructorName: string; pricingStatus: string }>;
    pendingTutorReview: Array<{ id: string; name: string; email: string; createdAt: string }>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: "course" | "order" | "user" | "certificate" | "pricing";
    entityId: string;
    entityTitle: string;
    actorName: string;
    feedback: string;
    createdAt: string;
  }>;
}

export function getAdminOverview(isSuperAdmin = false): AdminOverviewData {
  const db = getDb();

  // Core metrics from actual DB tables
  const orderStats = db.prepare(`
    SELECT
      COUNT(1) as total_orders,
      COALESCE(SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END), 0) as paid_orders,
      COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END), 0) as pending_orders,
      COALESCE(SUM(CASE WHEN status='paid' THEN total_minor ELSE 0 END), 0) as gross_sales,
      COALESCE(SUM(CASE WHEN status='refunded' THEN 1 ELSE 0 END), 0) as refunded_orders
    FROM orders
  `).get() as { total_orders: number; paid_orders: number; pending_orders: number; gross_sales: number; refunded_orders: number };

  const userStats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN role='learner' THEN 1 ELSE 0 END), 0) as learners,
      COALESCE(SUM(CASE WHEN role='instructor' AND status='active' THEN 1 ELSE 0 END), 0) as tutors
    FROM users
  `).get() as { learners: number; tutors: number };

  const courseStats = db.prepare(`
    SELECT
      COUNT(1) as total,
      COALESCE(SUM(CASE WHEN status='published' THEN 1 ELSE 0 END), 0) as published,
      COALESCE(SUM(CASE WHEN review_status='pending_approval' THEN 1 ELSE 0 END), 0) as pending_approval,
      COALESCE(SUM(CASE WHEN review_status='draft' OR status='draft' THEN 1 ELSE 0 END), 0) as drafts,
      COALESCE(SUM(CASE WHEN review_status='rejected' THEN 1 ELSE 0 END), 0) as rejected
    FROM courses
  `).get() as { total: number; published: number; pending_approval: number; drafts: number; rejected: number };

  const liveStats = db.prepare(`
    SELECT
      COUNT(1) as total,
      COALESCE(SUM(CASE WHEN status='live' THEN 1 ELSE 0 END), 0) as active_live
    FROM live_classes
  `).get() as { total: number; active_live: number };

  const bootcampsCount = (db.prepare(`SELECT COUNT(1) as n FROM bootcamps`).get() as { n: number }).n;
  const eventsCount = (db.prepare(`SELECT COUNT(1) as n FROM events`).get() as { n: number }).n;
  const certCount = (db.prepare(`SELECT COUNT(1) as n FROM certificates`).get() as { n: number }).n;

  const metrics: AdminMetrics = {
    grossSalesMinor: null,
    platformRevenueMinor: null,
    totalOrders: Number(orderStats.total_orders || 0),
    paidOrders: Number(orderStats.paid_orders || 0),
    pendingOrders: Number(orderStats.pending_orders || 0),
    learnersCount: Number(userStats.learners || 0),
    activeTutorsCount: Number(userStats.tutors || 0),
    totalCoursesCount: Number(courseStats.total || 0),
    publishedCoursesCount: Number(courseStats.published || 0),
    pendingApprovalsCount: Number(courseStats.pending_approval || 0),
    draftCoursesCount: Number(courseStats.drafts || 0),
    rejectedCoursesCount: Number(courseStats.rejected || 0),
    liveClassesCount: Number(liveStats.total || 0),
    activeLiveClassesCount: Number(liveStats.active_live || 0),
    bootcampsCount: Number(bootcampsCount || 0),
    eventsCount: Number(eventsCount || 0),
    certificatesIssuedCount: Number(certCount || 0),
    pendingPayoutsCount: null,
    pendingRefundsCount: null,
    financialsAvailable: false,
  };

  // Status breakdown
  const statusDistributionRows = db.prepare(`
    SELECT review_status, COUNT(1) as count
    FROM courses
    GROUP BY review_status
  `).all() as Array<{ review_status: string; count: number }>;

  const courseStatusDistribution = statusDistributionRows.map((r) => ({
    status: r.review_status,
    count: Number(r.count),
  }));

  // Categories breakdown
  const categoryRows = db.prepare(`
    SELECT
      category,
      COUNT(1) as count,
      COALESCE(SUM(CASE WHEN status='published' THEN 1 ELSE 0 END), 0) as published_count
    FROM courses
    GROUP BY category
    ORDER BY count DESC
  `).all() as Array<{ category: string; count: number; published_count: number }>;

  const categoriesBreakdown = categoryRows.map((r) => ({
    category: r.category || "General",
    count: Number(r.count),
    publishedCount: Number(r.published_count),
  }));

  // Top courses by enrollment and rating
  const topCourseRows = db.prepare(`
    SELECT
      c.id, c.title, c.price_minor, c.rating,
      u.name as instructor_name,
      COUNT(e.id) as enrollment_count
    FROM courses c
    JOIN users u ON u.id = c.instructor_id
    LEFT JOIN enrollments e ON e.course_id = c.id
    GROUP BY c.id
    ORDER BY enrollment_count DESC, c.rating DESC
    LIMIT 6
  `).all() as Array<{ id: string; title: string; price_minor: number; rating: number; instructor_name: string; enrollment_count: number }>;

  const topCourses = topCourseRows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    instructorName: String(r.instructor_name),
    priceMinor: Number(r.price_minor),
    enrollments: Number(r.enrollment_count),
    rating: Number(r.rating || 0),
  }));

  // Top tutors
  const topTutorRows = db.prepare(`
    SELECT
      u.id, u.name, u.email,
      COUNT(DISTINCT c.id) as course_count,
      COUNT(DISTINCT e.id) as student_count,
      COALESCE(AVG(c.rating), 0) as avg_rating
    FROM users u
    JOIN courses c ON c.instructor_id = u.id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE u.role = 'instructor'
    GROUP BY u.id
    ORDER BY student_count DESC, course_count DESC
    LIMIT 5
  `).all() as Array<{ id: string; name: string; email: string; course_count: number; student_count: number; avg_rating: number }>;

  const topTutors = topTutorRows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    courseCount: Number(r.course_count),
    studentCount: Number(r.student_count),
    avgRating: Number(r.avg_rating || 0),
  }));

  // Recent Orders
  const recentOrderRows = db.prepare(`
    SELECT
      o.id, o.status, o.total_minor, o.currency, o.created_at,
      u.name as user_name, u.email as user_email,
      COALESCE(c.title, 'General Order') as course_title
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN courses c ON c.id = oi.course_id
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all() as Array<{ id: string; status: string; total_minor: number; currency: string; created_at: string; user_name: string; user_email: string; course_title: string }>;

  const recentOrders = recentOrderRows.map((r) => ({
    id: String(r.id),
    userName: String(r.user_name),
    userEmail: String(r.user_email),
    courseTitle: String(r.course_title),
    totalMinor: Number(r.total_minor),
    currency: String(r.currency),
    status: String(r.status),
    createdAt: String(r.created_at),
  }));

  // Revenue trend (group by day from orders if available, or last 7 days)
  const revenueTrendRows = db.prepare(`
    SELECT
      strftime('%Y-%m-%d', created_at) as day,
      COALESCE(SUM(total_minor), 0) as amount,
      COUNT(1) as order_count
    FROM orders
    WHERE status='paid'
    GROUP BY day
    ORDER BY day DESC
    LIMIT 14
  `).all() as Array<{ day: string; amount: number; order_count: number }>;

  const revenueTrend = revenueTrendRows.map((r) => ({
    date: r.day,
    amountMinor: Number(r.amount),
    orderCount: Number(r.order_count),
  }));

  // Enrollment trend
  const enrollmentTrendRows = db.prepare(`
    SELECT
      strftime('%Y-%m-%d', enrolled_at) as day,
      COUNT(1) as count
    FROM enrollments
    GROUP BY day
    ORDER BY day DESC
    LIMIT 14
  `).all() as Array<{ day: string; count: number }>;

  const enrollmentTrend = enrollmentTrendRows.map((r) => ({
    date: r.day,
    count: Number(r.count),
  }));

  // Action Center
  const pendingApprovalsRows = db.prepare(`
    SELECT c.id, c.title, c.updated_at, c.price_minor, u.name as instructor_name
    FROM courses c
    JOIN users u ON u.id = c.instructor_id
    WHERE c.review_status = 'pending_approval'
    ORDER BY c.updated_at DESC
    LIMIT 10
  `).all() as Array<{ id: string; title: string; updated_at: string; price_minor: number; instructor_name: string }>;

  const publishCandidateRows = db.prepare(`
    SELECT c.id, c.title, COALESCE(p.pricing_status,'pending') pricing_status, u.name as instructor_name
    FROM courses c
    JOIN users u ON u.id = c.instructor_id
    LEFT JOIN course_pricing p ON p.course_id = c.id
    WHERE c.review_status = 'approved' AND c.status = 'draft'
    ORDER BY CASE WHEN p.pricing_status='approved' THEN 1 ELSE 0 END, c.updated_at DESC
  `).all() as Array<{ id: string; title: string; pricing_status: string; instructor_name: string }>;
  const pendingTutorRows = isSuperAdmin ? db.prepare(`
    SELECT a.id,u.name,u.email,a.submitted_at
    FROM tutor_applications a JOIN users u ON u.id=a.user_id
    WHERE a.status='pending' ORDER BY a.submitted_at DESC
  `).all() as Array<{ id: string; name: string; email: string; submitted_at: string }> : [];

  const actionCenter = {
    pendingApprovals: pendingApprovalsRows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      instructorName: String(r.instructor_name),
      updatedAt: String(r.updated_at),
      priceMinor: Number(r.price_minor),
    })),
    publishCandidates: publishCandidateRows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      instructorName: String(r.instructor_name),
      pricingStatus: String(r.pricing_status),
    })),
    pendingTutorReview: pendingTutorRows.map((row) => ({
      id: row.id, name: row.name, email: row.email, createdAt: row.submitted_at,
    })),
  };

  // Recent activity from course_approval_history, orders, and certificates
  const historyEvents = db.prepare(`
    SELECT
      h.id, h.action, h.feedback, h.created_at, h.course_id as entity_id,
      c.title as entity_title, u.name as actor_name
    FROM course_approval_history h
    JOIN courses c ON c.id = h.course_id
    JOIN users u ON u.id = h.actor_id
    ORDER BY h.created_at DESC
    LIMIT 20
  `).all() as Array<{ id: string; action: string; feedback: string; created_at: string; entity_id: string; entity_title: string; actor_name: string }>;

  const courseActivity = historyEvents.map((e) => ({
    id: String(e.id),
    action: String(e.action),
    entityType: "course" as const,
    entityId: String(e.entity_id),
    entityTitle: String(e.entity_title),
    actorName: String(e.actor_name),
    feedback: String(e.feedback || ""),
    createdAt: String(e.created_at),
  }));
  const accountEvents = db.prepare(`SELECT a.id,a.action,a.reason,a.entity_type,a.entity_id,a.created_at,
      actor.name actor_name, COALESCE(target.name,cert.certificate_number,a.entity_id) entity_title
    FROM admin_audit_logs a JOIN users actor ON actor.id=a.actor_id
    LEFT JOIN users target ON a.entity_type='user' AND target.id=a.entity_id
    LEFT JOIN certificates cert ON a.entity_type='certificate' AND cert.id=a.entity_id
    ORDER BY a.created_at DESC LIMIT 20`).all() as Array<{ id:string; action:string; reason:string; entity_type:"user"|"certificate"; entity_id:string; created_at:string; actor_name:string; entity_title:string }>;
  const recentActivity = [...courseActivity, ...accountEvents.map((e) => ({ id: e.id, action: e.action,
    entityType: e.entity_type, entityId: e.entity_id, entityTitle: e.entity_title,
    actorName: e.actor_name, feedback: e.reason, createdAt: e.created_at }))]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);

  return {
    metrics,
    revenueTrend,
    enrollmentTrend,
    courseStatusDistribution,
    topCourses,
    topTutors,
    categoriesBreakdown,
    recentOrders,
    actionCenter,
    recentActivity,
  };
}
