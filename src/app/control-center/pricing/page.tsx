"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Calculator,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Percent,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { PersonalPlanPricing } from "@/components/admin/PersonalPlanPricing";
import { useActionDialog } from "@/components/ui/ActionDialogProvider";

interface CourseRow {
  id: string;
  title: string;
  status: string;
  instructor_name: string;
  price_minor: number;
  pricing: {
    basePriceMinor: number | null;
    currency: string;
    minMarginBps: number;
    maxMarginBps: number;
    maxFinalMinor: number | null;
    proposedMarginBps: number | null;
    approvedMarginBps: number | null;
    finalPriceMinor: number | null;
    status: string;
  } | null;
}

const formatRupees = (minor: number | null | undefined) =>
  minor === null || minor === undefined ? "—" : `₹${(minor / 100).toLocaleString("en-IN")}`;

export default function AdminPricingPage() {
  const { confirm } = useActionDialog();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestedCourseId, setRequestedCourseId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("courseId"));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Form states for the selected course
  const [basePrice, setBasePrice] = useState<number>(2000);
  const [minMargin, setMinMargin] = useState<number>(10);
  const [maxMargin, setMaxMargin] = useState<number>(25);
  const [capPrice, setCapPrice] = useState<string>("");
  const [approvedMargin, setApprovedMargin] = useState<number>(20);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ page: String(page), pageSize: "25", search });
      if (requestedCourseId) query.set("courseId", requestedCourseId);
      const res = await fetch(`/api/admin/courses?${query}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load courses");
      const list = json.data.courses || [];
      setCourses(list);
      setTotal(json.data.pagination?.total || 0);
      if (list.length > 0 && !list.some((course: CourseRow) => course.id === selectedId)) {
        selectCourse(list[0]);
      } else if (list.length === 0) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadCourses);
  }, [search, page, requestedCourseId]);

  function selectCourse(course: CourseRow) {
    setSelectedId(course.id);
    setError("");
    setSuccess("");
    const p = course.pricing;
    setBasePrice((p?.basePriceMinor ?? 200000) / 100);
    setMinMargin((p?.minMarginBps ?? 1000) / 100);
    setMaxMargin((p?.maxMarginBps ?? 2500) / 100);
    setCapPrice(p?.maxFinalMinor ? String(p.maxFinalMinor / 100) : "");
    setApprovedMargin((p?.approvedMarginBps ?? p?.proposedMarginBps ?? 2000) / 100);
  }

  const selectedCourse = courses.find((c) => c.id === selectedId);

  // Interactive Live Calculation
  const baseMinor = Math.round(basePrice * 100);
  const marginBps = Math.round(approvedMargin * 100);
  const computedMarkupMinor = Math.round(baseMinor * marginBps / 10_000);
  const rawFinalMinor = baseMinor + computedMarkupMinor;
  const exceedsCap = capPrice.trim() !== "" && rawFinalMinor > Math.round(Number(capPrice) * 100);

  const handleSavePolicy = async () => {
    if (!selectedId) return;
    const published = selectedCourse?.status === "published";
    if (!await confirm(published
      ? "Save this official price for future course purchases? Existing orders keep their original price."
      : "Update this course's base price and margin limits? Any previous price approval will be cleared.",
      { title: published ? "Update official price" : "Update pricing policy", confirmLabel: published ? "Save price" : "Update pricing" })) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        basePriceMinor: Math.round(basePrice * 100),
        minMarginBps: Math.round(minMargin * 100),
        maxMarginBps: Math.round(maxMargin * 100),
        maxFinalMinor: capPrice.trim() ? Math.round(Number(capPrice) * 100) : null,
        ...(published ? { approvedMarginBps: Math.round(approvedMargin * 100) } : {}),
      };

      const res = await fetch(`/api/admin/courses/${selectedId}/pricing`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update pricing policy");

      setSuccess(published ? "Official price saved for future purchases." : "Pricing policy saved. Approve a margin separately before publication.");
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveMargin = async () => {
    if (!selectedId || !await confirm("Approve this margin and set the official course price?",
      { title: "Approve official price", confirmLabel: "Approve price" })) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/admin/courses/${selectedId}/pricing`, { method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve", marginBps: Math.round(approvedMargin * 100) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Unable to approve price.");
      setSuccess("Official price approved and saved.");
      await loadCourses();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to approve price."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing & Margin Workspace"
        subtitle="Operational economics console. Base price floors, instructor margin bands (bps), price ceiling caps, and final checkout rate authority."
        breadcrumbs={[{ label: "Commerce" }, { label: "Pricing & Margins" }]}
      />
      <PersonalPlanPricing />

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
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List of Courses */}
        <div className="lg:col-span-5 space-y-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Course Pricing Registry ({total})
            </span>
            <input aria-label="Search course pricing" value={search} onChange={(event) => { setRequestedCourseId(null); setSearch(event.target.value); setPage(1); }} placeholder="Search course or tutor" className="mt-3 w-full rounded-xl border border-[#E5E7EB] p-2 text-xs" />

            <div className="mt-3 divide-y divide-[#F1F5F9] max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-xs text-[#64748B]">Loading courses…</div>
              ) : (
                courses.map((course) => {
                  const isSelected = course.id === selectedId;
                  const finalMinor = course.pricing?.finalPriceMinor ?? course.price_minor;
                  return (
                    <button
                      key={course.id}
                      onClick={() => selectCourse(course)}
                      className={`w-full text-left py-3 px-2 rounded-xl transition-colors flex items-center justify-between ${
                        isSelected ? "bg-[#FFF0EB] text-[#FF6B35]" : "hover:bg-[#F8FAFC] text-[#172033]"
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold truncate">{course.title}</p>
                        <p className="text-[10px] text-[#94A3B8]">by {course.instructor_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono">{formatRupees(finalMinor)}</span>
                        <div className="mt-0.5">
                          <StatusBadge status={course.pricing?.status || "pending"} size="sm" />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-3 flex justify-between text-xs text-[#64748B]"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Previous</button><span>{page} / {Math.max(1, Math.ceil(total / 25))}</span><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Next</button></div>
          </div>
        </div>

        {/* Right Pricing Calculator & Policy Controller */}
        <div className="lg:col-span-7">
          {selectedCourse && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#94A3B8]">{selectedCourse.id}</span>
                  <h3 className="text-base font-black text-[#172033]">{selectedCourse.title}</h3>
                  <p className="text-xs text-[#64748B]">Instructor: {selectedCourse.instructor_name}</p>
                  <Link href={`/control-center/courses/${selectedCourse.id}`} className="mt-2 inline-block text-xs font-bold text-[#FF6B35] hover:underline">Back to course review →</Link>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Current Status</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedCourse.pricing?.status || "pending"} />
                  </div>
                </div>
              </div>

              {/* Calculator Form */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="admin-base-price" className="block text-xs font-bold text-[#172033] mb-1">
                    Platform Base Floor Price (₹)
                  </label>
                  <input
                    id="admin-base-price"
                    type="number"
                    min="1"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 text-xs text-[#172033] focus:border-[#FF6B35] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#94A3B8] mt-1 block">
                    Base cost before tutor markup
                  </span>
                </div>

                <div>
                  <label htmlFor="admin-approved-margin" className="block text-xs font-bold text-[#172033] mb-1">
                    Approved Tutor Margin (%)
                  </label>
                  <input
                    id="admin-approved-margin"
                    type="number"
                    min="0"
                    max="100"
                    value={approvedMargin}
                    onChange={(e) => setApprovedMargin(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 text-xs text-[#172033] focus:border-[#FF6B35] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#94A3B8] mt-1 block">
                    Markup added to base price
                  </span>
                </div>

                <div>
                  <label htmlFor="admin-min-margin" className="block text-xs font-bold text-[#172033] mb-1">
                    Min Tutor Margin Allowance (%)
                  </label>
                  <input
                    id="admin-min-margin"
                    type="number"
                    min="0"
                    max="100"
                    value={minMargin}
                    onChange={(e) => setMinMargin(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 text-xs text-[#172033] focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-max-margin" className="block text-xs font-bold text-[#172033] mb-1">
                    Max Tutor Margin Allowance (%)
                  </label>
                  <input
                    id="admin-max-margin"
                    type="number"
                    min="0"
                    max="100"
                    value={maxMargin}
                    onChange={(e) => setMaxMargin(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 text-xs text-[#172033] focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="admin-price-cap" className="block text-xs font-bold text-[#172033] mb-1">
                    Hard Price Ceiling Cap (₹, optional)
                  </label>
                  <input
                    id="admin-price-cap"
                    type="number"
                    value={capPrice}
                    placeholder="e.g. 5000 (leaves blank for no cap)"
                    onChange={(e) => setCapPrice(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 text-xs text-[#172033] focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-time Math Summary Card */}
              <div className="rounded-2xl border border-[#FFD8CA] bg-[#FFF0EB]/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4 text-[#FF6B35]" />
                  <span className="text-xs font-bold text-[#172033]">Live Economics Simulation</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Base Floor:</span>
                    <span className="font-semibold text-[#172033]">{formatRupees(baseMinor)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Tutor Margin (+{approvedMargin}%):</span>
                    <span className="font-semibold text-[#172033]">+{formatRupees(computedMarkupMinor)}</span>
                  </div>
                  <div className="border-t border-[#FFD8CA] pt-2 flex justify-between font-bold text-sm text-[#172033]">
                    <span>Catalog Checkout Price:</span>
                    <span className="text-[#FF6B35] font-black text-base">
                      {formatRupees(rawFinalMinor)}
                    </span>
                  </div>
                </div>
              </div>
              {exceedsCap && <p role="alert" className="text-xs font-bold text-red-700">This margin exceeds the configured final-price cap. Reduce the margin or change the cap before approval.</p>}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={saving || exceedsCap}
                  onClick={handleSavePolicy}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#26344D] disabled:opacity-50 shadow-xs"
                >
                  <Save className="h-4 w-4 text-[#FF6B35]" />
                  <span>{saving ? "Saving…" : selectedCourse.status === "published" ? "Save official price" : "Commit Pricing Policy"}</span>
                </button>
                {selectedCourse.status !== "published" && <button type="button" disabled={saving || exceedsCap} onClick={handleApproveMargin} className="ml-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">Approve margin</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
