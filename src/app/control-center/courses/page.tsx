"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, RefreshCw, Search } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: string | null;
  status: string;
  review_status: string;
  instructor_name: string;
  instructor_email: string;
  updated_at: string;
  price_minor: number;
  currency: string;
  pricing: {
    basePriceMinor: number | null;
    approvedMarginBps: number | null;
    proposedMarginBps: number | null;
    finalPriceMinor: number | null;
    status: string;
  } | null;
}

const formatRupees = (minor: number | null | undefined) =>
  minor === null || minor === undefined ? "—" : `₹${(minor / 100).toLocaleString("en-IN")}`;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("updated_desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("sort", sort);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/courses?${params.toString()}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load courses");
      setCourses(json.data.courses || []);
      setTotal(json.data.pagination?.total || 0);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching courses");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sort, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCourses();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadCourses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Catalog"
        subtitle="Comprehensive registry of all educational offerings, status lifecycles, and instructor assignments."
        breadcrumbs={[{ label: "Marketplace" }, { label: "Courses Catalog" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/control-center/courses/approvals"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFF0EB] border border-[#FFD8CA] px-3.5 py-2 text-xs font-bold text-[#FF6B35] hover:bg-[#FFE3D8] transition-colors"
            >
              <span>Review Queue</span>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by title, instructor name or email…"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] pl-10 pr-4 py-2 text-xs text-[#172033] placeholder-[#94A3B8] focus:border-[#FF6B35] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#172033] focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="">All Review Statuses</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <select aria-label="Sort courses" value={sort} onChange={(e) => { setPage(1); setSort(e.target.value); }} className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#172033]"><option value="updated_desc">Recently updated</option><option value="updated_asc">Oldest updated</option><option value="title_asc">Title A–Z</option><option value="price_asc">Price low to high</option><option value="price_desc">Price high to low</option></select>

          <button
            onClick={loadCourses}
            className="rounded-xl border border-[#E5E7EB] p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
        <span>{total} courses · page {page} of {Math.max(1, Math.ceil(total / 25))}</span>
        <div className="flex items-center gap-3">
          <div role="group" aria-label="Course view" className="inline-flex rounded-lg border border-[#E5E7EB] bg-white p-1">
            <button type="button" onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[#FF6B35] ${view === "grid" ? "bg-[#172033] text-white" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]"}`}><LayoutGrid className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Grid</span></button>
            <button type="button" onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"} className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[#FF6B35] ${view === "list" ? "bg-[#172033] text-white" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]"}`}><List className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">List</span></button>
          </div>
          <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div>
        </div>
      </div>

      {loading && courses.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-20 text-center text-xs text-[#64748B] shadow-xs">Loading catalog data…</div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-white py-12 text-center text-xs text-red-600 shadow-xs">{error}</div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-16 text-center text-xs text-[#64748B] shadow-xs">No courses found matching filter criteria.</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map(course => (
            <article key={course.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs transition-shadow hover:shadow-lg">
              <CourseThumbnail category={course.category} title={course.title} imageUrl={course.thumbnail || undefined} />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2"><StatusBadge status={course.status} size="sm" /><StatusBadge status={course.review_status} size="sm" /></div>
                <div className="min-w-0"><h2 className="line-clamp-2 text-base font-bold text-[#172033]">{course.title}</h2><p className="mt-1 truncate text-xs text-[#94A3B8]">{course.category} · {course.id}</p></div>
                <div className="text-xs text-[#64748B]"><p className="font-semibold text-[#172033]">{course.instructor_name}</p><p className="truncate">{course.instructor_email}</p></div>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#E5E7EB] pt-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">Final price</p><p className="text-lg font-bold text-[#172033]">{formatRupees(course.pricing?.finalPriceMinor ?? course.price_minor)}</p></div><p className="text-right text-[11px] text-[#94A3B8]">Updated {new Date(course.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                <div className="flex gap-2"><Link href={`/control-center/courses/${course.id}`} className="flex-1 rounded-lg bg-[#F1F5F9] px-3 py-2 text-center text-xs font-bold text-[#172033] hover:bg-[#E2E8F0]">Details</Link>{course.review_status === "pending_approval" && <Link href="/control-center/courses/approvals" className="flex-1 rounded-lg bg-[#FFF0EB] px-3 py-2 text-center text-xs font-bold text-[#FF6B35] hover:bg-[#FFE3D8]">Review</Link>}</div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Course</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Instructor</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Publish Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Review Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Final Price</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Last Updated</th>
                  <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#172033] max-w-xs truncate">
                      <div className="flex flex-col">
                        <span className="truncate">{course.title}</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono font-normal">{course.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#172033]">{course.instructor_name}</span>
                        <span className="text-[10px] text-[#94A3B8]">{course.instructor_email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={course.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={course.review_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172033]">
                      {formatRupees(course.pricing?.finalPriceMinor ?? course.price_minor)}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8] whitespace-nowrap">
                      {new Date(course.updated_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/control-center/courses/${course.id}`}
                          className="rounded-lg bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-bold text-[#172033] hover:bg-[#E2E8F0] transition-colors"
                        >
                          Details
                        </Link>
                        {course.review_status === "pending_approval" && (
                          <Link
                            href={`/control-center/courses/approvals`}
                            className="rounded-lg bg-[#FFF0EB] px-2.5 py-1 text-[11px] font-bold text-[#FF6B35] hover:bg-[#FFE3D8] transition-colors"
                          >
                            Review
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
