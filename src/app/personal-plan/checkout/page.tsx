"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Plan = { monthlyPriceMinor: number | null; annualPriceMinor: number | null; publishedCourseCount: number; checkoutAvailable: boolean };

function PlanDetails() {
  const params = useSearchParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const term = params.get("term") === "annual" ? "annual" : "monthly";
  useEffect(() => { let active = true; fetch("/api/personal-plan", { cache: "no-store" }).then(async (response) => { if (!response.ok) throw new Error(); return response.json(); }).then((body) => { if (active) setPlan(body.data); }).catch(() => { if (active) setError("Plan details are unavailable."); }); return () => { active = false; }; }, []);
  const price = term === "monthly" ? plan?.monthlyPriceMinor : plan?.annualPriceMinor;
  return <main className="mx-auto max-w-5xl px-5 py-12"><Link href="/personal-plan" className="text-sm font-bold text-[#E85D2A]">← Personal Plan</Link><h1 className="mt-6 text-3xl font-extrabold">Review your plan</h1><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]"><div className="rounded-3xl border border-[#E5E7EB] p-7"><h2 className="text-xl font-bold">Elevate Personal Plan</h2><p className="mt-2 text-sm text-[#64748B]">Compare the available terms before subscriptions open.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(["monthly", "annual"] as const).map((option) => <Link key={option} href={`/personal-plan/checkout?term=${option}`} className={`rounded-xl border p-4 ${term === option ? "border-[#FF6B35] bg-orange-50" : "border-[#E5E7EB]"}`}><span className="block text-sm font-bold capitalize">{option} access</span><span className="mt-2 block text-lg font-bold">{plan?.[option === "monthly" ? "monthlyPriceMinor" : "annualPriceMinor"] == null ? "Price coming soon" : `₹${(plan[option === "monthly" ? "monthlyPriceMinor" : "annualPriceMinor"]! / 100).toLocaleString("en-IN")}`}</span></Link>)}</div><h3 className="mt-8 font-bold">What you can explore now</h3><ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[#475569]"><li>{plan?.publishedCourseCount ?? "—"} published courses in the current catalog</li><li>Course progress and learning schedule</li><li>Certificates for completed eligible courses</li></ul><p className="mt-7 rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">Personal Plan access, recurring payment, renewal, and cancellation are being prepared. No charge can be made on this page.</p></div><aside className="h-fit rounded-3xl bg-[#F8FAFC] p-7"><h2 className="text-lg font-bold">Summary</h2><div className="mt-5 flex justify-between border-b border-[#CBD5E1] pb-4 text-sm"><span className="capitalize">{term} access</span><strong>{price == null ? "Not set" : `₹${(price / 100).toLocaleString("en-IN")}`}</strong></div><p className="mt-4 text-xs text-[#64748B]">{price == null ? "The administrator has not set this price yet." : `Price per ${term === "monthly" ? "month" : "year"}. Billing will begin only after subscriptions are launched and you confirm a future checkout.`}</p><button disabled className="mt-6 w-full rounded-xl bg-[#CBD5E1] px-5 py-3 text-sm font-bold text-[#475569]">Subscriptions coming soon</button><Link href="/courses" className="mt-4 block text-center text-sm font-bold text-[#E85D2A]">Browse individual courses →</Link></aside></div>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}</main>;
}

export default function PersonalPlanCheckoutPage() { return <div className="min-h-screen bg-white text-[#172033]"><Navbar /><Suspense fallback={<main className="min-h-96 p-8">Loading plan…</main>}><PlanDetails /></Suspense><Footer /></div>; }
