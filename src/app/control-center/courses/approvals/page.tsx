"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  IndianRupee,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Send,
  MessageSquare,
  HelpCircle,
  BadgeCheck,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";

interface CourseDetail {
  course: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    thumbnail: string | null;
    status: string;
    reviewStatus: string;
    price: number;
    metadata: {
      whatYouWillLearn?: string[];
      requirements?: string[];
    };
    sections: Array<{
      title: string;
      lessons: Array<{
        title: string;
        type: string;
        description: string;
        durationSeconds: number;
      }>;
    }>;
  };
  pricing: {
    basePriceMinor: number | null;
    currency: string;
    minMarginBps: number;
    maxMarginBps: number;
    maxFinalMinor: number | null;
    proposedMarginBps: number | null;
    proposedFinalMinor: number | null;
    approvedMarginBps: number | null;
    finalPriceMinor: number | null;
    status: string;
  } | null;
  history: Array<{
    id?: string;
    action: string;
    feedback: string;
    created_at: string;
    actor_name: string;
  }>;
}

interface PendingItem {
  id: string;
  title: string;
  instructor_name: string;
  instructor_email: string;
  updated_at: string;
  price_minor: number;
  review_status: string;
  pricing: CourseDetail["pricing"];
}

const formatRupees = (minor: number | null | undefined) =>
  minor === null || minor === undefined ? "—" : `₹${(minor / 100).toLocaleString("en-IN")}`;

export default function AdminReviewQueuePage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [approvedMarginPct, setApprovedMarginPct] = useState(20);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approvedCourseId, setApprovedCourseId] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses?status=pending_approval&page=${page}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load review queue");
      const list = json.data.courses || [];
      setItems(list);
      setTotal(json.data.pagination?.total || 0);
      if (list.length === 0 && page > 1) setPage(page - 1);
      setSelectedId((current) => list.some((item: PendingItem) => item.id === current) ? current : (list[0]?.id || null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching review queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadPending());
  }, [page]);

  useEffect(() => {
    if (!selectedId) {
      queueMicrotask(() => setDetail(null));
      return;
    }
    let active = true;
    queueMicrotask(() => setDetailLoading(true));
    fetch(`/api/admin/courses/${selectedId}`, { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.error) throw new Error(json.error.message || "Failed to load course detail");
        if (json.data) {
          setDetail(json.data);
          const propMargin = json.data.pricing?.proposedMarginBps ?? json.data.pricing?.approvedMarginBps ?? 2000;
          setApprovedMarginPct(propMargin / 100);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const handleAction = async (action: "approve" | "reject" | "request_changes") => {
    if (!selectedId) return;
    setBusy(true);
    setError("");
    setSuccess("");
    setApprovedCourseId(null);

    try {
      const res = await fetch(`/api/admin/courses/${selectedId}/review`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "request_changes" ? "reject" : action,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Action failed");

      setSuccess(action === "request_changes" ? "Course returned for changes." : `Course ${action === "approve" ? "approved" : "rejected"}.`);
      if (action === "approve") setApprovedCourseId(selectedId);
      await loadPending();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review submission failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Review & Quality Queue"
        subtitle="Operational workflow to review submitted courses, verify curriculum completeness, validate tutor margins, and approve publication."
        breadcrumbs={[{ label: "Marketplace" }, { label: "Courses" }, { label: "Review Queue" }]}
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
          {approvedCourseId && <Link href={`/control-center/courses/${approvedCourseId}`} className="ml-auto rounded-lg bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800">Continue to price &amp; publish →</Link>}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-[#64748B]">Loading queue…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-extrabold text-[#172033]">Review Queue Clear</h3>
          <p className="mt-1 text-xs text-[#64748B] max-w-sm mx-auto">
            All submitted courses have been reviewed and processed. Newly submitted courses from instructors will appear here automatically.
          </p>
          <Link
            href="/control-center/courses"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#172033] px-4 py-2 text-xs font-bold text-white hover:bg-[#26344D]"
          >
            <span>View All Catalog</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Queue List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Pending Submissions ({total})
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      setError("");
                      setSuccess("");
                      setApprovedCourseId(null);
                    }}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-[#FF6B35] bg-[#FFF0EB]/40 shadow-xs ring-1 ring-[#FF6B35]"
                        : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#172033] line-clamp-1">{item.title}</h4>
                      <StatusBadge status={item.review_status} size="sm" />
                    </div>
                    <p className="mt-1 text-[11px] text-[#64748B]">by {item.instructor_name}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span>{new Date(item.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      <span className="font-bold text-[#172033]">{formatRupees(item.price_minor)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-[#64748B]"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Previous</button><span>{page} / {Math.max(1, Math.ceil(total / 25))}</span><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Next</button></div>
          </div>

          {/* Right: Inspection & Decision Console */}
          <div className="lg:col-span-8">
            {detailLoading || !detail ? (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-xs text-[#64748B]">
                Loading inspection payload…
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-6">
                {/* Course Header Summary */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={detail.course.reviewStatus} />
                      <span className="text-[11px] font-mono text-[#94A3B8]">{detail.course.id}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-black text-[#172033]">{detail.course.title}</h2>
                    {detail.course.subtitle && (
                      <p className="mt-1 text-xs text-[#64748B]">{detail.course.subtitle}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Final Catalog Price</span>
                    <span className="text-xl font-black text-[#172033]">
                      {formatRupees(detail.pricing?.finalPriceMinor ?? Math.round(detail.course.price * 100))}
                    </span>
                  </div>
                </div>

                {/* Quality Audit Checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                    Curriculum Quality Verification
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-xs">
                      <span className="text-[#64748B]">Curriculum Sections</span>
                      <p className="mt-0.5 font-bold text-[#172033]">
                        {detail.course.sections?.length || 0} Sections
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-xs">
                      <span className="text-[#64748B]">Total Lessons</span>
                      <p className="mt-0.5 font-bold text-[#172033]">
                        {detail.course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0} Lessons
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-xs">
                      <span className="text-[#64748B]">Tutor Proposed Margin</span>
                      <p className="mt-0.5 font-bold text-[#172033]">
                        {detail.pricing?.proposedMarginBps ? `${detail.pricing.proposedMarginBps / 100}%` : "Default (20%)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sections Outline Inspection */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                    Syllabus Overview
                  </h4>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-3 space-y-2">
                    {detail.course.sections?.map((sec, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-bold text-[#172033]">
                          Section {idx + 1}: {sec.title}
                        </span>
                        <span className="ml-2 text-[11px] text-[#94A3B8]">
                          ({sec.lessons?.length || 0} items)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                  {/* Review decision */}
                <div className="border-t border-[#E5E7EB] pt-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Review decision
                  </h4>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleAction("reject")}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                      >
                        Reject Course
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/control-center/pricing?courseId=${encodeURIComponent(detail.course.id)}`}
                        className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-bold text-[#172033] hover:bg-[#F8FAFC]"
                      >
                        Configure Margin
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleAction("approve")}
                        className="rounded-xl bg-[#16A34A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#15803D] disabled:opacity-50 shadow-xs"
                      >
                        {busy ? "Processing…" : "Approve Course"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
