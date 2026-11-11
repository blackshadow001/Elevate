"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Certificate } from "@/data/certificates";
import { CertificateDocument } from "@/components/certificates/CertificateDocument";
import { Download, ArrowLeft, Share2, Image as ImageIcon, Loader2 } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { toPng } from "html-to-image";
import { useLearningState } from "@/lib/learningState";

interface CertificateDetailClientProps {
  certificateId: string;
}

export function CertificateDetailClient({ certificateId }: CertificateDetailClientProps) {
  const { certificates, loading, error } = useLearningState();
  const resolved = certificates.find((item) => item.id === certificateId || item.certificateId === certificateId);
  if (loading) return <div className="min-h-screen bg-[#F7F8FA] p-10 text-center text-sm text-[#64748B]">Loading certificate…</div>;
  if (!resolved) return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold text-[#172033]">Certificate not found</h1>
        <p className="mt-3 text-sm text-[#64748B]">{error || "This certificate is unavailable in your issued records."}</p>
        <Link href="/certificates" className="inline-block mt-5 text-[#FF6B35] font-bold">My Certificates →</Link>
      </main>
      <Footer />
    </div>
  );
  return <CertificateDetailBody certificate={resolved} />;
}

function CertificateDetailBody({ certificate }: { certificate: Certificate }) {
  const { notify } = useNotification();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);

  // 1. Direct PNG Download
  const handleDownloadPng = async () => {
    const el = document.getElementById("certificate-print-area");
    if (!el) return;

    try {
      setDownloadingPng(true);
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `Certificate-${certificate.certificateId}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify({
        type: "success",
        title: "Certificate Saved",
        message: "Unsigned preview image downloaded successfully.",
      });
    } catch (err) {
      console.error("PNG generation failed:", err);
      notify({
        type: "error",
        title: "Download Failed",
        message: "Could not generate PNG. Please try again.",
      });
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const response = await fetch(`/api/certificates/${encodeURIComponent(certificate.id)}/download`, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message || "Could not download the signed certificate.");
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Certificate-${certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);

      notify({
        type: "success",
        title: "PDF Saved",
        message: "Digitally signed certificate downloaded successfully.",
      });
    } catch (err) {
      notify({
        type: "error",
        title: "Download Failed",
        message: err instanceof Error ? err.message : "Could not download the signed certificate. Please try again.",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}/certificates/verify/${certificate.certificateId}`
      );
      notify({
        type: "info",
        title: "Verification Link Copied",
        message: "Shareable link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] print:bg-white">
      {/* Top Bar (Hidden on print) */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 py-10 print:p-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 print:p-0">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <Link
              href="/certificates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Certificates</span>
            </Link>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              {/* Download as PNG */}
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={downloadingPng}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#172033] hover:bg-slate-50 hover:border-[#FF6B35]/40 transition-all shadow-xs active:scale-97 disabled:opacity-60 cursor-pointer"
              >
                {downloadingPng ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF6B35]" />
                )}
                <span>{downloadingPng ? "Generating PNG..." : "Download preview PNG"}</span>
              </button>

              {/* Download as PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-97 disabled:opacity-60 cursor-pointer"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{downloadingPdf ? "Signing PDF..." : "Download signed PDF"}</span>
              </button>
            </div>
          </div>

          {/* Render Responsive Certificate Document */}
          <div className="overflow-x-auto pb-4 print:p-0">
            <CertificateDocument certificate={certificate} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
