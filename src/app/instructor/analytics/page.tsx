"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, Star, Video, CheckCircle2, Eye, IndianRupee } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useInstructorCourses } from "@/lib/instructorCourses";

type Analytics = {
  courses: number; publishedCourses: number; enrollments: number; completedEnrollments: number;
  learners: number; reviews: number; averageRating: number | null; liveClasses: number;
  activeLiveClasses: number; courseViews: number | null; revenueMinor: number | null;
};

export default function InstructorAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const courses = useInstructorCourses();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || (user.role !== "instructor" && user.role !== "admin")) return;
    let active = true;
    fetch("/api/instructor/analytics", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Unable to load analytics."); return body.data as Analytics; })
      .then((data) => { if (active) setAnalytics(data); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load analytics."); });
    return () => { active = false; };
  }, [isAuthenticated, user.id, user.role]);

  const completionRate = analytics?.enrollments ? Math.round(analytics.completedEnrollments / analytics.enrollments * 100) : 0;
  const cards = [
    { label: "Published Courses", value: analytics?.publishedCourses ?? 0, icon: BookOpen },
    { label: "Total Learners", value: analytics?.learners ?? 0, icon: Users },
    { label: "Enrollments", value: analytics?.enrollments ?? 0, icon: CheckCircle2 },
    { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle2 },
    { label: "Average Rating", value: analytics?.averageRating === null || !analytics ? "—" : analytics.averageRating.toFixed(1), icon: Star },
    { label: "Live Classes", value: analytics?.liveClasses ?? 0, icon: Video },
  ];

  return <div className="space-y-8">
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">Performance & Analytics</h1>
      <p className="mt-1 text-xs sm:text-sm text-[#64748B]">Metrics from your courses, enrollments, reviews and live classes.</p>
    </div>
    {!analytics && !error && <p className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-sm text-[#64748B]" role="status">Loading instructor analytics…</p>}
    {error && <p className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-600" role="alert">{error} Refresh the page to retry.</p>}
    {analytics && <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(({ label, value, icon: Icon }) => <div key={label} className="bg-white p-4.5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
          <Icon className="h-5 w-5 text-[#FF6B35]" aria-hidden="true" />
          <div className="text-xl font-black text-[#172033]">{value}</div>
          <div className="text-[11px] font-bold text-[#64748B] uppercase">{label}</div>
        </div>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-[#FF6B35]" /><h2 className="text-lg font-bold text-[#172033]">Course Views</h2></div>
          <p className="mt-3 text-2xl font-black text-[#172033]">{analytics.courseViews === null ? "—" : analytics.courseViews.toLocaleString()}</p>
          <p className="mt-2 text-xs text-[#64748B]">View tracking is not connected yet. No view total is estimated.</p>
        </div>
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-[#16A34A]" /><h2 className="text-lg font-bold text-[#172033]">Verified Revenue</h2></div>
          <p className="mt-3 text-2xl font-black text-[#172033]">{analytics.revenueMinor === null ? "—" : `₹${(analytics.revenueMinor / 100).toLocaleString("en-IN")}`}</p>
          <p className="mt-2 text-xs text-[#64748B]">Payment settlement data is not connected yet. No revenue is inferred from enrollments.</p>
        </div>
      </div>
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-[#172033]">My Courses</h2><Link className="text-xs font-bold text-[#FF6B35]" href="/instructor/courses">Manage Courses →</Link></div>
        {courses.length === 0 ? <p className="mt-4 text-sm text-[#64748B]">No courses yet. Create your first course to begin tracking activity.</p> :
          <div className="mt-4 divide-y divide-[#E5E7EB]">{courses.map((course) => <div key={course.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="font-semibold text-[#172033]">{course.title}</span><span className="text-xs text-[#64748B]">{course.status}</span>
          </div>)}</div>}
      </section>
    </>}
  </div>;
}
