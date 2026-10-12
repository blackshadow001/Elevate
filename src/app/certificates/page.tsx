"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLearningState } from "@/lib/learningState";
import { Award, ArrowRight, Eye, CheckCircle2 } from "lucide-react";

export default function CertificatesPage() {
  const { certificates, loading, error } = useLearningState();
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#E5E7EB]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Achievements & Credentials
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight mt-1">
              My Certificates
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Review certificates issued to your account and verify them by certificate number.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] hover:underline"
          >
            <span>Explore More Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-[#64748B]" role="status">Loading your certificates…</div>
        ) : error ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
            <h2 className="text-lg font-bold text-[#172033]">Unable to load certificates</h2>
            <p className="mt-2 text-sm text-[#64748B]">{error}</p>
            <Link href="/dashboard" className="mt-4 inline-block font-bold text-[#FF6B35]">Back to Dashboard</Link>
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 shadow-xs hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-[#F7F8FA] px-2.5 py-1 rounded-md text-[#64748B] border border-[#E5E7EB]">
                      {cert.certificateId}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#172033] mb-2 leading-snug">
                    {cert.courseTitle}
                  </h2>
                  <p className="text-xs text-[#64748B] mb-4">
                    Instructor: <strong className="text-[#172033]">{cert.instructorName}</strong> · Completed on {cert.completedAt}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#16A34A] font-semibold mb-6">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Result: {cert.grade}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center gap-3">
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Certificate</span>
                  </Link>

                  <Link
                    href={`/certificates/verify/${cert.certificateId}`}
                    className="inline-flex items-center justify-center p-3 border border-[#E5E7EB] hover:bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#172033] transition-colors"
                    title="Verify Authenticity"
                  >
                    Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#172033]">You haven&apos;t earned any certificates yet.</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Complete all published lessons in an enrolled course to earn a certificate tied to your account.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FF6B35] text-white text-xs font-bold"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
