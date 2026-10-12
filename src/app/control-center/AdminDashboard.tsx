"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Clock3, LogOut, Search, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { useActionDialog } from "@/components/ui/ActionDialogProvider";

type Pricing = { basePriceMinor: number | null; currency: string; minMarginBps: number; maxMarginBps: number;
  maxFinalMinor: number | null; proposedMarginBps: number | null; proposedFinalMinor: number | null;
  approvedMarginBps: number | null; finalPriceMinor: number | null; status: string };
type Course = { id: string; title: string; slug: string; status: string; review_status: string; reviewStatus?: string;
  instructor_name: string; instructor_email: string; updated_at: string; price_minor: number; currency: string; pricing: Pricing | null };
type Detail = { course: { title: string; subtitle: string; description: string; thumbnail: string | null; status: string;
  metadata: { whatYouWillLearn?: string[]; requirements?: string[] };
  sections: Array<{ title: string; lessons: Array<{ title: string; type: string; description: string; durationSeconds: number }> }> };
  history: Array<{ action: string; feedback: string; created_at: string; actor_name: string }> };
type Metrics = { totalCourses: number; pendingApprovals: number; publishedCourses: number; tutors: number; learners: number };
const rupees = (minor: number | null | undefined) => minor === null || minor === undefined ? "Not set" : `₹${(minor / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Request failed.");
  return body.data;
}

export default function AdminDashboard({ name }: { name: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { confirm } = useActionDialog();
  const [courses, setCourses] = useState<Course[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Course | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [base, setBase] = useState(2000);
  const [minMargin, setMinMargin] = useState(10);
  const [maxMargin, setMaxMargin] = useState(25);
  const [cap, setCap] = useState("");
  const [approvedMargin, setApprovedMargin] = useState(20);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reload = useCallback(async () => {
    try {
      const result = await api(`/api/admin/courses?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`);
      setCourses(result.courses);
      setMetrics(result.metrics);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load courses."); }
    finally { setLoading(false); }
  }, [search, status]);
  useEffect(() => {
    let active = true;
    void api(`/api/admin/courses?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`)
      .then((result) => {
        if (!active) return;
        setCourses(result.courses);
        setMetrics(result.metrics);
        setError("");
        setLoading(false);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Unable to load courses.");
        setLoading(false);
      });
    return () => { active = false; };
  }, [search, status]);

  async function select(course: Course) {
    setSelected(course); setDetail(null); setFeedback(""); setError(""); setSuccess("");
    setBase((course.pricing?.basePriceMinor ?? 200000) / 100);
    setMinMargin((course.pricing?.minMarginBps ?? 1000) / 100);
    setMaxMargin((course.pricing?.maxMarginBps ?? 2500) / 100);
    setCap(course.pricing?.maxFinalMinor === null || course.pricing?.maxFinalMinor === undefined ? "" : String(course.pricing.maxFinalMinor / 100));
    setApprovedMargin((course.pricing?.proposedMarginBps ?? course.pricing?.approvedMarginBps ?? 2000) / 100);
    try { setDetail(await api(`/api/admin/courses/${encodeURIComponent(course.id)}`)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load course detail."); }
  }

  async function mutate(path: string, method: string, payload: Record<string, unknown>, confirmation?: string) {
    if (!selected || (confirmation && !await confirm(confirmation, { title: "Confirm course change", danger: /unpublish|reject/i.test(confirmation) }))) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      await api(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setSuccess("Change saved. The course and audit history have been updated.");
      const refreshed = await api(`/api/admin/courses/${encodeURIComponent(selected.id)}`);
      setDetail(refreshed);
      await reload();
      const row = (await api("/api/admin/courses")).courses.find((item: Course) => item.id === selected.id);
      if (row) setSelected(row);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save change."); }
    finally { setBusy(false); }
  }

  async function signOut() { if (await logout()) { router.replace("/control-center/login"); router.refresh(); } }
  const fields = [
    ["Total courses", metrics?.totalCourses, BookOpen], ["Pending approvals", metrics?.pendingApprovals, Clock3],
    ["Published", metrics?.publishedCourses, CheckCircle2], ["Tutors", metrics?.tutors, Users], ["Learners", metrics?.learners, Users],
  ] as const;
  const id = selected?.id;
  const marginBps = Math.round(approvedMargin * 100);
  const proposedFinal = selected?.pricing?.basePriceMinor === null || selected?.pricing?.basePriceMinor === undefined ? null :
    selected.pricing.basePriceMinor + Math.round(selected.pricing.basePriceMinor * marginBps / 10000);

  return <main className="min-h-screen bg-[#F7F8FA] text-[#172033]">
    <header className="bg-[#172033] px-5 py-5 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><div className="flex items-center gap-3"><Logo href="/control-center" inverse /><div><p className="text-xl font-extrabold">Admin</p><p className="text-xs text-slate-300">Course approvals and pricing</p></div></div><div className="flex items-center gap-4 text-sm"><span className="hidden sm:inline">{name}</span><button onClick={signOut} className="flex items-center gap-2 rounded-xl border border-slate-500 px-3 py-2 hover:bg-slate-700"><LogOut size={16} /> Log out</button></div></div></header>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
      <div><h1 className="text-3xl font-extrabold">Admin dashboard</h1><p className="mt-1 text-sm text-[#64748B]">Review tutor submissions, approve prices, and publish courses explicitly.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{fields.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4"><Icon className="text-[#FF6B35]" size={19} /><p className="mt-3 text-2xl font-extrabold">{value ?? "—"}</p><p className="text-xs font-semibold text-[#64748B]">{label}</p></div>)}</div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}{success && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{success}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)]">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Courses</h2><span className="text-xs text-[#64748B]">{courses.length} shown</span></div>
          <div className="mt-4 flex flex-wrap gap-3"><label className="relative flex-1"><Search className="absolute left-3 top-3 text-[#64748B]" size={16} /><span className="sr-only">Search courses</span><input value={search} onChange={(event) => { setLoading(true); setSearch(event.target.value); }} placeholder="Search course or tutor" className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-9 pr-3 text-sm" /></label><label><span className="sr-only">Filter status</span><select value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value); }} className="rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm"><option value="">All statuses</option>{["pending_approval", "approved", "published", "rejected", "draft", "unpublished"].map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label></div>
          {loading ? <p className="py-8 text-sm text-[#64748B]">Loading courses…</p> : courses.length === 0 ? <p className="py-8 text-sm text-[#64748B]">No courses match this view. Try another search or status.</p> : <div className="mt-4 max-h-[720px] space-y-2 overflow-auto">{courses.map((course) => <button key={course.id} onClick={() => void select(course)} className={`w-full rounded-xl border p-4 text-left hover:border-[#FF6B35] ${selected?.id === course.id ? "border-[#FF6B35] bg-orange-50" : "border-[#E5E7EB]"}`}><div className="flex justify-between gap-3"><strong className="text-sm">{course.title}</strong><span className="text-xs font-bold uppercase text-[#FF6B35]">{course.status === "published" ? "Published" : course.review_status.replaceAll("_", " ")}</span></div><p className="mt-1 text-xs text-[#64748B]">{course.instructor_name} · {rupees(course.price_minor)} · {new Date(course.updated_at).toLocaleDateString("en-IN")}</p></button>)}</div>}</section>
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">{!selected ? <div className="py-12 text-center text-sm text-[#64748B]">Select a course to review its content, pricing, and history.</div> : <div className="space-y-6"><div><h2 className="text-xl font-bold">{selected.title}</h2><p className="mt-1 text-xs text-[#64748B]">{selected.instructor_name} · {selected.instructor_email}</p><p className="mt-1 text-xs text-[#64748B]">Status: {selected.status === "published" ? "published" : selected.review_status} · Updated {new Date(selected.updated_at).toLocaleString("en-IN")}</p></div>
          {!detail ? <p className="text-sm text-[#64748B]">Loading course details…</p> : <><div className="rounded-xl bg-[#F7F8FA] p-4"><h3 className="font-bold">Content preview</h3>{detail.course.thumbnail && <img src={detail.course.thumbnail} alt="Course thumbnail" className="mt-3 h-36 w-full rounded-xl object-cover" />}<p className="mt-2 text-sm font-semibold">{detail.course.subtitle}</p><p className="mt-2 text-xs text-[#64748B]">{detail.course.description}</p><p className="mt-3 text-xs"><strong>Outcomes:</strong> {(detail.course.metadata.whatYouWillLearn || []).join("; ") || "None provided"}</p><p className="mt-1 text-xs"><strong>Requirements:</strong> {(detail.course.metadata.requirements || []).join("; ") || "None provided"}</p><ul className="mt-3 space-y-3 text-xs">{detail.course.sections.map((section, index) => <li key={index}><strong>{section.title}</strong><ul className="mt-1 space-y-1 pl-4 text-[#64748B]">{section.lessons.map((lesson, lessonIndex) => <li key={lessonIndex}>{lesson.title} · {lesson.type} · {Math.ceil(lesson.durationSeconds / 60)} min{lesson.description && <p className="whitespace-pre-wrap">{lesson.description}</p>}</li>)}</ul></li>)}</ul></div>
          <div className="space-y-3 border-t border-[#E5E7EB] pt-5"><h3 className="font-bold">Official pricing · INR</h3><p className="text-xs text-[#64748B]">Tutor margin is an amount added to the admin base price. It is not a payout or commission. Final = base + rounded(base × margin%).</p><div className="grid grid-cols-2 gap-3">{[["Base price ₹", base, setBase], ["Minimum margin %", minMargin, setMinMargin], ["Maximum margin %", maxMargin, setMaxMargin]].map(([label, value, setter]) => <label key={String(label)} className="text-xs font-semibold">{String(label)}<input type="number" min="0" step={String(label).includes("price") ? "0.01" : "0.01"} value={value as number} onChange={(event) => (setter as (n: number) => void)(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" /></label>)}<label className="text-xs font-semibold">Maximum final ₹ (optional)<input type="number" min="0" step="0.01" value={cap} onChange={(event) => setCap(event.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" /></label></div><button disabled={busy || selected.status === "published"} onClick={() => void mutate(`/api/admin/courses/${id}/pricing`, "PUT", { basePriceMinor: Math.round(base * 100), minMarginBps: Math.round(minMargin * 100), maxMarginBps: Math.round(maxMargin * 100), maxFinalMinor: cap === "" ? null : Math.round(Number(cap) * 100) }, "Change this course's official pricing policy? Existing approval will be cleared.")} className="rounded-xl bg-[#172033] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Save pricing policy</button>
          <div className="grid grid-cols-2 gap-3 text-xs"><p>Proposed margin: {selected.pricing?.proposedMarginBps === null || selected.pricing?.proposedMarginBps === undefined ? "None" : `${selected.pricing.proposedMarginBps / 100}%`}</p><p>Proposed final: {rupees(selected.pricing?.proposedFinalMinor)}</p><p>Approved final: {rupees(selected.pricing?.finalPriceMinor)}</p><p>Pricing status: {selected.pricing?.status || "pending"}</p></div><label className="block text-xs font-semibold">Approved margin override %<input type="number" min="0" step="0.01" value={approvedMargin} onChange={(event) => setApprovedMargin(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" /></label><p className="text-xs">Calculated final at this margin: <strong>{rupees(proposedFinal)}</strong></p><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => void mutate(`/api/admin/courses/${id}/pricing`, "POST", { action: "approve", marginBps }, "Approve this pricing and set the official course price?")} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Approve price</button><button disabled={busy} onClick={() => void mutate(`/api/admin/courses/${id}/pricing`, "POST", { action: "request_changes", feedback }, "Request pricing changes from the tutor?")} className="rounded-lg border px-3 py-2 text-xs font-bold">Request changes</button><button disabled={busy} onClick={() => void mutate(`/api/admin/courses/${id}/pricing`, "POST", { action: "reject", feedback }, "Reject this pricing proposal?")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Reject price</button></div></div>
          <div className="space-y-3 border-t border-[#E5E7EB] pt-5"><h3 className="font-bold">Course review</h3><label className="block text-xs font-semibold">Feedback / rejection reason<textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-[#E5E7EB] p-3 text-sm" /></label><div className="flex flex-wrap gap-2">{(["approve", "reject", "publish", "unpublish"] as const).map((action) => <button key={action} disabled={busy} onClick={() => void mutate(`/api/admin/courses/${id}/review`, "POST", { action, feedback }, `${action[0].toUpperCase() + action.slice(1)} this course? This action is recorded in approval history.`)} className={`rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50 ${action === "reject" || action === "unpublish" ? "bg-red-600" : "bg-[#FF6B35]"}`}>{action[0].toUpperCase() + action.slice(1)}</button>)}</div></div>
          <div className="border-t border-[#E5E7EB] pt-5"><h3 className="font-bold">Approval history</h3>{detail.history.length ? <ul className="mt-3 space-y-2 text-xs">{detail.history.map((event, index) => <li key={index} className="rounded-lg bg-[#F7F8FA] p-3"><strong>{event.action.replaceAll("_", " ")}</strong> · {event.actor_name} · {new Date(event.created_at).toLocaleString("en-IN")}{event.feedback && <p className="mt-1 text-[#64748B]">{event.feedback}</p>}</li>)}</ul> : <p className="mt-2 text-xs text-[#64748B]">No actions recorded yet.</p>}</div></>}</div>}</section>
      </div>
    </div>
  </main>;
}
