"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Summary = { id: string; slug: string; title: string; status: string; stepCount: number };
type Step = { id: string; title: string; body: string; kind: string; starter_code: string; chapter_title: string; answer: { expected?: string; requiredTags?: string[] } };
type Detail = { id: string; slug: string; title: string; summary: string; status: string; steps: Step[] };
const emptyStep = { title: "", chapterTitle: "Chapter 1 · Getting started", body: "", kind: "reading", starterCode: "", expected: "", requiredTags: "" };

export default function TutorLearningPathsPage() {
  const [paths, setPaths] = useState<Summary[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [form, setForm] = useState(emptyStep);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSummary, setDraftSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPaths() {
    const response = await fetch("/api/instructor/learning-paths", { cache: "no-store" });
    const body = await response.json();
    if (response.ok) setPaths(body.data);
    else setMessage(body.error?.message || "Paths could not be loaded.");
  }
  async function loadDetail(id: string) {
    const response = await fetch(`/api/instructor/learning-paths/${id}`, { cache: "no-store" });
    const body = await response.json();
    if (response.ok) { setSelected(body.data); setDraftTitle(body.data.title); setDraftSummary(body.data.summary); setForm(emptyStep); setEditingId(null); }
    else setMessage(body.error?.message || "Path could not be loaded.");
  }
  useEffect(() => {
    let active = true;
    fetch("/api/instructor/learning-paths", { cache: "no-store" }).then((response) => response.json().then((body) => ({ response, body }))).then(({ response, body }) => {
      if (!active) return;
      if (response.ok) setPaths(body.data);
      else setMessage(body.error?.message || "Paths could not be loaded.");
    }).catch(() => { if (active) setMessage("Paths could not be loaded."); });
    return () => { active = false; };
  }, []);

  async function send(url: string, method: string, payload: Record<string, unknown>) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || "Please try again.");
    return body.data;
  }
  async function create() {
    setBusy(true); setMessage("");
    try {
      const result = await send("/api/instructor/learning-paths", "POST", { title, summary });
      setTitle(""); setSummary(""); await loadPaths(); await loadDetail(result.id);
      setMessage("Draft path created. Add short lessons and a final project.");
    } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  async function saveStep() {
    if (!selected) return;
    setBusy(true); setMessage("");
    const payload = { ...form, requiredTags: form.requiredTags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) };
    try {
      await send(editingId ? `/api/instructor/learning-paths/${selected.id}/steps/${editingId}` : `/api/instructor/learning-paths/${selected.id}/steps`, editingId ? "PATCH" : "POST", payload);
      await loadDetail(selected.id); await loadPaths(); setMessage(editingId ? "Step updated." : "Step added.");
    } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  async function submit() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try { await send(`/api/instructor/learning-paths/${selected.id}`, "PATCH", { action: "submit" }); await loadDetail(selected.id); await loadPaths(); setMessage("Sent to the administrator for review."); }
    catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  async function saveDetails() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try { await send(`/api/instructor/learning-paths/${selected.id}`, "PATCH", { action: "update", title: draftTitle, summary: draftSummary }); await loadDetail(selected.id); await loadPaths(); setMessage("Path details saved."); }
    catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  async function deleteStep(step: Step) {
    if (!selected || !window.confirm(`Remove “${step.title}” from this draft?`)) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/instructor/learning-paths/${selected.id}/steps/${step.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Please try again.");
      await loadDetail(selected.id); await loadPaths(); setMessage("Step removed.");
    } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  function edit(step: Step) {
    setEditingId(step.id);
    setForm({ title: step.title, chapterTitle: step.chapter_title, body: step.body, kind: step.kind, starterCode: step.starter_code.replaceAll("\\n", "\n"), expected: step.answer.expected || "", requiredTags: (step.answer.requiredTags || []).join(", ") });
  }

  return <div className="mx-auto max-w-6xl space-y-7 p-5 sm:p-8"><div><p className="text-xs font-bold uppercase tracking-widest text-[#E85D2A]">Tutor studio</p><h1 className="mt-1 text-3xl font-black text-[#172033]">Guided learning paths</h1><p className="mt-2 text-sm text-[#64748B]">Write short steps, add quick checks, then submit the path for administrator review.</p></div>
    {message && <p role="status" className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-[#172033]">{message}</p>}
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><h2 className="text-lg font-extrabold">Start a new path</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Path title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. HTML for Beginners" className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label><label className="text-sm font-semibold">What learners will build<input value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="A short description of the outcome" className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label></div><button onClick={() => void create()} disabled={busy || !title.trim() || !summary.trim()} className="mt-4 rounded-xl bg-[#172033] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">Create draft</button></section>
    <div className="grid gap-6 lg:grid-cols-[270px_1fr]"><aside className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-4"><h2 className="mb-3 text-sm font-extrabold">My paths</h2>{paths.length ? paths.map((path) => <button key={path.id} onClick={() => void loadDetail(path.id)} className={`mb-2 block w-full rounded-xl p-3 text-left text-sm ${selected?.id === path.id ? "bg-orange-50 text-[#D65B28]" : "hover:bg-slate-50"}`}><strong className="block">{path.title}</strong><span className="text-xs capitalize text-[#64748B]">{path.status} · {path.stepCount} steps</span></button>) : <p className="text-sm text-[#64748B]">No paths yet.</p>}</aside>
    {selected && <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">{selected.title}</h2><p className="text-xs capitalize text-[#64748B]">{selected.status} · {selected.steps.length} steps</p></div>{selected.status === "draft" && <button onClick={() => void submit()} disabled={busy} className="rounded-xl border border-[#FF6B35] px-4 py-2 text-xs font-bold text-[#D65B28] disabled:opacity-50">Submit for review</button>}</div>
      {selected.status === "draft" && <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><label className="text-sm font-semibold">Path title<input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label><label className="text-sm font-semibold">What learners will build<input value={draftSummary} onChange={(event) => setDraftSummary(event.target.value)} className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label><button onClick={() => void saveDetails()} disabled={busy || !draftTitle.trim() || !draftSummary.trim()} className="w-fit rounded-xl border border-[#172033] px-4 py-2 text-sm font-bold disabled:opacity-50">Save path details</button></div>}
      <ol className="mt-5 space-y-2">{selected.steps.map((step, index) => <li key={step.id} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3 text-sm"><span><span className="block text-xs font-bold text-[#64748B]">{step.chapter_title}</span>{index + 1}. {step.title} <span className="text-xs text-[#64748B]">({step.kind})</span></span>{selected.status === "draft" && <span className="flex gap-3"><button onClick={() => edit(step)} className="text-xs font-bold text-[#D65B28]">Edit</button><button onClick={() => void deleteStep(step)} disabled={busy} className="text-xs font-bold text-red-700 disabled:opacity-50">Remove</button></span>}</li>)}</ol>
      {selected.status === "draft" && <div className="mt-7 border-t pt-6"><h3 className="font-extrabold">{editingId ? "Edit step" : "Add a step"}</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Chapter name<input value={form.chapterTitle} onChange={(event) => setForm({ ...form, chapterTitle: event.target.value })} placeholder="Chapter 1 · Getting started" className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label><label className="text-sm font-semibold">Step title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label><label className="text-sm font-semibold">Step type<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })} className="mt-1 block w-full rounded-xl border p-3 font-normal"><option value="reading">Short explanation</option><option value="fill_blank">Fill in the blank</option><option value="code">HTML exercise</option><option value="project">Final project</option></select></label></div><label className="mt-4 block text-sm font-semibold">Explanation or task<textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows={4} className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label>
        {form.kind === "fill_blank" && <label className="mt-4 block text-sm font-semibold">Correct word or phrase<input value={form.expected} onChange={(event) => setForm({ ...form, expected: event.target.value })} className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label>}
        {(form.kind === "code" || form.kind === "project") && <><label className="mt-4 block text-sm font-semibold">Starter HTML<textarea value={form.starterCode} onChange={(event) => setForm({ ...form, starterCode: event.target.value })} rows={5} className="mt-1 block w-full rounded-xl border p-3 font-mono text-xs font-normal" /></label><label className="mt-4 block text-sm font-semibold">Required HTML tags, separated by commas<input value={form.requiredTags} onChange={(event) => setForm({ ...form, requiredTags: event.target.value })} placeholder="main, h1, p" className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label><p className="mt-1 text-xs text-[#64748B]">Available: style, main, section, h1, h2, p, a, ul, li.</p></>}
        <div className="mt-4 flex gap-3"><button onClick={() => void saveStep()} disabled={busy} className="rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{editingId ? "Save changes" : "Add step"}</button>{editingId && <button onClick={() => { setEditingId(null); setForm(emptyStep); }} className="text-sm font-semibold">Cancel edit</button>}</div>
      </div>}{selected.status === "published" && <Link href={`/learning-paths/${selected.slug}`} className="mt-5 inline-block text-sm font-bold text-[#D65B28]">View learner path →</Link>}
    </section>}</div>
  </div>;
}
