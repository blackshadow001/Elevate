"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

type Membership = { id: string; term: "monthly" | "annual"; priceMinor: number; status: string;
  currentEnd: number | null; nextChargeAt: number | null; cancelAtCycleEnd: boolean };
const date = (unix: number) => new Date(unix * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

export default function PersonalPlanAccountPage() {
  const { isReady, isAuthenticated } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    let active = true;
    fetch("/api/personal-plan/subscriptions", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not load your subscription.");
      if (active) setMembership(body.data);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load your subscription."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isReady, isAuthenticated]);

  async function action(path: "reconcile" | "cancel") {
    if (busy) return;
    if (path === "cancel" && !window.confirm(membership?.currentEnd
      ? "Cancel automatic renewal at the end of your current paid period?"
      : "Cancel this pending subscription checkout?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/personal-plan/subscriptions/${path}`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not update your subscription.");
      setMembership(body.data);
      setMessage(path === "cancel" ? membership?.currentEnd
        ? "Automatic renewal has been cancelled. Your paid access continues until the current period ends."
        : "Pending checkout cancelled." : "Subscription status updated.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your subscription."); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen bg-[#F7F8FA] text-[#172033]"><Navbar /><main className="mx-auto max-w-3xl px-5 py-12"><Link href="/personal-plan" className="text-sm font-bold text-[#E85D2A]">← Personal Plan</Link><h1 className="mt-5 text-3xl font-extrabold">Your Personal Plan</h1>
    {!isReady || loading && isAuthenticated ? <p role="status" className="mt-6 text-sm">Loading subscription…</p> : !isAuthenticated ? <p className="mt-6 rounded-xl bg-white p-5 text-sm">Please <Link href="/login" className="font-bold text-[#E85D2A]">sign in</Link> to view your subscription.</p> : !membership ? <div className="mt-6 rounded-2xl bg-white p-6"><p className="text-sm text-[#64748B]">You do not have a Personal Plan subscription yet.</p><Link href="/personal-plan" className="mt-3 inline-block text-sm font-bold text-[#E85D2A]">Explore the plan →</Link></div> : <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[#E85D2A]">{membership.term} membership</p><h2 className="mt-1 text-xl font-bold">{membership.status === "active" ? "Active" : membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}</h2></div><p className="text-xl font-bold">₹{(membership.priceMinor / 100).toLocaleString("en-IN")} / {membership.term === "monthly" ? "month" : "year"}</p></div><div className="mt-5 space-y-2 border-t border-[#E5E7EB] pt-5 text-sm text-[#475569]">{membership.currentEnd && <p>Current paid period ends: <strong>{date(membership.currentEnd)}</strong></p>}{membership.nextChargeAt && !membership.cancelAtCycleEnd && membership.status === "active" && <p>Next scheduled charge: <strong>{date(membership.nextChargeAt)}</strong></p>}{membership.cancelAtCycleEnd && <p>Automatic renewal is cancelled. Access continues through the current paid period.</p>}</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void action("reconcile")} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-bold disabled:opacity-50">{busy ? "Updating..." : "Refresh status"}</button>{["created", "authenticated", "active", "pending", "halted", "paused"].includes(membership.status) && !membership.cancelAtCycleEnd && <button type="button" disabled={busy} onClick={() => void action("cancel")} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-50">{busy ? "Cancelling..." : "Cancel renewal"}</button>}</div></section>}
    {message && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
  </main><Footer /></div>;
}
