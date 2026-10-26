"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  IndianRupee,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  Sparkles,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useActionDialog } from "@/components/ui/ActionDialogProvider";

const formatRupees = (minor: number | null | undefined) =>
  minor === null || minor === undefined ? "—" : `₹${(minor / 100).toLocaleString("en-IN")}`;

interface AdminCourseDetail {
  rawStatus: string;
  course: { id: string; title: string; subtitle?: string; description: string; price: number; status: string; reviewStatus: string;
    metadata?: { whatYouWillLearn?: string[] }; sections?: Array<{ title: string; lessons?: Array<{ title: string; type: string }> }> };
  pricing: { status: string; basePriceMinor: number | null; finalPriceMinor: number | null } | null;
  history: Array<{ action: string; feedback: string; created_at: string; actor_name: string }>;
}

export default function AdminCourseDetailPage() {
  const { confirm } = useActionDialog();
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [data, setData] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${courseId}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load course");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) void Promise.resolve().then(() => loadDetail());
  }, [courseId]);

  const handleAction = async (action: "approve" | "reject" | "publish" | "unpublish") => {
    if ((action === "publish" || action === "unpublish") && !await confirm(`${action === "publish" ? "Publish this course to the marketplace" : "Unpublish this course and block new purchases"}?`,
      { title: action === "publish" ? "Publish course" : "Unpublish course", confirmLabel: action === "publish" ? "Publish" : "Unpublish", danger: action === "unpublish" })) return;
    setBusy(true);
    setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/review`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback: feedback.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Action failed");
      await loadDetail();
      setFeedback("");
      setSuccess(`Course ${action} action saved.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-[#64748B]">Loading course details…</div>;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-xs font-bold text-red-700">{error || "Course not found"}</p>
        <Link href="/control-center/courses" className="mt-4 inline-block text-xs font-bold text-[#FF6B35]">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const { course, pricing, history } = data;
  const outcomes = course.metadata?.whatYouWillLearn || [];
  const canReapprove = data.rawStatus === "draft" && (course.reviewStatus === "unpublished" ||
    (course.reviewStatus === "draft" && history.some((event) => event.action === "published")));
  const publishBlockReason = course.reviewStatus !== "approved"
    ? "Approve the course content before publishing."
    : pricing?.basePriceMinor === null || pricing?.basePriceMinor === undefined
      ? "Set an admin base price and approve the official course price before publishing."
      : pricing.status !== "approved" || pricing.finalPriceMinor === null || pricing.finalPriceMinor !== Math.round(course.price * 100)
        ? "Approve the official course price before publishing."
        : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        subtitle={course.subtitle || `Detailed inspect view for ${course.id}`}
        breadcrumbs={[
          { label: "Marketplace" },
          { label: "Courses", href: "/control-center/courses" },
          { label: course.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/control-center/courses"
              className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Back
            </Link>
            {canReapprove && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleAction("approve")}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Approve Content
              </button>
            )}
            {course.status === "published" ? (
              <button
                disabled={busy}
                onClick={() => handleAction("unpublish")}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
              >
                Unpublish
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                aria-disabled={Boolean(publishBlockReason)}
                onClick={() => publishBlockReason ? setError(publishBlockReason) : void handleAction("publish")}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50 ${publishBlockReason
                  ? "bg-slate-400 hover:bg-slate-500" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                Publish to Catalog
              </button>
            )}
          </div>
        }
      />
      {course.status !== "published" && publishBlockReason && (
        <div role="status" className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <span>{publishBlockReason}</span>
          {course.reviewStatus === "approved" && <Link href={`/control-center/pricing?courseId=${encodeURIComponent(course.id)}`}
            className="font-bold underline underline-offset-2 hover:text-[#172033]">Open this course in Pricing &amp; Margins</Link>}
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">{success}</p>}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Review Status</span>
          <div className="mt-2">
            <StatusBadge status={course.reviewStatus} />
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Public State</span>
          <div className="mt-2">
            <StatusBadge status={course.status} />
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Base Price</span>
          <p className="mt-1 text-lg font-black text-[#172033]">{formatRupees(pricing?.basePriceMinor)}</p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Final Catalog Price</span>
          <p className="mt-1 text-lg font-black text-[#FF6B35]">
            {formatRupees(pricing?.finalPriceMinor ?? Math.round(course.price * 100))}
          </p>
        </div>
      </div>

      {/* Main Details and Curriculum Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          {/* Course description */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#172033] mb-3">Course Description</h3>
            <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">
              {course.description || "No description provided."}
            </p>

            {outcomes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <h4 className="text-xs font-bold text-[#172033] mb-2">What learners will learn:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#64748B]">
                  {outcomes.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Curriculum Tree */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#172033] mb-4">Curriculum Structure</h3>
            <div className="space-y-4">
              {course.sections?.map((section, idx: number) => (
                <div key={idx} className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#172033]">
                      Section {idx + 1}: {section.title}
                    </h4>
                    <span className="text-[10px] text-[#94A3B8]">{section.lessons?.length || 0} lessons</span>
                  </div>
                  <div className="mt-3 divide-y divide-[#E5E7EB]">
                    {section.lessons?.map((lesson, lIdx: number) => (
                      <div key={lIdx} className="py-2 flex items-center justify-between text-xs">
                        <span className="text-[#475569]">{lesson.title}</span>
                        <span className="text-[10px] text-[#94A3B8] capitalize">{lesson.type || "video"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Audit History */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#172033] mb-4">Audit History</h3>
            <div className="space-y-4">
              {history?.map((h, i: number) => (
                <div key={i} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172033] capitalize">{h.action.replace("_", " ")}</span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#64748B]">by {h.actor_name}</p>
                  {h.feedback && (
                    <p className="mt-1 text-[11px] text-[#475569] italic bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      &quot;{h.feedback}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
