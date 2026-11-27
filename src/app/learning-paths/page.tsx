"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Code2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Path = { id: string; slug: string; title: string; summary: string; stepCount: number; chapterCount: number; moduleCount: number };

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [view, setView] = useState<"current" | "archive">("current");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  function switchView(next: "current" | "archive") {
    if (view === next) return;
    setLoading(true); setError(""); setPaths([]); setView(next);
  }
  useEffect(() => {
    let active = true;
    fetch(`/api/learning-paths${view === "archive" ? "?view=archive" : ""}`).then((response) => response.json()).then((body) => {
      if (!active) return;
      if (body.error) { setError(body.error.message); setPaths([]); }
      else { setError(""); setPaths(body.data); }
      setLoading(false);
    }).catch(() => { if (active) { setError("Learning paths could not be loaded."); setLoading(false); } });
    return () => { active = false; };
  }, [view]);
  return <div className="flex min-h-screen flex-col bg-[#FFFDF9]"><Navbar /><main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
    <p className="text-xs font-extrabold uppercase tracking-widest text-[#E85D2A]">Guided learning</p>
    <h1 className="mt-2 text-4xl font-black text-[#172033]">Learn by doing, one step at a time.</h1>
    <p className="mt-3 max-w-2xl text-[#64748B]">Theory, worked examples, guided workshops, independent labs, module reviews and quizzes. Complete the coursework, then submit a final project and assessment for an Elevate certificate.</p>
    {error && <p role="alert" className="mt-8 text-red-700">{error}</p>}
    <div className="mt-8 flex gap-3"><button type="button" onClick={() => switchView("current")} aria-pressed={view === "current"} className={`rounded-full px-4 py-2 text-sm font-bold ${view === "current" ? "bg-[#172033] text-white" : "border bg-white"}`}>Current paths</button><button type="button" onClick={() => switchView("archive")} aria-pressed={view === "archive"} className={`rounded-full px-4 py-2 text-sm font-bold ${view === "archive" ? "bg-[#172033] text-white" : "border bg-white"}`}>Archive</button></div>
    <div className="mt-6 grid gap-5 md:grid-cols-2">{paths.map((path) => <Link key={path.id} href={`/learning-paths/${path.slug}`} className="group rounded-3xl border border-[#E5E7EB] bg-white p-7 shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#E85D2A]">
      <div className="flex items-center justify-between"><span className="rounded-xl bg-orange-50 p-3 text-[#E85D2A]"><Code2 className="h-6 w-6" /></span><span className="text-xs font-bold text-[#64748B]">{path.chapterCount} chapters · {path.moduleCount} modules · {path.stepCount} steps</span></div>
      <h2 className="mt-6 text-2xl font-extrabold text-[#172033]">{path.title}</h2><p className="mt-2 text-sm leading-6 text-[#64748B]">{path.summary}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#E85D2A]">Open path <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
    </Link>)}</div>
    {!error && paths.length === 0 && <p className="mt-8 flex items-center gap-2 text-sm text-[#64748B]"><BookOpenCheck className="h-4 w-4" /> {loading ? "Loading paths…" : view === "archive" ? "No archived paths yet." : "No published paths yet."}</p>}
  </main><Footer /></div>;
}
