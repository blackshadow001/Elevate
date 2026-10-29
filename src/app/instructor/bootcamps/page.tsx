"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bootcamp } from "@/data/bootcamps";
import { liveService } from "@/services/liveService";
import { 
  Flame, 
  PlusCircle, 
  Calendar, 
  Video, 
  FolderGit2, 
  Users, 
  ArrowRight, 
  Edit3, 
  Clock 
} from "lucide-react";

export default function InstructorBootcampsPage() {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);

  useEffect(() => {
    liveService.getInstructorBootcamps().then(setBootcamps).catch(() => setBootcamps([]));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Bootcamps Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Build and manage multi-day sprint cohorts with structured daily live sessions and projects.
          </p>
        </div>

        <Link
          href="/instructor/bootcamps/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-97 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create New Bootcamp</span>
        </Link>
      </div>

      {/* Bootcamps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bootcamps.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B35] text-[10px] font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{b.totalDays} Days Cohort</span>
                </span>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>{b.dateRange}</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-extrabold text-base text-[#172033] leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2">
                  {b.tagline}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-3 rounded-2xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] block">Sessions</span>
                  <span className="font-extrabold text-[#172033]">{b.liveSessionsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block">Projects</span>
                  <span className="font-extrabold text-[#172033]">{b.projectsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block">Enrolled</span>
                  <span className="font-extrabold text-emerald-700">{b.enrolledLearners.toLocaleString()}</span>
                </div>
              </div>

              {/* Syllabus preview */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-extrabold uppercase text-[#64748B]">
                  Curriculum Highlights
                </div>
                <div className="space-y-1">
                  {b.sessions.slice(0, 3).map((s) => (
                    <div key={s.dayNumber} className="text-xs text-[#172033] flex items-center justify-between py-0.5">
                      <span className="truncate">Day {s.dayNumber}: {s.title}</span>
                      <span className="text-[10px] text-[#64748B] shrink-0 capitalize">{s.status}</span>
                    </div>
                  ))}
                  {b.sessions.length > 3 && (
                    <span className="text-[10px] text-[#FF6B35] font-bold">
                      +{b.sessions.length - 3} more daily sessions
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
              <Link
                href={`/live/bootcamps/${b.slug}`}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033] text-center"
              >
                View Cohort Schedule
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
