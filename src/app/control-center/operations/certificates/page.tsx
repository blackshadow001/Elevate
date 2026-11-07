"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Award,
  Search,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useActionDialog } from "@/components/ui/ActionDialogProvider";

export default function AdminCertificatesPage() {
  const { confirm } = useActionDialog();
  const [certs, setCerts] = useState<Array<{id:string; certificate_number:string; learner_name:string; course_title:string; issued_at:string; verification_status:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status, page: String(page) });
      const response = await fetch(`/api/admin/certificates?${query}`, { credentials: "same-origin" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || "Unable to load certificates.");
      setCerts(json.data.items); setTotal(json.data.total); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load certificates."); }
    finally { setLoading(false); }
  }, [search, status, page]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const changeStatus = async (certificateId: string, nextStatus: "valid" | "revoked") => {
    if (!await confirm(`Confirm certificate ${nextStatus === "revoked" ? "revocation" : "restoration"}?`,
      { title: "Confirm certificate change", confirmLabel: nextStatus === "revoked" ? "Revoke" : "Restore", danger: nextStatus === "revoked" })) return;
    try {
      const response = await fetch(`/api/admin/certificates/${certificateId}`, { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || "Unable to update certificate.");
      setNotice(`Certificate ${nextStatus === "revoked" ? "revoked" : "restored"}.`); setError(""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update certificate."); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates of Completion"
        subtitle="Database-backed completion certificates and verification status. Certificates are not cryptographically signed."
        breadcrumbs={[{ label: "Operations" }, { label: "Certificates" }]}
      />

      <div className="flex flex-wrap gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4"><input aria-label="Search certificates" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search learner, course, or number" className="min-w-52 flex-1 rounded-xl border p-2 text-xs" /><select aria-label="Filter certificate status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border p-2 text-xs"><option value="">All statuses</option><option value="valid">Valid</option><option value="revoked">Revoked</option></select></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} <button onClick={() => void load()} className="underline">Retry</button></p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
      {loading ? <p className="p-8 text-sm text-[#64748B]">Loading certificates…</p> : !error && certs.length === 0 ? <div className="rounded-2xl border bg-white p-8 text-center text-sm text-[#64748B]"><Award className="mx-auto mb-3 h-6 w-6" />No certificates match these filters.</div> : <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-xs"><thead><tr className="border-b bg-[#F8FAFC]"><th className="p-4">Certificate</th><th className="p-4">Learner</th><th className="p-4">Course</th><th className="p-4">Issued</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{certs.map(cert => <tr key={cert.id} className="border-b"><td className="p-4 font-mono">{cert.certificate_number}</td><td className="p-4">{cert.learner_name}</td><td className="p-4">{cert.course_title}</td><td className="p-4">{new Date(cert.issued_at).toLocaleDateString("en-IN")}</td><td className="p-4">{cert.verification_status}</td><td className="p-4"><a className="mr-3 font-bold text-[#FF6B35]" href={`/certificates/verify/${encodeURIComponent(cert.certificate_number)}`} target="_blank" rel="noreferrer">Verify</a><button className="font-bold text-[#172033]" onClick={() => void changeStatus(cert.id, cert.verification_status === "valid" ? "revoked" : "valid")}>{cert.verification_status === "valid" ? "Revoke" : "Restore"}</button></td></tr>)}</tbody></table></div>}
      <div className="flex justify-end gap-3 text-xs"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Next</button></div>
    </div>
  );
}
