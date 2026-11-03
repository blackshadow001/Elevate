import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Teach on Elevate | Careers" };

export default function CareersPage() {
  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="flex-1">
    <section className="bg-[#172033] text-white"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-widest text-[#FF8A60]">Teach on Elevate</p><h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Share your expertise. Help someone take the next step.</h1><p className="mt-5 max-w-2xl text-lg text-slate-300">We welcome people who can turn real experience into clear, practical lessons. Start with a teaching idea and tell us how you would help learners succeed.</p><Link href="/instructor/apply" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 font-bold text-white">Apply to teach <ArrowRight className="h-4 w-4" /></Link></div></section>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><h2 className="text-3xl font-bold text-[#172033]">Your path to teaching</h2><div className="mt-8 grid gap-5 md:grid-cols-3">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6"><BookOpen className="h-8 w-8 text-[#FF6B35]" /><h3 className="mt-4 text-xl font-bold">Plan</h3><p className="mt-2 text-sm text-[#64748B]">Choose a subject, identify who you will teach, and outline a course with clear learning outcomes.</p></div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6"><ShieldCheck className="h-8 w-8 text-[#FF6B35]" /><h3 className="mt-4 text-xl font-bold">Apply</h3><p className="mt-2 text-sm text-[#64748B]">Submit your background and first course idea. A super administrator reviews applications and shares a decision.</p></div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6"><Clapperboard className="h-8 w-8 text-[#FF6B35]" /><h3 className="mt-4 text-xl font-bold">Create</h3><p className="mt-2 text-sm text-[#64748B]">If approved, sign in to Instructor Studio to build lessons, upload videos, and submit a course for review.</p></div>
    </div></section>
    <section className="border-t border-[#E5E7EB] bg-white"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><h2 className="text-2xl font-bold text-[#172033]">Looking for other roles?</h2><p className="mt-3 text-sm text-[#64748B]">There are no other open positions published at this time.</p></div></section>
  </main><Footer /></div>;
}
