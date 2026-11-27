"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Circle, Trophy } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Step = { id: string; position: number; kind: "reading" | "fill_blank" | "code" | "project"; title: string; body: string; starter_code: string };
type Path = { slug: string; title: string; summary: string; steps: Step[]; completedIds: string[]; completion: { id: string; issued_at: string } | null };

export function GuidedPathPlayer({ slug }: { slug: string }) {
  const [path, setPath] = useState<Path | null>(null);
  const [selected, setSelected] = useState(0);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`/api/learning-paths/${encodeURIComponent(slug)}`, { cache: "no-store" }).then((res) => res.json()).then((body) => {
      if (!active) return;
      if (body.error) { setError(body.error.message); return; }
      const result = body.data as Path;
      setPath(result);
      const firstOpen = result.steps.findIndex((step) => !result.completedIds.includes(step.id));
      const firstIndex = firstOpen < 0 ? result.steps.length - 1 : firstOpen;
      setSelected(firstIndex);
      setResponse(result.steps[firstIndex]?.starter_code || "");
    }).catch(() => { if (active) setError("This path could not be loaded."); });
    return () => { active = false; };
  }, [slug]);
  const step = path?.steps[selected];
  function selectStep(index: number) {
    setSelected(index);
    setResponse(path?.steps[index]?.starter_code || "");
    setMessage(""); setMissing([]); setError("");
  }

  async function submit() {
    if (!path || !step) return;
    setBusy(true); setError(""); setMessage(""); setMissing([]);
    try {
      const res = await fetch(`/api/learning-paths/${encodeURIComponent(slug)}/steps/${encodeURIComponent(step.id)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: step.kind === "reading" ? "read" : response }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (res.status === 401) { setError("Sign in to save your progress across devices."); return; }
        setError(body.error?.message || "Your answer could not be checked."); return;
      }
      const outcome = body.data as { passed: boolean; missing: string[]; completion: Path["completion"] };
      if (outcome.passed) {
        setPath({ ...path, completedIds: [...new Set([...path.completedIds, step.id])], completion: outcome.completion });
        setMessage(outcome.completion ? "Path completed! Your completion record is saved." : "Well done. Your progress is saved.");
      } else {
        setMissing(outcome.missing);
        setMessage(step.kind === "fill_blank" ? "Try again. Read the explanation and check the spelling." : "Your project needs a few more elements.");
      }
    } catch { setError("Connection lost. Please try again."); }
    finally { setBusy(false); }
  }

  const completed = path?.completedIds.length || 0;
  return <div className="flex min-h-screen flex-col bg-[#F7F8FA]"><Navbar /><main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
    <Link href="/learning-paths" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#E85D2A]"><ArrowLeft className="h-4 w-4" /> All learning paths</Link>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} {error.startsWith("Sign in") && <Link className="font-bold underline" href="/login">Sign in</Link>}</p>}
    {!path && !error && <p className="mt-8 text-sm text-[#64748B]">Loading your path…</p>}
    {path && <><div className="mt-7 rounded-3xl bg-[#172033] p-7 text-white sm:p-10"><p className="text-xs font-bold uppercase tracking-widest text-[#FFB18F]">Interactive path</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{path.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{path.summary}</p><div className="mt-6 h-2 max-w-xl overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="Path progress" aria-valuemin={0} aria-valuemax={path.steps.length} aria-valuenow={completed}><div className="h-full bg-[#FF6B35]" style={{ width: `${path.steps.length ? completed / path.steps.length * 100 : 0}%` }} /></div><p className="mt-2 text-xs text-slate-300">{completed} of {path.steps.length} steps complete</p></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]"><nav aria-label="Path steps" className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-4"><h2 className="px-2 pb-3 text-sm font-extrabold text-[#172033]">Your steps</h2><ol className="space-y-1">{path.steps.map((item, index) => { const done = path.completedIds.includes(item.id); const locked = index > 0 && !path.completedIds.includes(path.steps[index - 1].id); return <li key={item.id}><button type="button" disabled={locked} onClick={() => selectStep(index)} aria-current={selected === index ? "step" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${selected === index ? "bg-orange-50 text-[#D65B28]" : "text-[#334155] hover:bg-slate-50"} disabled:cursor-not-allowed disabled:opacity-45`}>{done ? <Check className="h-5 w-5 shrink-0" /> : <Circle className="h-5 w-5 shrink-0" />}<span>{item.position}. {item.title}</span></button></li>; })}</ol></nav>
      {step && <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-widest text-[#E85D2A]">{step.kind === "fill_blank" ? "Quick check" : step.kind === "reading" ? "Read & learn" : step.kind === "project" ? "Final project" : "Try it yourself"}</span><span className="text-xs text-[#64748B]">Step {selected + 1} of {path.steps.length}</span></div><h2 className="mt-3 text-2xl font-extrabold text-[#172033]">{step.title}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#475569]">{step.body}</p>
        {step.kind === "fill_blank" && <label className="mt-6 block text-sm font-bold text-[#172033]">Your answer<input value={response} onChange={(event) => setResponse(event.target.value)} className="mt-2 block w-full max-w-md rounded-xl border border-[#CBD5E1] px-4 py-3 font-normal outline-none focus:border-[#E85D2A]" autoComplete="off" /></label>}
        {(step.kind === "code" || step.kind === "project") && <><label className="mt-6 block text-sm font-bold text-[#172033]">Your HTML<textarea value={response} onChange={(event) => setResponse(event.target.value)} spellCheck={false} rows={12} className="mt-2 block w-full rounded-xl border border-[#CBD5E1] bg-[#172033] p-4 font-mono text-sm font-normal text-white outline-none focus:border-[#E85D2A]" /></label><div className="mt-5"><p className="mb-2 text-sm font-bold text-[#172033]">Live preview</p><iframe title="Your HTML preview" sandbox="" srcDoc={`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">${response}`} className="h-56 w-full rounded-xl border border-[#CBD5E1] bg-white" /></div></>}
        {missing.length > 0 && <p className="mt-4 text-sm text-amber-800">Add opening and closing tags for: {missing.join(", ")}.</p>}
        {message && <p role="status" className="mt-4 text-sm font-semibold text-[#166534]">{message}</p>}
        <div className="mt-7 flex flex-wrap items-center gap-3"><button type="button" onClick={() => void submit()} disabled={busy || (step.kind !== "reading" && !response.trim())} className="rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white hover:bg-[#E85D2A] disabled:opacity-50">{busy ? "Checking…" : step.kind === "reading" ? "I've read this" : step.kind === "project" ? "Check project" : "Check answer"}</button>{selected < path.steps.length - 1 && path.completedIds.includes(step.id) && <button type="button" onClick={() => selectStep(selected + 1)} className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] px-5 py-3 text-sm font-bold text-[#172033]">Next step <ArrowRight className="h-4 w-4" /></button>}</div>
        {path.completion && <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><Trophy className="h-5 w-5 text-emerald-700" /><div><strong className="text-sm text-emerald-900">Path completed</strong><p className="mt-1 text-xs text-emerald-800">Your progress is saved to your account.</p><Link href={`/learning-paths/verify/${path.completion.id}`} className="mt-2 inline-block text-xs font-bold text-emerald-900 underline">View verifiable completion record</Link></div></div>}
      </section>}</div></>}
  </main><Footer /></div>;
}
