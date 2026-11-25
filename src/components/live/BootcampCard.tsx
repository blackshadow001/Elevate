"use client";

import React from "react";
import Link from "next/link";
import { Bootcamp } from "@/data/bootcamps";
import { Calendar, Video, FolderGit2, Users, ArrowRight, Flame } from "lucide-react";

interface BootcampCardProps {
  bootcamp: Bootcamp;
}

export function BootcampCard({ bootcamp }: BootcampCardProps) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E5E7EB] hover:border-[#FF6B35]/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
      {/* Top Banner with Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={bootcamp.coverImage}
          alt={bootcamp.title}
          className="w-full h-full object-cover scale-[1.08] group-hover:scale-100 transition-transform duration-500 ease-out motion-reduce:transform-none opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35] text-white text-xs font-black uppercase tracking-wider shadow-md">
            <Flame className="w-3.5 h-3.5" />
            <span>Bootcamp</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
            {bootcamp.totalDays} Days
          </span>
        </div>

        {/* Date Range on image bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{bootcamp.dateRange}</span>
          </span>
          <span className="text-[11px] text-slate-300 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {bootcamp.enrolledLearners.toLocaleString()} learners
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-extrabold text-lg sm:text-xl text-[#172033] group-hover:text-[#FF6B35] transition-colors leading-snug">
            {bootcamp.title}
          </h3>
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
            {bootcamp.tagline}
          </p>
        </div>

        {/* Highlights: Live sessions & Projects */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#172033]">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5" />
            </div>
            <span>{bootcamp.liveSessionsCount} live sessions</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#172033]">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
            <span>{bootcamp.projectsCount} projects</span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#F1F5F9]">
          {bootcamp.instructorAvatar ? <img
            src={bootcamp.instructorAvatar}
            alt={bootcamp.instructorName}
            className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
          /> : <span aria-hidden="true" className="w-9 h-9 rounded-full bg-[#172033] text-white text-xs font-bold flex items-center justify-center">{bootcamp.instructorName.charAt(0)}</span>}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#172033] truncate">{bootcamp.instructorName}</div>
            <div className="text-[10px] text-[#64748B] truncate">{bootcamp.instructorRole}</div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Link
            href={`/live/bootcamps/${bootcamp.slug}`}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#172033] group-hover:bg-[#FF6B35] text-white text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer"
          >
            <span>View Bootcamp</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
