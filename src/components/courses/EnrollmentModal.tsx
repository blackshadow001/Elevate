"use client";

import React, { useEffect } from "react";
import { X, CheckCircle2, ShieldCheck, Play } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseTitle: string;
  coursePrice: number;
}

export function EnrollmentModal({
  isOpen,
  onClose,
  onConfirm,
  courseTitle,
  coursePrice,
}: EnrollmentModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E5E7EB] z-10 animate-in zoom-in-95 fade-in duration-200 space-y-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-black rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-50 text-[#FF6B35] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Play className="w-6 h-6 fill-[#FF6B35] ml-0.5" />
          </div>
          <h3 className="text-xl font-extrabold text-[#172033]">
            Ready to start learning?
          </h3>
          <p className="text-sm font-semibold text-[#FF6B35]">
            {courseTitle}
          </p>
        </div>

        <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E5E7EB] space-y-2 text-xs text-[#64748B]">
          <div className="flex justify-between items-center text-sm font-bold text-[#172033]">
            <span>{coursePrice > 0 ? "Course price" : "Free enrollment"}</span>
            <span className="text-[#FF6B35] text-lg">{formatINR(coursePrice)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{coursePrice > 0 ? "Payment confirmation is required before enrollment" : "Course access and progress saved on this server"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>{coursePrice > 0 ? "Checkout is not configured yet; no charge will be made" : "A certificate is issued after all lessons are completed"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors"
          >
            {coursePrice > 0 ? "Close" : "Cancel"}
          </button>
          {coursePrice === 0 && <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-97"
          >
            Enroll for Free →
          </button>}
        </div>
      </div>
    </div>
  );
}
