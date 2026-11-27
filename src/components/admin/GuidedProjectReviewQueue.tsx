"use client";

import { useEffect, useState } from "react";

type Submission = { id: string; learner_name: string; learner_email: string; path_title: string;
  project_url: string; repository_url: string; notes: string; project_brief: string;
  project_requirements_json: string; submitted_at: string };

export function GuidedProjectReviewQueue() {
  const [items, setItems] = useState<Submission[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const response = await fetch("/api/admin/guided-projects", { cache: "no-store" });
    const body = await response.json();
    if (response.ok) setItems(body.data);
    else setMessage(body.error?.message || "Project review queue unavailable.");
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/guided-projects", { cache: "no-store" }).then((response) => response.json().then((body) => ({ response, body })))
      .then(({ response, body }) => { if (active) { if (response.ok) setItems(body.data); else setMessage(body.error?.message || "Project review queue unavailable."); } })
      .catch(() => { if (active) setMessage("Project review queue unavailable."); });
    return () => { active = false; };
  }, []);
  async function decide(item: Submission, decision: "approve" | "changes_requested") {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/guided-projects/${item.id}`, { method: "PATCH",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, feedback: feedback[item.id] || "" }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Review could not be saved.");
      await load(); setMessage(decision === "approve" ? "Project approved." : "Changes requested from the learner.");
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7">
    <h2 className="text-xl font-extrabold text-[#172033]">Certification project reviews</h2>
    <p className="mt-2 text-sm text-[#64748B]">Open the live work and source code, check every requirement, then approve or request changes. Approval and a passed assessment are both required for a certificate.</p>
    {message && <p role="status" className="mt-4 rounded-xl bg-orange-50 p-3 text-sm">{message}</p>}
    {items.length === 0 && <p className="mt-5 text-sm text-[#64748B]">No projects are waiting for review.</p>}
    <div className="mt-5 space-y-5">{items.map((item) => <article key={item.id} className="rounded-xl border border-[#E5E7EB] p-5">
      <h3 className="font-bold text-[#172033]">{item.path_title} · {item.learner_name}</h3>
      <p className="mt-1 text-xs text-[#64748B]">{item.learner_email} · Submitted {item.submitted_at}</p>
      <p className="mt-3 text-sm text-[#475569]">{item.project_brief}</p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[#475569]">{(JSON.parse(item.project_requirements_json) as string[]).map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[#D65B28]"><a href={item.project_url} target="_blank" rel="noopener noreferrer" className="underline">Open project ↗</a><a href={item.repository_url} target="_blank" rel="noopener noreferrer" className="underline">Open source ↗</a></div>
      <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#F7F8FA] p-4 text-sm text-[#475569]">{item.notes}</p>
      <label className="mt-4 block text-sm font-bold">Review feedback<textarea value={feedback[item.id] || ""} onChange={(event) => setFeedback({ ...feedback, [item.id]: event.target.value })} rows={3} className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label>
      <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void decide(item, "approve")} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Approve project</button><button type="button" disabled={busy || (feedback[item.id] || "").trim().length < 20} onClick={() => void decide(item, "changes_requested")} className="rounded-xl border border-amber-600 px-4 py-2 text-sm font-bold text-amber-800 disabled:opacity-50">Request changes</button></div>
    </article>)}</div>
  </section>;
}
