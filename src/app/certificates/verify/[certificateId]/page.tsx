"use client";

import React, { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { useLearningState } from "@/lib/learningState";

interface PageProps {
  params: Promise<{ certificateId?: string }>;
}

export default function CertificateVerifyPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDF9] p-8 text-center">Loading certificate lookup…</div>}>
      <CertificateVerification params={params} />
    </Suspense>
  );
}

function CertificateVerification({ params }: PageProps) {
  const { certificates } = useLearningState();
  const resolvedParams = use(params);
  const initialId = resolvedParams?.certificateId || "";
  const [searchId, setSearchId] = useState(initialId);
  const [hasSearched, setHasSearched] = useState(Boolean(initialId));
  const [activeCertificate, setActiveCertificate] = useState<{ certificateNumber: string; studentName: string; courseName: string; instructorName: string; completedAt: string } | null>(null);
  const [loading, setLoading] = useState(Boolean(initialId));
  const [lookupError, setLookupError] = useState("");
  const ownCertificate = certificates.find((certificate) => certificate.certificateId === activeCertificate?.certificateNumber);

  useEffect(() => {
    if (!initialId) return;
    let cancelled = false;
    fetch(`/api/certificates/verify/${encodeURIComponent(initialId)}`, { cache: "no-store" })
      .then(async (response) => ({ ok: response.ok, body: await response.json() }))
      .then(({ ok, body }) => {
        if (!cancelled) {
          setActiveCertificate(ok && body.data?.valid ? body.data.certificate : null);
          setLookupError(ok ? "" : body.error?.message || "Verification is unavailable. Try again.");
        }
      })
      .catch(() => { if (!cancelled) setLookupError("Unable to reach verification. Try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initialId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setLoading(true);
    setLookupError("");
    setActiveCertificate(null);
    try {
      const response = await fetch(`/api/certificates/verify/${encodeURIComponent(searchId.trim())}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Verification is unavailable.");
      setActiveCertificate(body.data?.valid ? body.data.certificate : null);
    } catch (error) { setLookupError(error instanceof Error ? error.message : "Verification is unavailable."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-12 max-w-3xl mx-auto px-4 sm:px-6 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
            Certificate Verification
          </h1>
          <p className="text-sm text-[#64748B]">
            Check a certificate against issued records on the Elevate server.
          </p>
        </div>

        {/* Verification Search Bar */}
        <form onSubmit={handleVerify} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              required
              aria-label="Certificate ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID"
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35] shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#172033] hover:bg-[#FF6B35] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Verify
          </button>
        </form>

        {/* Verified Result Card */}
        {loading ? <p role="status" className="text-center text-sm text-[#64748B]">Checking certificate…</p> : lookupError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-white p-5 text-center text-sm text-red-600">{lookupError}</p>
        ) : activeCertificate ? (
          <div className="bg-white rounded-3xl border border-emerald-200/80 p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-6 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
                <div>
                  <h2 className="text-base font-bold text-[#172033]">
                    Certificate Verified ✓
                  </h2>
                  <p className="text-xs text-[#16A34A] font-semibold">
                    Found in the Elevate issued certificate records
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-[#16A34A] px-3 py-1 rounded-full border border-emerald-200">
                STATUS: VALID
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] uppercase font-bold text-[10px]">Recipient</span>
                <div className="text-base font-bold text-[#172033] mt-1">
                  {activeCertificate.studentName}
                </div>
              </div>

              <div className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] uppercase font-bold text-[10px]">Certificate ID</span>
                <div className="text-base font-mono font-bold text-[#172033] mt-1">
                  {activeCertificate.certificateNumber}
                </div>
              </div>

              <div className="sm:col-span-2 bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] uppercase font-bold text-[10px]">Course Curriculum</span>
                <div className="text-sm font-bold text-[#172033] mt-1">
                  {activeCertificate.courseName}
                </div>
              </div>

              <div className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] uppercase font-bold text-[10px]">Instructor</span>
                <div className="text-xs font-bold text-[#172033] mt-1">
                  {activeCertificate.instructorName}
                </div>
              </div>

              <div className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] uppercase font-bold text-[10px]">Completion Date</span>
                <div className="text-xs font-bold text-[#172033] mt-1">
                  {activeCertificate.completedAt}
                </div>
              </div>
            </div>

            {ownCertificate && <div className="pt-2 flex justify-end">
              <Link
                href={`/certificates/${ownCertificate.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] hover:underline"
              >
                <span>View Full Certificate Document</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>}
          </div>
        ) : hasSearched ? (
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-500">
              No matching certificate found for &ldquo;{searchId}&rdquo;
            </p>
            <p className="text-xs text-[#64748B]">
              Check the certificate number and try again.
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-[#64748B]">Enter a certificate ID to check issued records.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}
