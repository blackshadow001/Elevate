"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type IncludedCourse = { id: string; slug: string; title: string; thumbnail: string | null; category: string };
type Plan = { currency: string; monthlyPriceMinor: number | null; annualPriceMinor: number | null;
  includedCourses: IncludedCourse[]; includedCourseCount: number; checkoutAvailable: boolean };
const money = (minor: number) => `₹${(minor / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function PersonalPlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/personal-plan", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Unable to load plan information.");
      return response.json();
    }).then((body) => { if (active) setPlan(body.data); })
      .catch(() => { if (active) setError("Unable to load plan information."); });
    return () => { active = false; };
  }, []);

  return <div className="min-h-screen bg-white text-[#172033]"><Navbar /><main>
    <section className="overflow-hidden bg-[#172033] px-5 py-16 text-white sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center"><div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB18F]">Elevate Personal Plan</p>
        <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight sm:text-6xl">Make room for your next skill.</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">Explore a growing library of practical courses. Learn on your schedule and keep your progress in one place.</p>
        <a href="#plans" className="mt-8 inline-flex rounded-xl bg-[#FF6B35] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#E85D2A]">Explore the plan →</a>
      </div><div aria-hidden="true" className="relative min-h-72 rounded-[2rem] bg-gradient-to-br from-[#FF6B35] via-[#FDBA74] to-[#FFE8B3] p-9 shadow-2xl sm:min-h-96"><div className="absolute right-8 top-8 h-24 w-24 rounded-full border-[18px] border-white/60" /><div className="absolute bottom-8 left-8 w-3/4 rounded-3xl bg-white p-7 text-[#172033] shadow-xl"><span className="text-3xl">✦</span><p className="mt-5 text-2xl font-black">Learn something new today.</p><p className="mt-2 text-sm text-[#64748B]">One course at a time. Progress that stays with you.</p></div></div></div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-16"><div className="grid gap-5 md:grid-cols-3">{[
      ["A focused catalog", "Browse the courses selected for Personal Plan by Elevate administrators."],
      ["Learn at your pace", "Continue lessons when it suits you and track your progress as you go."],
      ["Keep your work together", "Find enrolled courses, certificates, and your learning schedule in one place."],
    ].map(([title, description]) => <div key={title} className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6"><span className="text-2xl text-[#E85D2A]">✦</span><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-[#64748B]">{description}</p></div>)}</div></section>
    <section id="plans" className="bg-[#F7F8FA] px-5 py-16"><div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-widest text-[#E85D2A]">Plan options</p>
      <h2 className="mt-2 text-3xl font-extrabold">Choose a learning rhythm</h2>
      <p className="mt-2 text-sm text-[#64748B]">The administrator sets plan prices and included courses. Membership access begins only after Razorpay confirms a paid subscription.</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {!plan && !error && <p role="status" className="mt-6 text-sm">Loading plans…</p>}
      <div className="mt-7 grid gap-5 md:grid-cols-2">{(["monthly", "annual"] as const).map((term) => {
        const price = term === "monthly" ? plan?.monthlyPriceMinor : plan?.annualPriceMinor;
        return <article key={term} className="rounded-3xl border border-[#E5E7EB] bg-white p-7 shadow-sm"><p className="text-sm font-bold uppercase tracking-wider text-[#E85D2A]">{term === "monthly" ? "Monthly" : "Annual"}</p><p className="mt-4 text-4xl font-black">{price == null ? "Price coming soon" : money(price)}{price != null && <span className="ml-2 text-sm font-medium text-[#64748B]">/{term === "monthly" ? "month" : "year"}</span>}</p><p className="mt-4 text-sm text-[#64748B]">{term === "monthly" ? "A shorter commitment for trying new topics." : "A full year for a longer learning journey."}</p><p className="mt-4 text-sm">{plan ? `${plan.includedCourseCount} ${plan.includedCourseCount === 1 ? "course" : "courses"} selected for Personal Plan` : "See the selected courses below"}</p><Link href={`/personal-plan/checkout?term=${term}`} className="mt-6 inline-flex rounded-xl border border-[#172033] px-5 py-3 text-sm font-bold hover:bg-[#172033] hover:text-white">View plan details →</Link></article>;
      })}</div>
      <p className="mt-5 text-xs text-[#64748B]">Purchasing a course individually remains available where checkout is configured. {plan?.checkoutAvailable ? "Review renewal and cancellation terms before starting a subscription." : "Subscriptions are not open yet; no charge can be made."} <Link href="/personal-plan/account" className="font-bold text-[#E85D2A]">Check my plan status →</Link></p>
    </div></section>
    <section className="mx-auto max-w-7xl px-5 py-16"><h2 className="text-2xl font-extrabold">Courses selected for Personal Plan</h2><p className="mt-2 text-sm text-[#64748B]">Only administrator-selected, currently published courses appear here.</p>{plan && (plan.includedCourses.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{plan.includedCourses.map((course) => <Link key={course.id} href={`/courses/${course.slug}`} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm hover:border-[#FF6B35]"><div className="aspect-video bg-[#172033]">{course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />}</div><div className="p-4"><p className="text-xs font-semibold text-[#E85D2A]">{course.category}</p><h3 className="mt-1 font-bold">{course.title}</h3><p className="mt-3 text-xs text-[#64748B]">View course →</p></div></Link>)}</div> : <p className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 text-sm text-[#64748B]">No courses have been selected for Personal Plan yet. Browse the individual course catalog in the meantime.</p>)}</section>
  </main><Footer /></div>;
}
