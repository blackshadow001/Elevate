"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useInstructorCourses } from "@/lib/instructorCourses";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { 
  BookOpen, 
  Users, 
  Star, 
  IndianRupee, 
  PlusCircle, 
  Video, 
  ArrowRight, 
  BadgeCheck,
  TrendingUp,
  Calendar,
  Clock,
  Eye,
  CheckCircle2
} from "lucide-react";

type Analytics = { publishedCourses: number; learners: number; averageRating: number | null; revenueMinor: number | null };
type Student = { enrollmentId: string; progressPercent: number; student: { name: string } };
type Live = { id: string; title: string; scheduledAt: string; durationMinutes: number; status: string };
const emptyStats: Analytics = { publishedCourses: 0, learners: 0, averageRating: null, revenueMinor: null };

export default function InstructorStudioOverviewPage() {
  const { user, isAuthenticated } = useAuth();
  const ownedCourses = useInstructorCourses();
  const [stats, setStats] = useState<Analytics>(emptyStats);
  const [students, setStudents] = useState<Student[]>([]);
  const [upcomingLive, setUpcomingLive] = useState<Live[]>([]);
  const [error, setError] = useState<string | null>(null);
  const courses = ownedCourses.filter((course) => course.status === "Published").slice(0, 4);

  useEffect(() => {
    if (!isAuthenticated || (user.role !== "instructor" && user.role !== "admin")) return;
    let active = true;
    const load = async <T,>(url: string): Promise<T> => {
      const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load Studio data.");
      return body.data as T;
    };
    Promise.all([
      load<Analytics>("/api/instructor/analytics"),
      load<Student[]>("/api/instructor/students"),
      load<Live[]>("/api/instructor/live-classes"),
    ]).then(([analytics, learners, live]) => {
      if (!active) return;
      setStats(analytics);
      setStudents(learners.slice(0, 4));
      setUpcomingLive(live.filter((item) => item.status === "scheduled" || item.status === "live"));
      setError(null);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load Studio data."); });
    return () => { active = false; };
  }, [isAuthenticated, user.id, user.role]);

  return (
    <div className="space-y-8">
      {/* Studio Header (Requirement 9) */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <BadgeCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Instructor Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Welcome, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
            Manage your courses, live classes, learners and teaching activity.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/instructor/live-classes/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors shadow-xs"
          >
            <Video className="w-3.5 h-3.5 text-red-500" />
            <span>Schedule Live Class</span>
          </Link>
          <Link
            href="/instructor/courses/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-97"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Statistics Cards (Requirement 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Stat 1: Published Courses */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172033]">
              <AnimatedNumber value={stats.publishedCourses} duration={1200} />
            </div>
            <div className="text-xs font-semibold text-[#64748B]">
              Published Courses
            </div>
          </div>
        </div>

        {/* Stat 2: Total Learners */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172033]">
              <AnimatedNumber value={stats.learners} duration={1600} />
            </div>
            <div className="text-xs font-semibold text-[#64748B]">
              Total Learners
            </div>
          </div>
        </div>

        {/* Stat 3: Course Rating */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-[#F59E0B]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172033] flex items-baseline gap-1">
              <span>{stats.averageRating === null ? "—" : stats.averageRating.toFixed(1)}</span>
              {stats.averageRating !== null && <span className="text-xs font-normal text-[#64748B]">/ 5.0</span>}
            </div>
            <div className="text-xs font-semibold text-[#64748B]">
              Course Rating
            </div>
          </div>
        </div>

        {/* Stat 4: Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172033]">
              {stats.revenueMinor === null ? "—" : `₹${(stats.revenueMinor / 100).toLocaleString("en-IN")}`}
            </div>
            <div className="text-xs font-semibold text-[#64748B]">
              Verified Revenue
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: My Courses Overview & Live Class schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Published Courses Quick Table */}
        <div className="min-w-0 lg:col-span-8 bg-white rounded-3xl border border-[#E5E7EB] p-4 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#172033]">My Active Courses</h2>
            <Link
              href="/instructor/courses"
              className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1"
            >
              <span>Manage All ({courses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex w-full min-w-0 items-center gap-3.5 sm:w-auto sm:flex-1">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-16 h-11 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[#172033] truncate">
                      {c.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5">
                      <span>{c.studentsCount.toLocaleString()} learners</span>
                      <span>·</span>
                      {c.ratingCount > 0 && <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{c.rating}</span>
                      </span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-[#16A34A] border border-emerald-200">
                    Published
                  </span>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="p-2 text-slate-400 hover:text-[#172033] rounded-lg transition-colors"
                    title="Preview Public Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/instructor/courses/${c.id}/edit`}
                    className="text-xs font-bold text-[#FF6B35] hover:underline px-2 py-1"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Upcoming Live Classes */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#172033] flex items-center gap-2">
              <span>Live Schedule</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </h2>
            <Link
              href="/instructor/live-classes"
              className="text-xs font-bold text-[#FF6B35] hover:underline"
            >
              All →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingLive.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    item.status === "live"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {item.status === "live" ? "Live Now" : "Upcoming"}
                  </span>
                  <span className="text-[#64748B] font-semibold">{item.durationMinutes}m</span>
                </div>

                <h4 className="text-xs font-bold text-[#172033] leading-snug line-clamp-2">
                  {item.title}
                </h4>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>{new Date(item.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  <Link
                    href={`/instructor/live-classes/${item.id}`}
                    className="text-xs font-bold text-[#FF6B35] hover:underline"
                  >
                    {item.status === "live" ? "Host Stream →" : "Manage →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/instructor/live-classes/create"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-[#FF6B35]/50 hover:border-[#FF6B35] text-xs font-bold text-[#FF6B35] hover:bg-orange-50/50 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule Next Class</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Enrolled Students Strip */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#172033]">Recent Student Activity</h2>
            <p className="text-xs text-[#64748B]">Active learners enrolled across your courses</p>
          </div>
          <Link
            href="/instructor/students"
            className="text-xs font-bold text-[#FF6B35] hover:underline"
          >
            View all learners ({stats.learners}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {students.map((std) => (
            <div
              key={std.enrollmentId}
              className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF6B35] flex items-center justify-center font-bold" aria-hidden="true">{std.student.name.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-[#172033] truncate">{std.student.name}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#64748B]">Progress</span>
                  <span className="text-[#FF6B35]">{std.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF6B35] h-full rounded-full"
                    style={{ width: `${std.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {students.length === 0 && <p className="text-sm text-[#64748B]">No learners have enrolled in your courses yet. Share a published course to get started.</p>}
        {error && <p className="text-sm text-red-600" role="alert">{error} Refresh the page to retry.</p>}
      </div>
    </div>
  );
}
