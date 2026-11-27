"use client";

import { useEffect, useState } from "react";
import { GuidedProjectReviewQueue } from "@/components/admin/GuidedProjectReviewQueue";

type Path = { id: string; title: string; summary: string; tutorName: string | null; stepCount: number; status: string };
type Step = { id: string; title: string; kind: string; body: string; answer: { expected?: string; requiredTags?: string[] } };

export default function LearningPathReviewsPage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [review, setReview] = useState<{ id: string; steps: Step[] } | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/learning-paths", { cache: "no-store" });
    const body = await response.json();
    if (response.ok) setPaths(body.data);
    else setMessage(body.error?.message || "Review queue unavailable.");
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/learning-paths", { cache: "no-store" }).then((response) => response.json().then((body) => ({ response, body }))).then(({ response, body }) => {
      if (!active) return;
      if (response.ok) setPaths(body.data);
      else setMessage(body.error?.message || "Review queue unavailable.");
    }).catch(() => { if (active) setMessage("Review queue unavailable."); });
    return () => { active = false; };
  }, []);

  async function inspect(id: string) {
    const response = await fetch(`/api/admin/learning-paths/${id}`, { cache: "no-store" });
    const body = await response.json();
    if (response.ok) setReview(body.data);
    else setMessage(body.error?.message || "Path details unavailable.");
  }

  async function decide(id: string, action: "publish" | "archive" | "return") {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/learning-paths/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not update path.");
      setReview(null); await load();
      setMessage(action === "publish" ? "Learning path published." : action === "archive" ? "Learning path moved to the archive." : "Path returned to the tutor's drafts.");
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-5xl p-6 sm:p-9">
    <h1 className="text-3xl font-black text-[#172033]">Review learning paths</h1>
    <p className="mt-2 text-sm text-[#64748B]">Inspect every step before publishing. Published paths can be archived without losing learner progress.</p>
    {message && <p role="status" className="mt-5 rounded-xl bg-orange-50 p-3 text-sm">{message}</p>}
    <GuidedProjectReviewQueue />
    <div className="mt-7 space-y-4">{paths.map((path) => <article key={path.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <h2 className="text-lg font-extrabold">{path.title}</h2>
      <p className="mt-1 text-sm text-[#64748B]">{path.summary}</p>
      <p className="mt-3 text-xs text-[#64748B]">Tutor: {path.tutorName || "Elevate"} · {path.stepCount} steps · {path.status}</p>
      <button onClick={() => void inspect(path.id)} className="mt-4 rounded-xl border border-[#172033] px-4 py-2 text-sm font-bold">Inspect steps</button>
      {review?.id === path.id && <div className="mt-5 space-y-3 border-t pt-5">
        {review.steps.map((step, index) => <div key={step.id} className="rounded-xl bg-[#F7F8FA] p-4">
          <p className="text-sm font-bold">{index + 1}. {step.title} <span className="font-normal text-[#64748B]">({step.kind})</span></p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{step.body}</p>
          <p className="mt-2 text-xs text-[#64748B]">{step.answer.expected ? `Answer: ${step.answer.expected}` : step.answer.requiredTags?.length ? `Required tags: ${step.answer.requiredTags.join(", ")}` : "Reading step"}</p>
        </div>)}
        {path.status === "review" ? <div className="flex gap-3">
          <button onClick={() => void decide(path.id, "publish")} disabled={busy} className="rounded-xl bg-[#172033] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Publish path</button>
          <button onClick={() => void decide(path.id, "return")} disabled={busy} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">Return for edits</button>
        </div> : <button onClick={() => void decide(path.id, "archive")} disabled={busy} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">Move to archive</button>}
      </div>}
    </article>)}{paths.length === 0 && <p className="text-sm text-[#64748B]">No submitted or published paths.</p>}</div>
  </div>;
}
