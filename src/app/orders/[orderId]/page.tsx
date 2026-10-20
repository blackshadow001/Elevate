"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Order = { id: string; status: string; totalMinor: number; currency: string;
  course: { title: string; slug: string; firstLessonId: string | null } | null };

export default function PaymentResultPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async (reconcile = false) => {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/orders/${params.orderId}${reconcile ? "/reconcile" : ""}`,
        { method: reconcile ? "POST" : "GET", credentials: "same-origin", cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load your order.");
      if (reconcile) {
        const details = await fetch(`/api/orders/${params.orderId}`, { credentials: "same-origin", cache: "no-store" });
        const detailBody = await details.json();
        if (!details.ok) throw new Error(detailBody.error?.message || "Unable to load your order.");
        setOrder(detailBody.data);
      } else setOrder(body.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load your order."); }
    finally { setBusy(false); }
  };
  useEffect(() => { void Promise.resolve().then(() => load()); }, [params.orderId]);

  return <main className="min-h-[65vh] bg-[#FFFDF9] px-4 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-9">
    <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">Elevate checkout</p>
    <h1 className="mt-2 text-2xl font-extrabold text-[#172033]">Your order status</h1>
    {busy && <p role="status" className="mt-5 text-sm text-[#64748B]">Checking your order…</p>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {order && <div className="mt-5 space-y-3 text-sm text-[#475569]">
      <p className="break-all font-mono text-xs">Order {order.id}</p>
      <p className="font-semibold text-[#172033]">{order.course?.title || "Course purchase"}</p>
      <p>Order total: ₹{(order.totalMinor / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })} {order.currency}</p>
      {order.status === "paid" ? <><p role="status" className="rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-800">Payment captured and course access confirmed.</p>
        {order.course?.firstLessonId && <Link href={`/learn/${order.course.slug}/${order.course.firstLessonId}`} className="inline-block rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white">Start learning</Link>}</>
        : <><p role="status" className="rounded-xl bg-amber-50 p-3 text-amber-900">Payment is not confirmed. Do not pay again until you check the latest status.</p>
          <button type="button" disabled={busy} onClick={() => void load(true)} className="rounded-xl border border-[#FF6B35] px-5 py-3 font-bold text-[#FF6B35] disabled:opacity-50">Check payment status</button>
          {order.course && <Link href={`/courses/${order.course.slug}`} className="ml-3 inline-block font-semibold text-[#FF6B35]">Return to course</Link>}</>}
    </div>}
    <Link href="/dashboard" className="mt-6 block text-sm font-semibold text-[#64748B]">Go to My Learning</Link>
  </section></main>;
}
