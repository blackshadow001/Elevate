"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Clapperboard, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

type Application = { status: "pending" | "approved" | "rejected"; subject: string; experience: string;
  coursePlan: string; portfolioUrl: string | null; adminNote: string | null; submittedAt: string } | null;

export default function InstructorApplyPage() {
  const { user, isAuthenticated, isReady } = useAuth();
  const [application, setApplication] = useState<Application>(null);
  const [loaded, setLoaded] = useState(false);
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const [coursePlan, setCoursePlan] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isReady || !isAuthenticated || user.role !== "learner") return;
    let active = true;
    fetch("/api/me/tutor-application", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load your application.");
      if (!active) return;
      setApplication(body.data);
      if (body.data) {
        setSubject(body.data.subject);
        setExperience(body.data.experience);
        setCoursePlan(body.data.coursePlan);
        setPortfolioUrl(body.data.portfolioUrl || "");
      }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load your application."); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [isReady, isAuthenticated, user.id, user.role]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/me/tutor-application", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, experience, coursePlan, portfolioUrl }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to submit your application.");
      setApplication({ status: "pending", subject, experience, coursePlan, portfolioUrl, adminNote: null, submittedAt: new Date().toISOString() });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to submit your application."); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="flex-1">
    <section className="bg-[#172033] text-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#FF8A60]">Teach on Elevate</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Turn what you know into learning that helps others grow.</h1>
      <p className="mt-5 max-w-2xl text-lg text-slate-300">Share a practical skill, plan a course, and apply to join our tutor community. Every application is reviewed by our team.</p>
      <a href="#apply" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 font-bold text-white">Apply to teach <ArrowRight className="h-4 w-4" /></a>
    </div></section>
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><h2 className="text-3xl font-bold text-[#172033]">How teaching works</h2>
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6"><BookOpen className="h-8 w-8 text-[#FF6B35]" /><h3 className="mt-4 text-lg font-bold">Plan your course</h3><p className="mt-2 text-sm text-[#64748B]">Choose a topic you know well, identify your learners, and outline what they will be able to do.</p></div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6"><Clapperboard className="h-8 w-8 text-[#FF6B35]" /><h3 className="mt-4 text-lg font-bold">Create your lessons</h3><p className="mt-2 text-sm text-[#64748B]">After approval, use Instructor Studio to organize lessons and upload teaching videos and resources.</p></div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6"><ShieldCheck className="h-8 w-8 text-[#FF6B35]" /><h3 className="mt-4 text-lg font-bold">Submit for review</h3><p className="mt-2 text-sm text-[#64748B]">Your finished course goes through an admin review before it appears in the catalog.</p></div>
      </div>
    </section>
    <section id="apply" className="border-t border-[#E5E7EB] bg-white"><div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div><p className="text-sm font-semibold uppercase tracking-widest text-[#FF6B35]">Tutor application</p><h2 className="mt-3 text-3xl font-bold text-[#172033]">Tell us what you want to teach</h2><p className="mt-4 text-[#64748B]">Share your experience and a first course idea. Your application is linked to your learner account, so the administrator can review it and send feedback. Approval upgrades that account to tutor access; you keep your enrolled courses and learning history.</p>
        <div className="mt-7 rounded-2xl bg-[#FFF3EE] p-5 text-sm text-[#172033]"><CircleCheck className="mb-2 h-6 w-6 text-[#FF6B35]" />Applying does not publish a course or grant tutor access immediately. The super administrator reviews each application.</div>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFDF9] p-6 shadow-sm sm:p-8">
        {!isReady ? <p role="status">Checking your account…</p> : !isAuthenticated ? <div><h3 className="text-xl font-bold">Sign in to apply</h3><p className="mt-2 text-sm text-[#64748B]">Applications must be linked to a learner account.</p><Link href="/login" className="mt-5 inline-flex rounded-lg bg-[#FF6B35] px-5 py-3 font-bold text-white">Sign in</Link></div>
          : user.role !== "learner" ? <div><h3 className="text-xl font-bold">Your tutor account is ready</h3><Link href="/instructor" className="mt-5 inline-block font-bold text-[#FF6B35]">Open Instructor Studio →</Link></div>
          : !loaded ? <p role="status">Loading your application…</p>
          : application?.status === "pending" ? <div role="status"><h3 className="text-xl font-bold">Application under review</h3><p className="mt-3 text-sm text-[#64748B]">Your application to teach {application.subject} was submitted. Check this page for the decision.</p></div>
          : application?.status === "approved" ? <div role="status"><h3 className="text-xl font-bold">Application approved</h3><p className="mt-3 text-sm text-[#64748B]">Sign in again to activate your tutor access.</p><Link href="/login" className="mt-4 inline-block font-bold text-[#FF6B35]">Sign in →</Link></div>
          : <><h3 className="text-xl font-bold text-[#172033]">{application?.status === "rejected" ? "Update your application" : "Apply to become a tutor"}</h3>
            {application?.status === "rejected" && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Feedback: {application.adminNote || "Please review your application and try again."}</p>}
            <p className="mt-3 text-sm text-[#64748B]">Applying as <strong>{user.name}</strong> ({user.email})</p>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div><label htmlFor="teach-subject" className="mb-1 block text-sm font-semibold">What subject would you teach?</label><input id="teach-subject" required minLength={3} maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm" placeholder="For example, web development" /></div>
              <div><label htmlFor="teach-experience" className="mb-1 block text-sm font-semibold">Your experience and qualifications</label><textarea id="teach-experience" required minLength={30} maxLength={3000} rows={5} value={experience} onChange={(event) => setExperience(event.target.value)} className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm" placeholder="Describe your work, projects, and teaching experience." /></div>
              <div><label htmlFor="teach-plan" className="mb-1 block text-sm font-semibold">Your first course idea</label><textarea id="teach-plan" required minLength={30} maxLength={3000} rows={5} value={coursePlan} onChange={(event) => setCoursePlan(event.target.value)} className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm" placeholder="Who is it for, what will they learn, and how would you structure it?" /></div>
              <div><label htmlFor="teach-portfolio" className="mb-1 block text-sm font-semibold">Portfolio or sample work (optional)</label><input id="teach-portfolio" type="url" maxLength={500} value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm" placeholder="https://..." /></div>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-lg bg-[#FF6B35] px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Submitting…" : application?.status === "rejected" ? "Resubmit application" : "Submit application"}</button>
            </form></>}
        {error && (application?.status === "pending" || !loaded) && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      </div>
    </div></section>
  </main><Footer /></div>;
}
