"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LiveClass } from "@/data/liveClasses";
import { Bootcamp } from "@/data/bootcamps";
import { LiveEvent } from "@/data/events";
import { liveService } from "@/services/liveService";
import { LiveNowCard } from "@/components/live/LiveNowCard";
import { UpcomingClass } from "@/components/live/UpcomingClass";
import { BootcampCard } from "@/components/live/BootcampCard";
import { EventCard } from "@/components/live/EventCard";
import { 
  Radio, 
  Calendar, 
  Flame, 
  BadgeCheck,
  ArrowRight, 
  Users, 
  Clock, 
  Layers, 
  Search,
  Filter
} from "lucide-react";

export default function LiveLearningLandingPage() {
  const [activeTab, setActiveTab] = useState<"all" | "live" | "upcoming" | "bootcamps" | "events">("all");
  const [liveNowClass, setLiveNowClass] = useState<LiveClass | undefined>();
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    liveService.getLiveNow().then(setLiveNowClass);
    liveService.getUpcomingClasses().then(setUpcomingClasses);
    liveService.getBootcamps().then(setBootcamps);
    liveService.getEvents().then(setEvents);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-14 sm:py-20 bg-gradient-to-b from-orange-50/50 via-white to-[#FFFDF9] border-b border-[#E5E7EB]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs font-black uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span>Live Classroom Preview</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#172033] tracking-tight leading-tight">
                Live Learning
              </h1>

              <p className="text-lg sm:text-xl text-[#64748B] font-medium leading-relaxed">
                Learn together. Ask questions. Build together.
              </p>
              <Link href="/live/recordings" className="inline-flex rounded-xl bg-[#172033] px-5 py-3 text-sm font-bold text-white hover:bg-[#26344D]">Watch class recordings →</Link>
            </div>

            {/* Filter Tabs (Requirement 3: [ Live Now ] [ Upcoming ] [ Bootcamps ] [ Events ]) */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "all"
                    ? "bg-[#172033] text-white shadow-md"
                    : "bg-white text-[#64748B] hover:text-[#172033] border border-[#E5E7EB] hover:bg-slate-50"
                }`}
              >
                All Experiences
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("live")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "live"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-white text-[#64748B] hover:text-[#172033] border border-[#E5E7EB] hover:bg-slate-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Live Now ({liveNowClass ? 1 : 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "upcoming"
                    ? "bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20"
                    : "bg-white text-[#64748B] hover:text-[#172033] border border-[#E5E7EB] hover:bg-slate-50"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming Classes ({upcomingClasses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bootcamps")}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "bootcamps"
                    ? "bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20"
                    : "bg-white text-[#64748B] hover:text-[#172033] border border-[#E5E7EB] hover:bg-slate-50"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Bootcamps ({bootcamps.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "events"
                    ? "bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20"
                    : "bg-white text-[#64748B] hover:text-[#172033] border border-[#E5E7EB] hover:bg-slate-50"
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Events ({events.length})</span>
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* SECTION 1: Live Now Prominent Card (Requirements 3 & 4) */}
          {(activeTab === "all" || activeTab === "live") && liveNowClass && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <h2 className="text-xl sm:text-2xl font-black text-[#172033]">
                    Currently Live Now
                  </h2>
                </div>
              </div>

              <LiveNowCard liveClass={liveNowClass} />
            </section>
          )}

          {/* SECTION 2: Upcoming Classes (Requirement 5) */}
          {(activeTab === "all" || activeTab === "upcoming") && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#172033]">
                    Upcoming Live Classes
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                    Interactive mentor sessions scheduled for this week.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingClasses.map((item) => (
                  <UpcomingClass key={item.id} liveClass={item} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: Bootcamps (Requirement 6) */}
          {(activeTab === "all" || activeTab === "bootcamps") && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#FF6B35]" />
                    <h2 className="text-xl sm:text-2xl font-black text-[#172033]">
                      Cohort-Based Bootcamps
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                    Multi-day intensive programs with live daily code-alongs and project grading.
                  </p>
                </div>

                <Link
                  href="/live/bootcamps"
                  className="text-xs font-bold text-[#FF6B35] hover:text-[#E85D2A] flex items-center gap-1 group"
                >
                  <span>Explore All Bootcamps</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bootcamps.map((b) => (
                  <BootcampCard key={b.id} bootcamp={b} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: Events (Requirement 7) */}
          {(activeTab === "all" || activeTab === "events") && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl sm:text-2xl font-black text-[#172033]">
                      Special Community Events & Workshops
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                    Guest speaker AMAs, hackathons, and deep architecture tear-downs.
                  </p>
                </div>

                <Link
                  href="/live/events"
                  className="text-xs font-bold text-[#FF6B35] hover:text-[#E85D2A] flex items-center gap-1 group"
                >
                  <span>View All Events</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
