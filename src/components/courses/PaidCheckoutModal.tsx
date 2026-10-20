"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/utils";

type CheckoutResponse = { id: string; gatewayOrderId: string; keyId: string; totalMinor: number; currency: string };
type RazorpaySuccess = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open(): void; on(name: string, handler: (result: { error?: { description?: string } }) => void): void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

function loadCheckoutScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as Window & { Razorpay?: RazorpayConstructor }).Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay Checkout could not load. Check your connection and try again."));
    document.head.appendChild(script);
  });
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "The payment request could not be completed.");
  return body.data as T;
}

export function PaidCheckoutModal({ open, onClose, courseId, courseTitle, displayedPrice }: {
  open: boolean; onClose: () => void; courseId: string; courseTitle: string; displayedPrice: number;
}) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    void api<{ checkoutAvailable: boolean }>("/api/payments/configuration")
      .then((value) => { if (active) setConfigured(value.checkoutAvailable); })
      .catch(() => { if (active) setConfigured(false); });
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open, busy, onClose]);

  if (!open) return null;

  const startCheckout = async () => {
    if (busy) return;
    setBusy(true); setError(""); setMessage("Creating your secure payment order…");
    try {
      const order = await api<{ id: string }>("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) });
      setOrderId(order.id);
      const checkout = await api<CheckoutResponse>(`/api/orders/${order.id}/checkout`, { method: "POST" });
      await loadCheckoutScript();
      const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable. No payment was made.");
      setMessage("");
      const instance = new Razorpay({
        key: checkout.keyId, amount: checkout.totalMinor, currency: checkout.currency,
        name: "Elevate", description: courseTitle, order_id: checkout.gatewayOrderId,
        theme: { color: "#FF6B35" },
        modal: { ondismiss: () => { setBusy(false); setMessage("Checkout was closed. Check the order status before trying again."); } },
        handler: async (result: RazorpaySuccess) => {
          setMessage("Payment received by Razorpay. Confirming capture with the server…");
          try {
            const verified = await api<{ status: string }>(`/api/orders/${order.id}/verify`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId: result.razorpay_payment_id, gatewayOrderId: result.razorpay_order_id, signature: result.razorpay_signature }),
            });
            if (verified.status === "paid") { window.location.assign(`/orders/${order.id}`); return; }
            setMessage("Payment confirmation is pending. Check your order status shortly.");
          } catch {
            setMessage("Payment confirmation is pending. Check your order status; do not pay again yet.");
          } finally { setBusy(false); }
        },
      });
      instance.on("payment.failed", (result) => { setBusy(false); setError(result.error?.description || "Payment failed. You can try again."); setMessage(""); });
      instance.open();
    } catch (cause) {
      setBusy(false); setMessage("");
      setError(cause instanceof Error ? cause.message : "Checkout could not start. No payment was made.");
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close checkout" onClick={() => { if (!busy) onClose(); }} />
    <div role="dialog" aria-modal="true" aria-label="Course checkout" className="relative z-10 w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl sm:p-8">
      <button type="button" aria-label="Close checkout" onClick={onClose} className="absolute right-5 top-5 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
      <h2 className="pr-8 text-xl font-extrabold text-[#172033]">Secure course checkout</h2>
      <p className="mt-2 text-sm text-[#64748B]">{courseTitle}</p>
      <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F7F8FA] p-4 text-sm font-bold text-[#172033]"><span>Displayed price</span><span>{formatINR(displayedPrice)}</span></div>
      <p className="mt-2 text-xs text-[#64748B]">Your exact amount is confirmed by the server before Razorpay opens. Access starts only after captured payment is verified.</p>
      {configured === false && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Payments are not configured yet. No charge can be made.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
      <button type="button" disabled={busy || configured !== true} onClick={() => void startCheckout()}
        className="mt-5 w-full rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white hover:bg-[#E85D2A] disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Preparing payment…" : "Pay securely with Razorpay"}
      </button>
      {orderId && <Link href={`/orders/${orderId}`} className="mt-3 block text-center text-sm font-semibold text-[#FF6B35]">Check this order’s status</Link>}
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#64748B]"><ShieldCheck className="h-4 w-4" /> Payment details stay with Razorpay.</p>
    </div>
  </div>;
}
