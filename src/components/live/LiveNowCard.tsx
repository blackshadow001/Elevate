"use client";

import React from "react";
import Link from "next/link";
import { LiveClass } from "@/data/liveClasses";
import { Users, ArrowRight, Radio, BadgeCheck, BookOpen } from "lucide-react";

interface LiveNowCardProps {
  liveClass: LiveClass;
}

export function LiveNowCard({ liveClass }: LiveNowCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172033] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/10 group">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-[#FF6B35]/25 transition-all duration-700" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Live badge, title, speaker, meta */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black tracking-wider uppercase backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span>LIVE NOW</span>
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium backdrop-blur-md">
              <Users className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>{liveClass.attendeesCount} learners watching</span>
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
              {liveClass.courseTitle}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {liveClass.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl line-clamp-2 leading-relaxed">
              {liveClass.description}
            </p>
          </div>

          {/* Instructor & Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <img
                src={liveClass.instructorAvatar}
                alt={liveClass.instructorName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF6B35]/40"
              />
              <div>
                <div className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>{liveClass.instructorName}</span>
                </div>
                <div className="text-xs text-slate-400">{liveClass.instructorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {liveClass.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: CTA card */}
        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
          <div className="w-full sm:max-w-xs lg:w-full p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-4">
            <div className="space-y-1 text-left">
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#FF6B35]">
                Active Classroom
              </div>
              <div className="text-xs text-slate-300">
                Classroom preview with stored chat. Video streaming is pending provider integration.
              </div>
            </div>

            <Link
              href={`/live/classes/${liveClass.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E85D2A] hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-[#FF6B35]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Join Live Class</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
