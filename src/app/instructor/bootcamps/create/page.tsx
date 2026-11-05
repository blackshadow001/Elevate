"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BootcampSession } from "@/data/bootcamps";
import { liveService, sessionDateInput } from "@/services/liveService";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { 
  ArrowLeft, 
  Flame, 
  Calendar, 
  Plus, 
  Trash2, 
  Video, 
  FileCode, 
  Clock, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";

export default function CreateBootcampPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [title, setTitle] = useState("7-Day Full Stack Web Bootcamp");
  const [tagline, setTagline] = useState("Build & deploy 3 production applications from scratch with live mentorship");
  const [description, setDescription] = useState("Intensive sprint mastering full-stack architecture, React 19, Node.js and PostgreSQL.");

  const [sessions, setSessions] = useState<BootcampSession[]>([
    {
      dayNumber: 1,
      title: "Introduction & Development Environment",
      description: "Monorepo architecture, Docker containerization, ESLint & TypeScript configuration.",
      date: "Nov 12, 2026",
      time: "7:00 PM IST",
      duration: 90,
      status: "upcoming",
      assignmentTitle: "Setup Local Docker & Postgres Container",
      resourcesCount: 4,
    },
    {
      dayNumber: 2,
      title: "HTML & CSS Architecture",
      description: "Tailwind CSS design systems, container queries, accessible interactive components.",
      date: "Nov 13, 2026",
      time: "7:00 PM IST",
      duration: 90,
      status: "upcoming",
      assignmentTitle: "Build a Fully Accessible Component System",
      resourcesCount: 5,
    },
    {
      dayNumber: 3,
      title: "Modern JavaScript & TypeScript",
      description: "Async pipelines, generics, type guards, runtime validation with Zod.",
      date: "Nov 14, 2026",
      time: "7:00 PM IST",
      duration: 90,
      status: "upcoming",
      assignmentTitle: "Implement Type-Safe API Client with Zod",
      resourcesCount: 3,
    },
    {
      dayNumber: 4,
      title: "React 19 & Server Components",
      description: "RSC rendering lifecycle, server actions, useActionState, optimistic UI updates.",
      date: "Nov 15, 2026",
      time: "7:00 PM IST",
      duration: 105,
      status: "upcoming",
      assignmentTitle: "Project 1: Interactive Data Dashboard",
      resourcesCount: 6,
    },
    {
      dayNumber: 5,
      title: "Node.js Backend & Scalable APIs",
      description: "Express/Fastify microservices, connection pooling, middleware, JWT & OAuth2 auth.",
      date: "Nov 16, 2026",
      time: "7:00 PM IST",
      duration: 90,
      status: "upcoming",
      assignmentTitle: "Project 2: Authentication & Token Management Service",
      resourcesCount: 4,
    },
    {
      dayNumber: 6,
      title: "Database Engineering with PostgreSQL & Prisma",
      description: "Relational schema modeling, index optimization, query performance, transactions.",
      date: "Nov 17, 2026",
      time: "7:00 PM IST",
      duration: 90,
      status: "upcoming",
      assignmentTitle: "Database Indexing & Query Tuning Benchmark",
      resourcesCount: 3,
    },
    {
      dayNumber: 7,
      title: "Final Capstone Project: End-to-End Deployment",
      description: "Full-stack project review, AWS/Vercel deployment, Docker, monitoring, automated testing.",
      date: "Nov 18, 2026",
      time: "7:00 PM IST",
      duration: 120,
      status: "upcoming",
      assignmentTitle: "Project 3: Production LMS / E-Commerce Capstone",
      resourcesCount: 8,
    },
  ]);

  const handleAddDay = () => {
    const nextDay = sessions.length + 1;
    setSessions([
      ...sessions,
      {
        dayNumber: nextDay,
        title: `Day ${nextDay} Topic`,
        description: "Hands-on live session and architecture walkthrough.",
        date: "Upcoming",
        time: "7:00 PM IST",
        duration: 90,
        status: "upcoming",
        assignmentTitle: `Day ${nextDay} Project Assignment`,
        resourcesCount: 3,
      },
    ]);
  };

  const handleRemoveDay = (dayNum: number) => {
    if (sessions.length <= 1) return;
    const filtered = sessions
      .filter((s) => s.dayNumber !== dayNum)
      .map((s, idx) => ({ ...s, dayNumber: idx + 1 }));
    setSessions(filtered);
  };

  const handleSessionChange = (index: number, field: keyof BootcampSession, val: BootcampSession[keyof BootcampSession]) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: val };
    setSessions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;

    try {
    await liveService.createBootcamp({
      slug,
      title,
      tagline,
      description,
      dateRange: `${sessions[0]?.date || ""} – ${sessions[sessions.length - 1]?.date || ""}`,
      totalDays: sessions.length,
      liveSessionsCount: sessions.length,
      projectsCount: 3,
      enrolledLearners: 0,
      instructorName: "John Doe",
      instructorRole: "Senior Software Architect & Ex-Google",
      instructorAvatar: "/images/first-version/photo-1472099645785-5658abf4ff4e.jpg",
      coverImage: "/images/first-version/photo-1517694712202-14dd9538aa97.jpg",
      tags: ["Full Stack", "Cohort", "Live Mentorship"],
      userProgressPercent: 0,
      sessions,
    });

    notify({
      type: "success",
      title: "Bootcamp published",
      message: `"${title}" and its sessions were saved to the platform.`,
    });

    router.push("/instructor/bootcamps");
    } catch (error) {
      notify({ type: "error", title: "Could not publish bootcamp", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/instructor/bootcamps"
          className="p-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#172033]" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Create Cohort Bootcamp
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Set the cohort schedule and assignments. Recordings and resource storage require provider integration.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-7 space-y-4 shadow-sm">
          <h2 className="text-base font-extrabold text-[#172033]">General Information</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">Bootcamp Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">Tagline / Subheading</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1">Date Range (from sessions)</label>
                <input
                  type="text"
                  value={`${sessions[0]?.date || ""} – ${sessions[sessions.length - 1]?.date || ""}`}
                  readOnly
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1">Total Days</label>
                <input
                  type="number"
                  value={sessions.length}
                  readOnly
                  className="w-full bg-[#F1F5F9] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#64748B]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                required
              />
            </div>
          </div>
        </div>

        {/* Day-by-Day Curriculum Builder (Requirement 22) */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#172033]">
                Daily Curriculum & Live Sessions ({sessions.length} Days)
              </h2>
              <p className="text-xs text-[#64748B]">
                Configure live class, assignment, and resources for each day.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddDay}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 text-[#FF6B35] hover:bg-orange-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Day</span>
            </button>
          </div>

          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <div
                key={session.dayNumber}
                className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#172033] text-white text-xs font-extrabold">
                    Day {session.dayNumber}
                  </span>

                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(session.dayNumber)}
                      className="p-1.5 text-[#64748B] hover:text-red-500 cursor-pointer"
                      title="Remove Day"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Topic Title</label>
                    <input
                      type="text"
                      value={session.title}
                      onChange={(e) => handleSessionChange(idx, "title", e.target.value)}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Assignment Title</label>
                    <input
                      type="text"
                      value={session.assignmentTitle || ""}
                      onChange={(e) => handleSessionChange(idx, "assignmentTitle", e.target.value)}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Time (e.g. 7:00 PM)</label>
                    <input
                      type="text"
                      value={session.time}
                      onChange={(e) => handleSessionChange(idx, "time", e.target.value)}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      value={session.duration}
                      onChange={(e) => handleSessionChange(idx, "duration", Number(e.target.value))}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#172033]"
                    />
                  </div>

                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1">Session date</label>
                  <input type="date" required value={sessionDateInput(session.date)}
                    onChange={(e) => handleSessionChange(idx, "date", e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#172033]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/instructor/bootcamps"
            className="px-5 py-3 rounded-2xl border border-[#E5E7EB] text-xs font-bold text-[#172033] hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-7 py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
          >
            Publish Bootcamp
          </button>
        </div>
      </form>
    </div>
  );
}
