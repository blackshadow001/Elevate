"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LiveClass } from "@/data/liveClasses";
import { Clock, Calendar, Users, Bell, BellRing, ArrowRight, Video, CheckCircle2 } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { liveService } from "@/services/liveService";

interface UpcomingClassProps {
  liveClass: LiveClass;
}

export function UpcomingClass({ liveClass }: UpcomingClassProps) {
  const { notify } = useNotification();
  const [hasReminder, setHasReminder] = useState(false);
  useEffect(() => {
    let active = true;
    liveService.isReminderSet(liveClass.id).then((value) => { if (active) setHasReminder(value); }).catch(() => {});
    return () => { active = false; };
  }, [liveClass.id]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  useEffect(() => {
    if (!detailsModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailsModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailsModalOpen]);

  const handleToggleReminder = async () => {
    try {
    const isSet = await liveService.toggleClassReminder(liveClass.id);
    setHasReminder(isSet);
    if (isSet) {
      notify({
        type: "success",
        title: "Reminder preference saved",
        message: `"${liveClass.title}" is saved to your account. Delivery requires notification integration.`,
      });
    } else {
      notify({
        type: "info",
        title: "Reminder Removed",
        message: `Reminder cancelled for "${liveClass.title}".`,
      });
    }
    } catch (error) {
      notify({ type: "error", title: "Reminder unavailable", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
        <div className="space-y-4">
          {/* Header: Date & Time Pill */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B35] text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{liveClass.scheduledAt} · {liveClass.startTime}</span>
            </span>

            <span className="text-xs text-[#64748B] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{liveClass.duration} mins</span>
            </span>
          </div>

          {/* Title & Course */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-base sm:text-lg text-[#172033] group-hover:text-[#FF6B35] transition-colors line-clamp-2 leading-snug">
              {liveClass.title}
            </h3>
            <p className="text-xs text-[#64748B] font-medium truncate">
              {liveClass.courseTitle}
            </p>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
            {liveClass.description}
          </p>

          {/* Instructor & Registered learners */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              {liveClass.instructorAvatar ? <img
                src={liveClass.instructorAvatar}
                alt={liveClass.instructorName}
                className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
              /> : <span aria-hidden="true" className="w-8 h-8 rounded-full bg-[#172033] text-white text-xs font-bold flex items-center justify-center">{liveClass.instructorName.charAt(0)}</span>}
              <div>
                <div className="text-xs font-bold text-[#172033]">{liveClass.instructorName}</div>
                <div className="text-[10px] text-[#64748B]">{liveClass.instructorRole}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-[#172033] flex items-center gap-1 justify-end">
                <Users className="w-3 h-3 text-[#FF6B35]" />
                <span>{liveClass.registeredCount || liveClass.attendeesCount}</span>
              </div>
              <div className="text-[10px] text-[#64748B]">in classroom</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-5 mt-4 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={handleToggleReminder}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hasReminder
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-[#F7F8FA] hover:bg-[#EEF0F4] text-[#172033] border border-[#E5E7EB]"
            }`}
          >
            {hasReminder ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reminder Set</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Add Reminder</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDetailsModalOpen(true)}
            className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold text-[#FF6B35] hover:bg-orange-50 border border-orange-200/80 transition-all cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailsModalOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-label={`${liveClass.title} details`} className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-[#E5E7EB] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B35] text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{liveClass.scheduledAt} · {liveClass.startTime}</span>
              </span>
              <button
                type="button"
                aria-label="Close class details"
                onClick={() => setDetailsModalOpen(false)}
                className="text-[#64748B] hover:text-[#172033] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#172033]">{liveClass.title}</h3>
              <p className="text-xs text-[#FF6B35] font-semibold">{liveClass.courseTitle}</p>
              <p className="text-sm text-[#64748B] leading-relaxed pt-1">{liveClass.description}</p>
            </div>

            {/* Meta details */}
            <div className="bg-[#F7F8FA] rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#64748B] block">Duration</span>
                <span className="font-bold text-[#172033]">{liveClass.duration} minutes</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Registered</span>
                <span className="font-bold text-[#172033]">{liveClass.registeredCount || liveClass.attendeesCount} learners</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Instructor</span>
                <span className="font-bold text-[#172033]">{liveClass.instructorName}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Classroom Tech</span>
                <span className="font-bold text-[#172033] uppercase">{liveClass.provider || "Integrated Studio"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleToggleReminder}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  hasReminder
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#172033] text-white hover:bg-[#26344D]"
                }`}
              >
                {hasReminder ? "✓ Reminder Active" : "Add Calendar Reminder"}
              </button>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="py-3 px-5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
