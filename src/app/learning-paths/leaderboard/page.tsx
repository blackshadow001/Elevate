"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Medal, Trophy } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Entry = { rank: number; name: string; points: number; steps: number; isYou: boolean };
type Board = { entries: Entry[]; yours: Entry | null; totalLearners: number; showName: boolean };
type Path = { slug: string; title: string };

export default function GuidedLeaderboardPage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [slug, setSlug] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (selected: string) => {
    const response = await fetch(`/api/learning-paths/leaderboard${selected ? `?path=${encodeURIComponent(selected)}` : ""}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || "Leaderboard could not be loaded.");
    setBoard(body.data);
  }, []);

  useEffect(() => {
    const run = async () => {
      const initial = new URLSearchParams(window.location.search).get("path") || "";
      try {
        const response = await fetch("/api/learning-paths");
        const body = await response.json();
        setPaths(body.data || []);
        await load(initial);
        setSlug(initial);
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Leaderboard could not be loaded."); }
    };
    void run();
  }, [load]);

  async function changePath(next: string) {
    setSlug(next);
    setError("");
    window.history.replaceState(null, "", next ? `?path=${encodeURIComponent(next)}` : window.location.pathname);
    try { await load(next); } catch (cause) { setError(cause instanceof Error ? cause.message : "Leaderboard could not be loaded."); }
  }

  async function changeVisibility(next: boolean) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/learning-paths/leaderboard", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ showName: next }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Your setting could not be saved.");
      await load(slug);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your setting could not be saved."); }
    finally { setSaving(false); }
  }

  return <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
    <Navbar />
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 pb-24 sm:px-6">
      <Link href="/learning-paths" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#D65B28]"><ArrowLeft className="h-4 w-4" />Guided paths</Link>
      <section className="mt-6 rounded-3xl bg-[#172033] p-6 text-white sm:p-9">
        <div className="flex items-start gap-4"><div className="rounded-2xl bg-white/10 p-3 text-[#FFB18F]"><Trophy className="h-7 w-7" /></div><div><p className="text-xs font-bold uppercase tracking-widest text-[#FFB18F]">Guided learning</p><h1 className="mt-1 text-3xl font-black">Leaderboard</h1><p className="mt-2 text-sm leading-6 text-slate-300">Earn points for completed lessons, practice, and checked answers. Every step counts once.</p></div></div>
      </section>
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-bold text-[#172033]">Learning path <select value={slug} onChange={(event) => void changePath(event.target.value)} className="mt-2 block w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 font-normal sm:min-w-64"><option value="">All current paths</option>{paths.map((path) => <option key={path.slug} value={path.slug}>{path.title}</option>)}</select></label>
        {board?.entries.some((entry) => entry.isYou) || board?.yours ? <label className="flex items-center gap-2 text-sm font-semibold text-[#334155]"><input type="checkbox" checked={board.showName} disabled={saving} onChange={(event) => void changeVisibility(event.target.checked)} className="h-4 w-4 accent-[#E85D2A]" />Show my name publicly</label> : <p className="text-xs text-[#64748B]">Your name stays private unless you choose to show it.</p>}
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="mt-6 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white" aria-label="Learner rankings">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4"><h2 className="text-lg font-black text-[#172033]">Top learners</h2><span className="text-xs font-semibold text-[#64748B]">{board?.totalLearners || 0} learners</span></div>
        {!board && <p className="p-6 text-sm text-[#64748B]">Loading rankings…</p>}
        {board?.entries.length === 0 && <p className="p-6 text-sm text-[#64748B]">No completed steps yet. Be the first to learn.</p>}
        {board?.entries.map((entry) => <div key={entry.rank} className={`flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4 last:border-0 ${entry.isYou ? "bg-orange-50" : ""}`}><span className="w-8 shrink-0 text-center text-sm font-black text-[#64748B]">{entry.rank <= 3 ? <Medal className={`mx-auto h-5 w-5 ${entry.rank === 1 ? "text-amber-500" : entry.rank === 2 ? "text-slate-400" : "text-orange-600"}`} aria-label={`Rank ${entry.rank}`} /> : entry.rank}</span><span className="min-w-0 flex-1 truncate text-sm font-bold text-[#172033]">{entry.name}{entry.isYou && <span className="ml-2 text-xs text-[#D65B28]">You</span>}</span><span className="text-right text-xs text-[#64748B]">{entry.steps} steps<br /><strong className="text-sm text-[#172033]">{entry.points} pts</strong></span></div>)}
        {board?.yours && <div className="flex items-center gap-3 bg-orange-50 px-5 py-4"><span className="w-8 text-center text-sm font-black">{board.yours.rank}</span><span className="flex-1 text-sm font-bold">{board.yours.name} <span className="text-xs text-[#D65B28]">You</span></span><span className="text-right text-xs">{board.yours.steps} steps<br /><strong>{board.yours.points} pts</strong></span></div>}
      </section>
      <p className="mt-4 text-xs leading-5 text-[#64748B]">Points: answer checks 10, labs 8, guided builds 5, other completed steps 2. Repeating a step does not add points.</p>
    </main><Footer />
  </div>;
}
