"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type CourseOption = { id: string; title: string; selected: boolean };

export function PersonalPlanPricing() {
  const [monthly, setMonthly] = useState("");
  const [annual, setAnnual] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/personal-plan", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load Personal Plan settings.");
      if (!active) return;
      setMonthly(body.data.monthlyPriceMinor === null ? "" : String(body.data.monthlyPriceMinor / 100));
      setAnnual(body.data.annualPriceMinor === null ? "" : String(body.data.annualPriceMinor / 100));
      setCourses(body.data.courses);
      setSelectedIds(body.data.courses.filter((course: CourseOption) => course.selected).map((course: CourseOption) => course.id));
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load plan settings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleCourses = useMemo(() => courses.filter((course) => course.title.toLowerCase().includes(search.trim().toLowerCase())), [courses, search]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const minor = (value: string) => value.trim() === "" ? null : Math.round(Number(value) * 100);
    try {
      const response = await fetch("/api/admin/personal-plan", { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyPriceMinor: minor(monthly), annualPriceMinor: minor(annual), courseIds: selectedIds }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to save plan settings.");
      setMessage("Plan settings saved. Subscription checkout remains unavailable until recurring billing is configured.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save plan settings."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-[#172033]">Personal Plan</h2><p className="mt-1 text-sm text-[#64748B]">Set the prices and choose which published courses the plan will include.</p></div><Link href="/personal-plan" className="text-sm font-bold text-[#E85D2A]">Preview plan →</Link></div>
    {loading ? <p role="status" className="mt-5 text-sm text-[#64748B]">Loading plan settings…</p> : <form onSubmit={save} className="mt-5 space-y-6">
      <div className="flex flex-wrap gap-4"><label className="text-sm font-semibold">Monthly price (₹)<input type="number" min="1" max="1000000" step="0.01" value={monthly} onChange={(event) => setMonthly(event.target.value)} className="mt-1 block w-48 rounded-xl border border-[#CBD5E1] px-3 py-2.5" /></label><label className="text-sm font-semibold">Annual price (₹)<input type="number" min="1" max="1000000" step="0.01" value={annual} onChange={(event) => setAnnual(event.target.value)} className="mt-1 block w-48 rounded-xl border border-[#CBD5E1] px-3 py-2.5" /></label></div>
      <div className="border-t border-[#E5E7EB] pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-[#172033]">Included courses</h3><p className="text-xs text-[#64748B]">{selectedIds.length} selected from {courses.length} published courses. Unpublished courses disappear from the public plan.</p></div><label className="text-xs font-semibold">Search courses<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Course title" className="ml-2 rounded-lg border border-[#CBD5E1] px-3 py-2" /></label></div><div className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-[#E5E7EB] p-2">{visibleCourses.map((course) => <label key={course.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm hover:bg-[#F8FAFC]"><input type="checkbox" checked={selectedIds.includes(course.id)} onChange={(event) => setSelectedIds((previous) => event.target.checked ? [...previous, course.id] : previous.filter((id) => id !== course.id))} className="h-4 w-4 accent-[#FF6B35]" /><span>{course.title}</span></label>)}{visibleCourses.length === 0 && <p className="p-3 text-sm text-[#64748B]">No published courses match this search.</p>}</div></div>
      <button disabled={busy} className="rounded-xl bg-[#172033] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Save plan settings"}</button>
    </form>}
    {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <p className="mt-4 text-xs text-[#64748B]">These settings define the proposed plan. Recurring payment, cancellation, and subscription access are not active yet.</p>
  </section>;
}
