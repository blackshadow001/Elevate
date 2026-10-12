"use client";

import React from "react";
import Link from "next/link";
import { LiveClass } from "@/data/liveClasses";
import { LiveStatus } from "./LiveStatus";
import { Calendar, Clock, Users, ArrowRight, Video } from "lucide-react";

interface LiveClassCardProps {
  liveClass: LiveClass;
}

export function LiveClassCard({ liveClass }: LiveClassCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5 group">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <LiveStatus status={liveClass.status} />
          <span className="text-xs text-[#64748B] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{liveClass.duration} mins</span>
          </span>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wide block">
            {liveClass.courseTitle}
          </span>
          <h3 className="font-extrabold text-[#172033] text-base group-hover:text-[#FF6B35] transition-colors leading-snug line-clamp-2">
            {liveClass.title}
          </h3>
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
            {liveClass.description}
          </p>
        </div>

        <div className="bg-[#F8FAFC] p-3 rounded-2xl flex items-center justify-between text-xs text-[#172033]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{liveClass.scheduledAt} · {liveClass.startTime}</span>
          </div>
          <div className="flex items-center gap-1 text-[#64748B]">
            <Users className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{liveClass.registeredCount || liveClass.attendeesCount}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src={liveClass.instructorAvatar}
            alt={liveClass.instructorName}
            className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#172033] truncate">{liveClass.instructorName}</div>
            <div className="text-[10px] text-[#64748B] truncate">{liveClass.instructorRole}</div>
          </div>
        </div>

        <Link
          href={`/live/classes/${liveClass.id}`}
          className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            liveClass.status === "live"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-[#172033] hover:bg-[#FF6B35] text-white"
          }`}
        >
          <span>{liveClass.status === "live" ? "Join Live" : "Class Details"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
