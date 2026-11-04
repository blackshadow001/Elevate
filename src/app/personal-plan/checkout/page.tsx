"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

type Plan = { monthlyPriceMinor: number | null; annualPriceMinor: number | null;
  includedCourseCount: number; checkoutAvailable: boolean };
const money = (minor: number) => `₹${(minor / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
type RazorpaySuccess = { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string };
type RazorpayInstance = { open(): void; on(name: string, handler: (result: { error?: { description?: string } }) => void): void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

function loadCheckoutScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as Window & { Razorpay?: RazorpayConstructor }).Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay Checkout could not load. Please try again."));
    document.head.appendChild(script);
  });
}

function PlanDetails() {
  const params = useSearchParams();
  const { user, isAuthenticated, isReady } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const term = params.get("term") === "annual" ? "annual" : "monthly";
  useEffect(() => {
    let active = true;
    fetch("/api/personal-plan", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Plan details are unavailable.");
      return response.json();
    }).then((body) => { if (active) setPlan(body.data); })
      .catch(() => { if (active) setError("Plan details are unavailable."); });
    return () => { active = false; };
  }, []);
  const price = term === "monthly" ? plan?.monthlyPriceMinor : plan?.annualPriceMinor;
  const checkoutReady = Boolean(plan?.checkoutAvailable && price != null && plan.includedCourseCount > 0);

  async function startSubscription() {
    if (!checkoutReady || busy || !agreed) return;
    setBusy(true); setError(""); setMessage("Preparing secure subscription checkout…");
    try {
      const response = await fetch("/api/personal-plan/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not prepare subscription checkout.");
      const checkout = body.data as { id: string; gatewaySubscriptionId: string; keyId: string };
      await loadCheckoutScript();
      const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable. No payment was made.");
      setMessage("");
      const instance = new Razorpay({ key: checkout.keyId, subscription_id: checkout.gatewaySubscriptionId,
        name: "Elevate", description: `${term === "monthly" ? "Monthly" : "Annual"} Personal Plan`,
        prefill: { name: user.name, email: user.email }, theme: { color: "#FF6B35" },
        modal: { ondismiss: () => { setBusy(false); setMessage("Checkout closed. Review your plan status before trying again."); } },
        handler: async (result: RazorpaySuccess) => {
          setMessage("Confirming your subscription with Razorpay…");
          try {
            if (result.razorpay_subscription_id !== checkout.gatewaySubscriptionId) throw new Error("Subscription ID did not match.");
            const verified = await fetch("/api/personal-plan/subscriptions/verify", { method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscriptionId: checkout.id, paymentId: result.razorpay_payment_id,
                signature: result.razorpay_signature }) });
            const verification = await verified.json();
            if (!verified.ok) throw new Error(verification.error?.message || "Subscription confirmation is pending.");
            window.location.assign("/personal-plan/account");
          } catch { setMessage("Confirmation is pending. Check your Personal Plan status before trying again."); }
          finally { setBusy(false); }
        },
      });
      instance.on("payment.failed", (result) => { setBusy(false); setError(result.error?.description || "Payment failed. Please try again."); setMessage(""); });
      instance.open();
    } catch (cause) { setBusy(false); setMessage(""); setError(cause instanceof Error ? cause.message : "Checkout could not start."); }
  }
  return <main className="mx-auto max-w-5xl px-5 py-12">
    <Link href="/personal-plan" className="text-sm font-bold text-[#E85D2A]">← Personal Plan</Link>
    <h1 className="mt-6 text-3xl font-extrabold">Review your plan</h1>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-3xl border border-[#E5E7EB] p-7">
        <h2 className="text-xl font-bold">Elevate Personal Plan</h2>
        <p className="mt-2 text-sm text-[#64748B]">Compare the monthly and annual terms and review what is included.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{(["monthly", "annual"] as const).map((option) => {
          const optionPrice = option === "monthly" ? plan?.monthlyPriceMinor : plan?.annualPriceMinor;
          return <Link key={option} href={`/personal-plan/checkout?term=${option}`} aria-current={term === option ? "page" : undefined} className={`rounded-xl border p-4 ${term === option ? "border-[#FF6B35] bg-orange-50" : "border-[#E5E7EB]"}`}><span className="block text-sm font-bold capitalize">{option} access</span><span className="mt-2 block text-lg font-bold">{optionPrice == null ? "Price coming soon" : money(optionPrice)}</span></Link>;
        })}</div>
        <h3 className="mt-8 font-bold">What this plan includes</h3>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[#475569]"><li>{plan?.includedCourseCount ?? "—"} administrator-selected published courses</li><li>Course progress and learning schedule</li><li>Certificates for completed eligible courses</li></ul>
        <p className="mt-7 rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">Selected courses are available during an active paid membership. The plan renews automatically until cancelled or the 10-year gateway limit is reached (up to 120 monthly or 10 annual charges). You can cancel future renewals from your plan account; paid access continues through the current period. A renewal reminder is sent three days before the next scheduled charge when email delivery is configured.</p>
      </div>
      <aside className="h-fit rounded-3xl bg-[#F8FAFC] p-7"><h2 className="text-lg font-bold">Summary</h2><div className="mt-5 flex justify-between border-b border-[#CBD5E1] pb-4 text-sm"><span className="capitalize">{term} access</span><strong>{price == null ? "Not set" : money(price)}</strong></div><p className="mt-4 text-xs text-[#64748B]">{price == null ? "The administrator has not set this price yet." : `Recurring price per ${term === "monthly" ? "month" : "year"}. Razorpay will show the charge before you authorize it.`}</p>{checkoutReady && isReady && isAuthenticated && user.role === "learner" ? <><label className="mt-5 flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 accent-[#FF6B35]" /><span>I agree to the recurring charge, 10-year maximum, and cancellation terms shown on this page.</span></label><button type="button" disabled={busy || !agreed} onClick={() => void startSubscription()} className="mt-5 w-full rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Preparing checkout…" : "Continue to Razorpay"}</button></> : checkoutReady && isReady && !isAuthenticated ? <Link href="/login" className="mt-6 block rounded-xl bg-[#FF6B35] px-5 py-3 text-center text-sm font-bold text-white">Sign in to continue</Link> : <button disabled className="mt-6 w-full rounded-xl bg-[#CBD5E1] px-5 py-3 text-sm font-bold text-[#475569]">Subscriptions coming soon</button>}<Link href="/personal-plan/account" className="mt-4 block text-center text-sm font-bold text-[#E85D2A]">Check my plan status →</Link><Link href="/courses" className="mt-3 block text-center text-sm font-bold text-[#E85D2A]">Browse individual courses →</Link></aside>
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm text-blue-700">{message}</p>}
  </main>;
}

export default function PersonalPlanCheckoutPage() {
  return <div className="min-h-screen bg-white text-[#172033]"><Navbar /><Suspense fallback={<main className="min-h-96 p-8">Loading plan…</main>}><PlanDetails /></Suspense><Footer /></div>;
}
