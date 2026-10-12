"use client";

import { LiveClass } from "@/data/liveClasses";
import { ArrowLeft, Calendar, Clock, Info } from "lucide-react";

interface LiveAnalyticsProps {
  liveClass: LiveClass;
  onBack?: () => void;
}

export function LiveAnalytics({ liveClass, onBack }: LiveAnalyticsProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 space-y-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">Session Completed</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033] mt-3">{liveClass.title}</h2>
          <p className="text-xs text-[#64748B] mt-1">{liveClass.courseTitle}</p>
        </div>
        {onBack && <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] hover:bg-slate-50 cursor-pointer self-start"><ArrowLeft className="w-4 h-4" />Back to Studio</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-[#64748B] font-semibold"><Calendar className="w-4 h-4 text-[#FF6B35]" />Scheduled</div>
          <p className="mt-2 text-base font-bold text-[#172033]">{liveClass.scheduledAt} · {liveClass.startTime}</p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-[#64748B] font-semibold"><Clock className="w-4 h-4 text-[#FF6B35]" />Planned duration</div>
          <p className="mt-2 text-base font-bold text-[#172033]">{liveClass.duration} minutes</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <Info className="w-5 h-5 shrink-0" />
        <p>The class status and schedule are saved on this server. Attendance, watch time, poll results, resource downloads, and recordings are unavailable until live streaming and analytics providers are connected.</p>
      </div>
    </div>
  );
}
