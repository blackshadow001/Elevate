"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";

type Application = { id: string; subject: string; experience: string; coursePlan: string;
  portfolioUrl: string | null; status: string; adminNote: string | null; submittedAt: string;
  applicant: { name: string; email: string; role: string } };

export default function TutorApplicationsPage() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState<Application[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selected = items.find((item) => item.id === selectedId);

  async function load(nextStatus = status) {
    const response = await fetch(`/api/admin/tutor-applications?status=${nextStatus}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || "Unable to load applications.");
    setItems(body.data);
    setSelectedId((current) => body.data.some((item: Application) => item.id === current) ? current : body.data[0]?.id || "");
  }
  useEffect(() => {
    let active = true;
    fetch(`/api/admin/tutor-applications?status=${status}`, { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load applications.");
      if (active) { setItems(body.data); setSelectedId(body.data[0]?.id || ""); setError(""); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load applications."); });
    return () => { active = false; };
  }, [status]);
  async function review(action: "approve" | "reject") {
    if (!selected) return;
    if (!window.confirm(`${action === "approve" ? "Approve" : "Reject"} ${selected.applicant.name}'s application?${action === "approve" ? " Their account will become a tutor and current sessions will end." : ""}`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/tutor-applications/${encodeURIComponent(selected.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to save review.");
      setMessage(action === "approve" ? "Approved. The learner can sign in again as a tutor." : "Rejected. The learner can apply again.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save review."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Tutor Applications" subtitle="Review learner applications before granting tutor access." breadcrumbs={[{ label: "People" }, { label: "Tutor Applications" }]} />
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
    <div className="flex flex-wrap gap-2">{["pending", "approved", "rejected", "all"].map((value) => <button key={value} onClick={() => setStatus(value)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${status === value ? "bg-[#172033] text-white" : "border border-[#E5E7EB] bg-white text-[#172033]"}`}>{value}</button>)}</div>
    <div className="grid gap-6 lg:grid-cols-[minmax(270px,0.85fr)_minmax(0,1.2fr)]">
      <section aria-label="Applications" className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><h2 className="text-lg font-bold">Applications ({items.length})</h2>{items.length ? <div className="mt-4 space-y-2">{items.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-4 text-left ${selectedId === item.id ? "border-[#FF6B35] bg-orange-50" : "border-[#E5E7EB]"}`}><strong className="block text-sm">{item.applicant.name}</strong><span className="mt-1 block text-xs text-[#64748B]">{item.subject} · {new Date(item.submittedAt).toLocaleDateString("en-IN")}</span><span className="mt-1 block text-xs capitalize">{item.status}</span></button>)}</div> : <p className="mt-5 text-sm text-[#64748B]">No {status === "all" ? "" : status} applications.</p>}</section>
      <section aria-label="Application review" className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        {!selected ? <p className="text-sm text-[#64748B]">Select an application to review.</p> : <div className="space-y-5">
          <div><h2 className="text-xl font-bold">{selected.applicant.name}</h2><p className="text-sm text-[#64748B]">{selected.applicant.email}</p><Link href="/control-center/users" className="mt-2 inline-block text-sm font-semibold text-[#FF6B35]">User directory →</Link></div>
          <div><h3 className="text-xs font-bold uppercase text-[#64748B]">Teaching subject</h3><p className="mt-1 text-sm">{selected.subject}</p></div>
          <div><h3 className="text-xs font-bold uppercase text-[#64748B]">Experience and qualifications</h3><p className="mt-1 whitespace-pre-wrap text-sm">{selected.experience}</p></div>
          <div><h3 className="text-xs font-bold uppercase text-[#64748B]">First course idea</h3><p className="mt-1 whitespace-pre-wrap text-sm">{selected.coursePlan}</p></div>
          {selected.portfolioUrl && <div><h3 className="text-xs font-bold uppercase text-[#64748B]">Portfolio</h3><a href={selected.portfolioUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all text-sm text-[#FF6B35] underline">{selected.portfolioUrl}</a></div>}
          {selected.status === "pending" && <div className="flex flex-wrap gap-2 border-t border-[#E5E7EB] pt-5">
            <button disabled={busy} onClick={() => void review("approve")} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Approve tutor</button>
            <button disabled={busy} onClick={() => void review("reject")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Reject</button>
          </div>}
          {selected.status !== "pending" && <p className="rounded-xl bg-[#F7F8FA] p-4 text-sm">Decision: {selected.status}</p>}
        </div>}
      </section>
    </div>
  </div>;
}
