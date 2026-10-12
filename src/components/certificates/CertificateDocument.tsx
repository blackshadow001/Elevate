import React from "react";
import Link from "next/link";
import { Certificate } from "@/data/certificates";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { BrandImage } from "@/components/ui/Logo";
import { brand } from "@/lib/brand";

interface CertificateDocumentProps {
  certificate: Certificate;
}

export function CertificateDocument({ certificate }: CertificateDocumentProps) {
  return (
    <div className="w-full flex justify-center">
      <div
        id="certificate-print-area"
        className="relative w-[900px] max-w-full min-h-[700px] sm:min-h-[636px] bg-[#FFFDF9] border-[14px] border-[#172033] p-6 sm:p-12 shadow-2xl rounded-2xl flex flex-col justify-between text-[#172033] select-none print:m-0 print:border-8 print:shadow-none print:rounded-none"
      >
        {/* Subtle Decorative Inner Borders */}
        <div className="absolute inset-2 sm:inset-3 border-2 border-[#FF6B35]/35 rounded-xl pointer-events-none" />
        <div className="absolute inset-4 sm:inset-5 border border-[#172033]/15 rounded-lg pointer-events-none" />

        {/* Corner Classical Ornaments */}
        <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-[#FF6B35]" />
        <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-[#FF6B35]" />
        <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-[#FF6B35]" />
        <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-[#FF6B35]" />

        {/* Subtle Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none">
          <svg className="w-[500px] h-[500px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        {/* Top Header: Brand Logo & Certificate Title */}
        <div className="relative z-10 text-center space-y-3 pt-2">
          {/* Brand Mark */}
          <div className="flex items-center justify-center gap-2">
            <BrandImage size="large" />
          </div>

          <div className="space-y-0.5">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#FF6B35]">
              {brand.name} Demo Achievement
            </p>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#172033] tracking-tight">
              Certificate of Completion
            </h1>
          </div>
        </div>

        {/* Center: Recipient Presentation & Course */}
        <div className="relative z-10 text-center space-y-3 my-auto py-2">
          <p className="text-xs sm:text-sm text-[#64748B] italic">
            This certificate is proudly presented to
          </p>

          {/* Student Name */}
          <div className="inline-block max-w-full px-8 py-1 border-b-2 border-[#172033]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-[#172033] tracking-wide break-words">
              {certificate.studentName}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
            for completing all published lessons in
          </p>

          {/* Course Name */}
          <div className="bg-[#F7F8FA] inline-block max-w-full px-6 py-2 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#172033] tracking-tight break-words">
              {certificate.courseTitle}
            </h3>
          </div>

          {/* Skills Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto pt-1">
            {certificate.skillsAcquired.map((skill) => (
              <span
                key={skill}
                className="max-w-full break-words text-[10px] font-semibold bg-white border border-[#E5E7EB] text-[#172033] px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Section: 3-Column Signatures & Verified Center Seal */}
        <div className="relative z-10 pt-4">
          <div className="w-full grid grid-cols-3 items-end gap-4 text-xs pb-4">
            {/* 1. Left Signature: Instructor */}
            <div className="text-center space-y-1">
              <div className="font-serif italic text-lg sm:text-xl text-[#172033] border-b border-[#CBD5E1] pb-1">
                {certificate.instructorName}
              </div>
              <div className="font-bold text-[#172033] text-xs">{certificate.instructorName}</div>
              <div className="text-[10px] text-[#64748B] truncate">{certificate.instructorRole}</div>
            </div>

            {/* 2. Center Official Gold Seal (Balanced vertical alignment) */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#FF6B35] bg-gradient-to-tr from-[#FF6B35] to-[#FFA07A] flex items-center justify-center shadow-lg text-white">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#172033] mt-1.5">
                DEMO RECORD
              </span>
            </div>

            {/* 3. Right Signature: Academic Director */}
            <div className="text-center space-y-1">
              <div className="font-serif italic text-lg sm:text-xl text-[#172033] border-b border-[#CBD5E1] pb-1">
                {brand.name}
              </div>
              <div className="font-bold text-[#172033] text-xs">{brand.name} Demo</div>
              <div className="text-[10px] text-[#64748B]">Prototype completion record</div>
            </div>
          </div>

          {/* Metadata Footer Bar */}
          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Completed: <strong>{certificate.completedAt}</strong></span>
            </div>

            <div className="font-mono text-[10px] sm:text-[11px] text-[#172033] font-bold">
              ID: {certificate.certificateId}
            </div>

            <Link
              href={`/certificates/verify/${certificate.certificateId}`}
              className="text-[#FF6B35] font-semibold hover:underline"
            >
              Verify Certificate →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
