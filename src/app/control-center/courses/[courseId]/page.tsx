"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useActionDialog } from "@/components/ui/ActionDialogProvider";

const formatRupees = (minor: number | null | undefined) =>
  minor === null || minor === undefined ? "—" : `₹${(minor / 100).toLocaleString("en-IN")}`;

interface AdminCourseDetail {
  rawStatus: string;
  course: { id: string; title: string; subtitle?: string; description: string; price: number; status: string; reviewStatus: string;
    metadata?: { whatYouWillLearn?: string[] }; sections?: Array<{ title: string; lessons?: Array<{ title: string; type: string }> }> };
  pricing: { status: string; basePriceMinor: number | null; finalPriceMinor: number | null;
    minMarginBps: number; maxMarginBps: number; maxFinalMinor: number | null;
    proposedMarginBps: number | null; approvedMarginBps: number | null } | null;
  history: Array<{ action: string; feedback: string; created_at: string; actor_name: string }>;
}

export default function AdminCourseDetailPage() {
  const { confirm } = useActionDialog();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [data, setData] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [basePrice, setBasePrice] = useState("0");
  const [margin, setMargin] = useState("0");
  const [pricingReason, setPricingReason] = useState("");

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${courseId}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load course");
      setData(json.data);
      setBasePrice(String((json.data.pricing?.basePriceMinor ?? 0) / 100));
      setMargin(String((json.data.pricing?.approvedMarginBps ?? json.data.pricing?.proposedMarginBps ?? 0) / 100));
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
    if (action === "reject" && !feedback.trim()) {
      setError("Add a reason so the tutor knows what to change.");
      return;
    }
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

  const handleApprovePrice = async () => {
    if (!data) return;
    const baseMinor = Math.round(Number(basePrice) * 100);
    const marginBps = Math.round(Number(margin) * 100);
    const current = data.pricing;
    const newPaidPolicy = current?.basePriceMinor === null || current?.basePriceMinor === undefined ||
      (current.basePriceMinor === 0 && current.minMarginBps === 0 && current.maxMarginBps === 0);
    const minMarginBps = baseMinor === 0 ? 0 : newPaidPolicy ? 0 : current!.minMarginBps;
    const maxMarginBps = baseMinor === 0 ? 0 : newPaidPolicy ? 10_000 : current!.maxMarginBps;
    if (!Number.isFinite(baseMinor) || baseMinor < 0 || !Number.isFinite(marginBps) || marginBps < minMarginBps || marginBps > maxMarginBps) {
      setError(`Enter a valid base price and a margin from ${minMarginBps / 100}% to ${maxMarginBps / 100}%.`);
      return;
    }
    if (baseMinor === 0 && marginBps !== 0) {
      setError("A free course must have a 0% margin.");
      return;
    }
    if (current?.maxFinalMinor !== null && current?.maxFinalMinor !== undefined &&
      baseMinor + Math.round(baseMinor * marginBps / 10_000) > current.maxFinalMinor) {
      setError("The final price exceeds this course's price cap. Use Advanced pricing to change the cap.");
      return;
    }
    const policyChanged = current?.basePriceMinor !== baseMinor || current.minMarginBps !== minMarginBps || current.maxMarginBps !== maxMarginBps;
    const overridesTutor = current?.proposedMarginBps !== null && current?.proposedMarginBps !== undefined && current.proposedMarginBps !== marginBps;
    if (((policyChanged && current?.basePriceMinor !== null && current?.basePriceMinor !== undefined) || overridesTutor) && pricingReason.trim().length < 3) {
      setError("Add a short reason for changing the price policy or tutor's proposed margin.");
      return;
    }
    if (!await confirm(`Approve ${formatRupees(baseMinor + Math.round(baseMinor * marginBps / 10_000))} as the official course price?`,
      { title: "Approve course price", confirmLabel: "Approve price" })) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      if (policyChanged) {
        const policyResponse = await fetch(`/api/admin/courses/${courseId}/pricing`, {
          method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ basePriceMinor: baseMinor, minMarginBps, maxMarginBps,
            maxFinalMinor: current?.maxFinalMinor ?? null, reason: pricingReason.trim() }),
        });
        const policyResult = await policyResponse.json();
        if (!policyResponse.ok) throw new Error(policyResult.error?.message || "Could not save the price policy.");
      }
      const response = await fetch(`/api/admin/courses/${courseId}/pricing`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", marginBps, feedback: pricingReason.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Could not approve the price.");
      await loadDetail();
      setPricingReason("");
      setSuccess("Official price approved. You can now publish the course.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not approve the price. Check the saved policy before retrying.");
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
  const canReapprove = course.reviewStatus === "pending_approval" || (data.rawStatus === "draft" && (course.reviewStatus === "unpublished" ||
    (course.reviewStatus === "draft" && history.some((event) => event.action === "published"))));
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
            {course.status === "published" && (
              <button
                disabled={busy}
                onClick={() => handleAction("unpublish")}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
              >
                Unpublish
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

      <section aria-label="Publish course steps" className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-[#172033]">Publish this course</h2>
          <p className="mt-1 text-sm text-[#64748B]">Follow these steps here. Each step unlocks the next one.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-4">
            <p className="text-xs font-bold text-[#64748B]">1 · Review content</p>
            <p className="mt-2 text-sm font-semibold">{course.reviewStatus === "approved" || course.status === "published" ? "Approved" : "Check the course description and lessons below."}</p>
            {canReapprove && <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => void handleAction("approve")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Approve content</button>
              {course.reviewStatus === "pending_approval" && <button type="button" disabled={busy} onClick={() => void handleAction("reject")} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">Request changes</button>}
            </div>}
            {course.reviewStatus === "pending_approval" && <label className="mt-3 block text-xs font-semibold">Feedback for the tutor<textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-[#CBD5E1] p-2 text-sm" placeholder="Required when requesting changes" /></label>}
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-4">
            <p className="text-xs font-bold text-[#64748B]">2 · Set course price</p>
            <p className="mt-2 text-sm font-semibold">{pricing?.status === "approved" ? `Approved: ${formatRupees(pricing.finalPriceMinor)}` : "Set a base price and tutor margin."}</p>
            {course.status !== "published" && <div className="mt-3 space-y-2">
              <label className="block text-xs font-semibold">Base price (₹)<input type="number" min="0" step="0.01" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm" /></label>
              <label className="block text-xs font-semibold">Tutor margin (%)<input type="number" min="0" max="100" step="0.01" value={margin} onChange={(event) => setMargin(event.target.value)} className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm" /></label>
              <p className="text-xs text-[#64748B]">Learner price: {Number.isFinite(Number(basePrice)) && Number.isFinite(Number(margin)) ? formatRupees(Math.round(Number(basePrice) * 100) + Math.round(Math.round(Number(basePrice) * 100) * Number(margin) / 100)) : "—"}</p>
              <label className="block text-xs font-semibold">Reason, if changing a price or tutor proposal<textarea value={pricingReason} onChange={(event) => setPricingReason(event.target.value)} rows={2} maxLength={500} className="mt-1 w-full rounded-lg border border-[#CBD5E1] p-2 text-sm" /></label>
              <button type="button" disabled={busy || course.reviewStatus !== "approved"} onClick={() => void handleApprovePrice()} className="rounded-lg bg-[#172033] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Save and approve price</button>
            </div>}
            <Link href={`/control-center/pricing?courseId=${encodeURIComponent(course.id)}`} className="mt-3 inline-block text-xs font-bold text-[#FF6B35] hover:underline">Advanced pricing options</Link>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-4">
            <p className="text-xs font-bold text-[#64748B]">3 · Publish</p>
            <p className="mt-2 text-sm font-semibold">{course.status === "published" ? "Live in the catalog" : publishBlockReason || "Ready to publish."}</p>
            {course.status !== "published" && <button type="button" disabled={busy || Boolean(publishBlockReason)} aria-disabled={Boolean(publishBlockReason)} onClick={() => void handleAction("publish")} className="mt-4 rounded-lg bg-[#FF6B35] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Publish to Catalog</button>}
          </div>
        </div>
      </section>

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
