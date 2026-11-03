"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Award,
  Radio,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import type { AdminOverviewData } from "@/server/adminOverview";

const formatRupees = (minor: number) =>
  `₹${(minor / 100).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function AdminOverviewDashboard({ adminName, isSuperAdmin }: { adminName: string; isSuperAdmin: boolean }) {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load admin overview");
      setData(json.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B35] border-r-transparent" />
        <p className="mt-4 text-xs font-bold text-[#64748B]">Loading platform control center…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <h3 className="mt-2 text-sm font-bold text-red-800">Failed to load platform analytics</h3>
        <p className="mt-1 text-xs text-red-600">{error || "Unknown error occurred"}</p>
        <button
          onClick={loadData}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, actionCenter, recentOrders, recentActivity, topCourses, courseStatusDistribution } = data;

  return (
    <div className="space-y-8">
      {isSuperAdmin && <Link href="/control-center/tutor-applications" className="inline-flex items-center gap-2 rounded-xl border border-[#FF6B35] bg-orange-50 px-4 py-3 text-sm font-bold text-[#E85D2A]">Review tutor applications <ArrowRight className="h-4 w-4" /></Link>}
      {/* Page Header */}
      <PageHeader
        title="Super Admin Control Center"
        subtitle={`Welcome back, ${adminName}. Operational overview, marketplace health, and pending approval workflows.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/control-center/courses/approvals"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-xs font-black text-white hover:bg-[#E85D2A] transition-colors shadow-xs"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Review Queue ({metrics.pendingApprovalsCount})</span>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Recorded Paid Orders"
          value={metrics.paidOrders}
          subValue="Payment provider not configured"
          icon={IndianRupee}
          variant="orange"
        />
        <StatCard
          label="Platform Revenue"
          value="Unavailable"
          subValue="No payment or payout ledger"
          icon={TrendingUp}
          variant="navy"
        />
        <StatCard
          label="Pending Approvals"
          value={metrics.pendingApprovalsCount}
          subValue={metrics.pendingApprovalsCount > 0 ? "Action required" : "Queue clear"}
          icon={ClipboardCheck}
          variant={metrics.pendingApprovalsCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Catalog Courses"
          value={metrics.totalCoursesCount}
          subValue={`${metrics.publishedCoursesCount} published`}
          icon={BookOpen}
        />
        <StatCard
          label="Active Tutors"
          value={metrics.activeTutorsCount}
          subValue="Active instructor accounts"
          icon={GraduationCap}
        />
        <StatCard
          label="Learner Accounts"
          value={metrics.learnersCount}
          subValue={`${metrics.certificatesIssuedCount} certificates`}
          icon={Users}
        />
      </div>

      {/* Action Center Banner / Pending Approvals */}
      {actionCenter.pendingApprovals.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#172033]">
                  Action Center: {actionCenter.pendingApprovals.length} Course(s) Awaiting Review
                </h3>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  Instructors have submitted curriculum updates and margin proposals for administrative sign-off.
                </p>
              </div>
            </div>
            <Link
              href="/control-center/courses/approvals"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#172033] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#26344D] transition-colors"
            >
              <span>Process Review Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {actionCenter.pendingApprovals.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-white p-3 shadow-2xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="truncate text-xs font-bold text-[#172033]">{item.title}</p>
                  <p className="text-[11px] text-[#64748B]">by {item.instructorName}</p>
                </div>
                <Link
                  href={`/control-center/courses/approvals`}
                  className="shrink-0 rounded-lg bg-[#FFF0EB] px-2.5 py-1 text-[11px] font-bold text-[#FF6B35] hover:bg-[#FFE3D8]"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle Grid: Operational Distributions & Top Performing Courses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Course Status Distribution */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172033]">Marketplace Health</h3>
            <span className="text-xs font-medium text-[#64748B]">Status Distribution</span>
          </div>

          <div className="mt-5 space-y-3">
            {courseStatusDistribution.map((item) => {
              const total = metrics.totalCoursesCount || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#64748B] capitalize">{item.status.replace("_", " ")}</span>
                    <span className="text-[#172033]">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                    <div
                      className={`h-full rounded-full ${
                        item.status === "published"
                          ? "bg-emerald-500"
                          : item.status === "pending_approval"
                          ? "bg-amber-500"
                          : item.status === "rejected"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-[#E5E7EB] pt-4">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Live Classes</span>
                <p className="mt-0.5 text-base font-black text-[#172033]">{metrics.liveClassesCount}</p>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Certificates</span>
                <p className="mt-0.5 text-base font-black text-[#172033]">{metrics.certificatesIssuedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#172033]">Top Catalog Offerings</h3>
              <p className="text-xs text-[#64748B]">Ranked by student enrollment volume and ratings</p>
            </div>
            <Link
              href="/control-center/courses"
              className="text-xs font-bold text-[#FF6B35] hover:text-[#E85D2A] inline-flex items-center gap-1"
            >
              <span>View All Catalog</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#64748B]">
                  <th className="pb-2.5 font-bold uppercase tracking-wider text-[10px]">Course</th>
                  <th className="pb-2.5 font-bold uppercase tracking-wider text-[10px]">Instructor</th>
                  <th className="pb-2.5 font-bold uppercase tracking-wider text-[10px]">Price</th>
                  <th className="pb-2.5 font-bold uppercase tracking-wider text-[10px]">Learners</th>
                  <th className="pb-2.5 font-bold uppercase tracking-wider text-[10px]">Rating</th>
                  <th className="pb-2.5 text-right font-bold uppercase tracking-wider text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {topCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 font-bold text-[#172033] max-w-[200px] truncate">{c.title}</td>
                    <td className="py-3 text-[#64748B]">{c.instructorName}</td>
                    <td className="py-3 font-semibold text-[#172033]">{formatRupees(c.priceMinor)}</td>
                    <td className="py-3 text-[#172033] font-bold">{c.enrollments}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        ★ {c.rating ? c.rating.toFixed(1) : "5.0"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/control-center/pricing`}
                        className="rounded-lg bg-[#F1F5F9] px-2 py-1 text-[11px] font-bold text-[#172033] hover:bg-[#E2E8F0]"
                      >
                        Pricing
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Orders & Audit Activity Trail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Commerce Transactions */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#172033]">Recent Order Records</h3>
              <p className="text-xs text-[#64748B]">Stored order quotes and statuses; payments are not connected</p>
            </div>
            <Link
              href="/control-center/orders"
              className="text-xs font-bold text-[#FF6B35] hover:text-[#E85D2A] inline-flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#64748B]">No orders recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3 text-xs"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#64748B]">{order.id}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <p className="mt-1 truncate font-bold text-[#172033]">{order.courseTitle}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {order.userName} ({order.userEmail})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#172033]">{formatRupees(order.totalMinor)}</span>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Trail / Recent Activity */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#172033]">Platform Audit Trail</h3>
              <p className="text-xs text-[#64748B]">Approval actions, price approvals, and system events</p>
            </div>
            <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-bold text-[#64748B]">
              Immutable log
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#64748B]">No recent review actions logged.</p>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
              {recentActivity.slice(0, 5).map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#FF6B35]" />
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#172033] capitalize">
                        {event.action.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        by {event.actorName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-[#64748B]">{event.entityTitle}</p>
                    {event.feedback && (
                      <p className="mt-1 rounded-md bg-[#F8FAFC] p-2 text-[11px] text-[#475569] italic border border-[#E2E8F0]">
                        &quot;{event.feedback}&quot;
                      </p>
                    )}
                    <span className="mt-1 block text-[10px] text-[#94A3B8]">
                      {new Date(event.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
