"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

export function PersonalPlanPricing() {
  const [monthly, setMonthly] = useState("");
  const [annual, setAnnual] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/admin/personal-plan", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load Personal Plan prices.");
      if (active) { setMonthly(body.data.monthlyPriceMinor === null ? "" : String(body.data.monthlyPriceMinor / 100)); setAnnual(body.data.annualPriceMinor === null ? "" : String(body.data.annualPriceMinor / 100)); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load prices."); });
    return () => { active = false; };
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const minor = (value: string) => value.trim() === "" ? null : Math.round(Number(value) * 100);
    try {
      const response = await fetch("/api/admin/personal-plan", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ monthlyPriceMinor: minor(monthly), annualPriceMinor: minor(annual) }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to save prices.");
      setMessage("Personal Plan prices saved. Subscription checkout remains unavailable until recurring billing is configured.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save prices."); }
    finally { setBusy(false); }
  }
  return <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-[#172033]">Personal Plan prices</h2><p className="mt-1 text-sm text-[#64748B]">Set the monthly and annual prices in INR. Leave either blank to hide that option.</p></div><Link href="/personal-plan" className="text-sm font-bold text-[#E85D2A]">Preview plan →</Link></div><form onSubmit={save} className="mt-5 flex flex-wrap items-end gap-4"><label className="text-sm font-semibold">Monthly price (₹)<input type="number" min="1" max="1000000" step="0.01" value={monthly} onChange={(event) => setMonthly(event.target.value)} className="mt-1 block w-48 rounded-xl border border-[#CBD5E1] px-3 py-2.5" /></label><label className="text-sm font-semibold">Annual price (₹)<input type="number" min="1" max="1000000" step="0.01" value={annual} onChange={(event) => setAnnual(event.target.value)} className="mt-1 block w-48 rounded-xl border border-[#CBD5E1] px-3 py-2.5" /></label><button disabled={busy} className="rounded-xl bg-[#172033] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Save plan prices"}</button></form>{message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<p className="mt-4 text-xs text-[#64748B]">These prices are for display and planning. Recurring payment, cancellation, and subscription access are not active yet.</p></section>;
}
