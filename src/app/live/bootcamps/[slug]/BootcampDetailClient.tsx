"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Bootcamp } from "@/data/bootcamps";
import { 
  Flame, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Play, 
  Download, 
  FileCode, 
  Award,
  Video
} from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { liveService } from "@/services/liveService";

interface BootcampDetailClientProps {
  bootcamp: Bootcamp;
}

export function BootcampDetailClient({ bootcamp }: BootcampDetailClientProps) {
  const { notify } = useNotification();
  const [isRegistered, setIsRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    liveService.getBootcampRegistration(bootcamp.slug).then((value) => {
      if (active) setIsRegistered(value);
    }).catch(() => {});
    return () => { active = false; };
  }, [bootcamp.slug]);
  const completedSessions = bootcamp.sessions.filter((session) => session.status === "completed").length;
  const cohortProgress = bootcamp.sessions.length ? Math.round((completedSessions / bootcamp.sessions.length) * 100) : 0;
  const [selectedDay, setSelectedDay] = useState<number>(bootcamp.sessions.find((s) => s.status === "live")?.dayNumber || bootcamp.sessions[0]?.dayNumber || 1);

  const activeSession = bootcamp.sessions.find((s) => s.dayNumber === selectedDay) || bootcamp.sessions[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <Link href="/live" className="text-[#FF6B35] font-bold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Live Learning</span>
            </Link>
            <span className="text-[#64748B]">/</span>
            <Link href="/live/bootcamps" className="text-[#64748B] hover:text-[#172033]">
              Bootcamps
            </Link>
            <span className="text-[#64748B]">/</span>
            <span className="text-[#172033] font-semibold truncate">{bootcamp.title}</span>
          </div>

          {/* Top Banner Card */}
          <div className="bg-[#172033] text-white rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35] text-white text-xs font-black uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{bootcamp.totalDays}-Day Cohort</span>
                  </span>
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>{bootcamp.dateRange}</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  {bootcamp.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {bootcamp.description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  {bootcamp.instructorAvatar ? <img
                    src={bootcamp.instructorAvatar}
                    alt={bootcamp.instructorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF6B35]/40"
                  /> : <span aria-hidden="true" className="w-10 h-10 rounded-full bg-[#172033] text-white text-sm font-bold flex items-center justify-center ring-2 ring-[#FF6B35]/40">{bootcamp.instructorName.charAt(0)}</span>}
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">{bootcamp.instructorName}</div>
                    <div className="text-[11px] text-slate-400">{bootcamp.instructorRole}</div>
                  </div>
                </div>
                <button type="button" disabled={busy} onClick={async () => {
                  setBusy(true);
                  try {
                    const registered = await liveService.toggleBootcampRegistration(bootcamp.slug);
                    setIsRegistered(registered);
                    notify({ type: registered ? "success" : "info", title: registered ? "Registration saved" : "Registration removed", message: registered ? "This bootcamp is saved to your account." : "You have left this bootcamp." });
                  } catch (error) {
                    notify({ type: "error", title: "Registration unavailable", message: error instanceof Error ? error.message : "Please try again." });
                  } finally { setBusy(false); }
                }} className="rounded-xl bg-[#FF6B35] px-5 py-3 text-xs font-bold text-white hover:bg-[#E85D2A]">
                  {isRegistered ? "Registered · Cancel Registration" : "Register for Cohort"}
                </button>
              </div>

              {/* Progress Tracker Card (Requirement 23) */}
              <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Sessions held
                  </span>
                  <span className="text-base font-black text-[#FF6B35]">
                    {cohortProgress}%
                  </span>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B35] to-[#E85D2A] rounded-full transition-all duration-700"
                    style={{ width: `${cohortProgress}%` }}
                  />
                </div>

                <div className="text-xs text-slate-300 flex items-center justify-between pt-1">
                  <span>{completedSessions} of {bootcamp.sessions.length} scheduled sessions elapsed</span>
                  <span className="text-emerald-400 font-bold">Schedule status</span>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum & Next Upcoming Session (Requirement 23) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 cols: Day-by-Day Syllabus Schedule */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-black text-[#172033] uppercase tracking-wider">
                Bootcamp Schedule
              </h2>

              <div className="space-y-2">
                {bootcamp.sessions.map((session) => {
                  const isSelected = selectedDay === session.dayNumber;
                  const isCompleted = session.status === "completed";
                  const isLive = session.status === "live";

                  return (
                    <button
                      type="button"
                      key={session.dayNumber}
                      onClick={() => setSelectedDay(session.dayNumber)}
                      className={`w-full text-left p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-[#FF6B35] bg-orange-50/70 shadow-xs"
                          : "border-[#E5E7EB] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Icon */}
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : isLive ? (
                            <span className="relative flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-black items-center justify-center">
                                →
                              </span>
                            </span>
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#172033] truncate">
                            Day {session.dayNumber} — {session.title}
                          </div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 pt-0.5">
                            <span>{session.date}</span>
                            <span>•</span>
                            <span>{session.time}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isLive && (
                          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-black uppercase">
                            Live Now
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Date passed
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 7 cols: Selected Day Focus & Action */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 space-y-6 shadow-sm">
              {activeSession && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B35] text-xs font-extrabold uppercase">
                      Day {activeSession.dayNumber} Session Breakdown
                    </span>

                    <span className="text-xs text-[#64748B] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeSession.duration} minutes</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-[#172033]">
                      Day {activeSession.dayNumber} — {activeSession.title}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {activeSession.description}
                    </p>
                  </div>

                  {/* Live CTA Box (Requirement 23) */}
                  {activeSession.status === "live" ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-red-200">
                          🔴 Live Session Currently Active
                        </span>
                        <span className="text-xs font-bold">{activeSession.time}</span>
                      </div>
                      <p className="text-xs text-white/90">
                        The {bootcamp.instructorName} demo classroom is open. Live streaming requires a provider.
                      </p>
                      {activeSession.liveClassId ? <Link
                        href={`/live/classes/${activeSession.liveClassId}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-red-700 font-extrabold text-xs shadow-md hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Live Class →</span>
                      </Link> : <p className="text-xs text-white/90">A classroom link will appear when the session is connected to a live class.</p>}
                    </div>
                  ) : activeSession.status === "completed" ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                        <span>Session date passed</span>
                        <span>Recording pending integration</span>
                      </div>
                      <p className="text-xs text-emerald-800">Replay files require video storage integration.</p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2">
                      <div className="text-xs font-bold text-[#172033]">
                        Upcoming Session: {activeSession.date} · {activeSession.time}
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Classroom room opens 10 minutes prior to scheduled start time.
                      </p>
                    </div>
                  )}

                  {/* Assignment & Resources */}
                  {activeSession.assignmentTitle && <div className="border-t border-[#F1F5F9] pt-4 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                      Daily Project Assignment
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <FileCode className="w-5 h-5 text-[#FF6B35]" />
                        <span className="text-xs font-bold text-[#172033]">
                          {activeSession.assignmentTitle}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B]">Resources pending storage integration</span>
                    </div>
                  </div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
