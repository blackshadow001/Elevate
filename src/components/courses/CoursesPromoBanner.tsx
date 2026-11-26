"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Flame,
  Gift,
  BadgeCheck,
  Terminal,
} from "lucide-react";

interface CoursesPromoBannerProps {
  totalCoursesCount: number;
  onSelectCategory?: (categoryName: string) => void;
}

const SLIDE_LABELS = [
  "Elevate Personal Pass",
  "Master Python and Applied AI",
  "Interactive Practice Arenas",
];

export function CoursesPromoBanner({
  totalCoursesCount,
  onSelectCategory,
}: CoursesPromoBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = 3;

  useEffect(() => {
    if (isPaused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % slideCount);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured Elevate promotions and tracks"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="mb-10"
    >
      <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] shadow-sm">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {/* Slide 1: Champagne Gold Personal Pass Banner */}
          <div
            role="group"
            aria-roledescription="slide"
            aria-label="1 of 3"
            className="relative w-full shrink-0 overflow-hidden bg-gradient-to-r from-[#FFFDF7] via-[#FDF5E4] to-[#F3DEC0] px-6 py-8 sm:px-10 sm:py-10"
          >
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="max-w-xl space-y-4">
                <p className="text-sm sm:text-base font-bold text-[#6E4514]">
                  Upgrade Your Engineering &amp; Career Skills!
                </p>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#2A1905] leading-tight">
                  {totalCoursesCount}+ Live Tracks. One Personal Pass.
                </h2>

                <div className="inline-flex flex-wrap items-center divide-x divide-[#D9B886] rounded-xl border border-[#E2C28F] bg-white/75 backdrop-blur-xs text-xs sm:text-sm text-[#4A2C0A]">
                  <span className="px-3.5 py-2 font-extrabold">
                    Unlimited{" "}
                    <span className="font-medium text-[#7B5222]">
                      Plan Access
                    </span>
                  </span>
                  <span className="px-3.5 py-2 font-extrabold">
                    5 Live{" "}
                    <span className="font-medium text-[#7B5222]">
                      Practice Labs
                    </span>
                  </span>
                  <span className="px-3.5 py-2 font-extrabold">
                    Verified{" "}
                    <span className="font-medium text-[#7B5222]">
                      Certificates
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Link
                    href="/personal-plan"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#15803D]"
                  >
                    <span>Explore Your Personal Pass</span>
                  </Link>
                  <span className="text-xs sm:text-sm font-bold text-[#4A2C0A]">
                    Monthly &amp; Annual plans available
                  </span>
                </div>
              </div>

              {/* Right Side Gold Pass Showcase Artwork */}
              <div className="relative flex shrink-0 flex-col items-end">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-[#172033] px-3 py-1.5 text-xs font-bold text-[#FCD34D] shadow-xs">
                  <Gift className="h-3.5 w-3.5 text-[#FF6B35]" aria-hidden="true" />
                  <span>All-Access Pass</span>
                </span>
                <div className="relative flex h-40 w-64 sm:h-44 sm:w-72 items-center justify-center rounded-2xl border border-[#F59E0B]/40 bg-gradient-to-br from-[#1B1F2E] via-[#262118] to-[#0F131E] p-5 text-white shadow-[0_20px_45px_rgba(180,115,20,0.28)]">
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-[#F59E0B]/20 via-transparent to-[#FCD34D]/25 pointer-events-none" />
                  <div className="relative w-full rounded-xl border border-[#FCD34D]/50 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] p-4 text-[#1E1405] shadow-inner">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Elevate</span>
                      <span>Verified</span>
                    </div>
                    <p className="mt-1 text-xl font-black tracking-tight">
                      PERSONAL PASS
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold opacity-90">
                      Courses · Practice · Certificates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Dark Obsidian Applied AI & Python Track Banner */}
          <div
            role="group"
            aria-roledescription="slide"
            aria-label="2 of 3"
            className="relative w-full shrink-0 overflow-hidden bg-gradient-to-r from-[#090807] via-[#1C140A] to-[#2B1B08] px-6 py-8 text-white sm:px-10 sm:py-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#F59E0B]/20 blur-3xl"
            />
            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="max-w-xl space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Featured Specialization</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Master Python &amp; Applied AI
                </h2>
                <p className="text-sm sm:text-base text-amber-100/80">
                  Build production LLM retrieval agents, FastAPI services, and clean algorithms from scratch.
                </p>

                <div className="flex flex-wrap gap-2.5 text-xs font-semibold">
                  {[
                    "Hands-On Projects",
                    "AI-Assisted Development",
                    "Certification Included",
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200"
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{chip}</span>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectCategory?.("AI & Generative AI")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#15803D]"
                  >
                    <span>Explore AI Track</span>
                  </button>
                  <Link
                    href="/blog/python-interview-questions"
                    className="text-xs sm:text-sm font-bold text-amber-300 hover:underline"
                  >
                    Read Top 25 Python Questions →
                  </Link>
                </div>
              </div>

              {/* Right Dark Spotlight Visual */}
              <div className="relative flex shrink-0 flex-col items-end">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-black/60 px-3 py-1.5 text-xs font-bold text-amber-300">
                  <Flame className="h-3.5 w-3.5 text-[#FF6B35]" aria-hidden="true" />
                  <span>4.8+ Avg Learner Rating</span>
                </span>
                <div className="relative flex h-40 w-64 sm:h-44 sm:w-72 items-center justify-center rounded-2xl border border-amber-500/35 bg-gradient-to-br from-[#2B1C06] to-[#120D05] shadow-[0_0_45px_rgba(245,158,11,0.22)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-400 to-orange-500 text-[#172033] shadow-lg">
                      <Code2 className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-black uppercase tracking-widest text-amber-300">
                        AI + Code
                      </p>
                      <p className="text-lg font-black text-white">
                        Real Projects
                      </p>
                      <p className="text-[11px] text-amber-100/70">
                        RAG · Python · SQL
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Deep Navy Interactive Practice Hub Banner */}
          <div
            role="group"
            aria-roledescription="slide"
            aria-label="3 of 3"
            className="relative w-full shrink-0 overflow-hidden bg-gradient-to-r from-[#172033] via-[#1E2B45] to-[#111929] px-6 py-8 text-white sm:px-10 sm:py-10"
          >
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="max-w-xl space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF6B35]/35 bg-[#FF6B35]/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#FF8A5B]">
                  <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>5 Browser Practice Environments</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  1,150+ Coding &amp; SQL Drills. Zero Setup.
                </h2>
                <p className="text-sm sm:text-base text-slate-300">
                  Run algorithms in CodeArena, live relational SQL queries in QueryMaster, DOM UI tests in WebForge, and debugging rounds in BugHunter.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#E85A2A]"
                  >
                    <span>Start Practicing Free</span>
                  </Link>
                  <Link
                    href="/practice/codearena"
                    className="text-xs sm:text-sm font-bold text-slate-200 hover:text-[#FF8A5B]"
                  >
                    Try Daily Challenge →
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 shrink-0 w-full max-w-xs">
                {[
                  { name: "CodeArena", tag: "100 DSA Levels" },
                  { name: "QueryMaster", tag: "Live SQL Engine" },
                  { name: "WebForge", tag: "UI Validation" },
                  { name: "BugHunter", tag: "Defect Triage" },
                ].map((env) => (
                  <div
                    key={env.name}
                    className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs"
                  >
                    <p className="text-xs font-extrabold text-white">
                      {env.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#FF8A5B]">
                      {env.tag}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls: <  ━━ · ·  > matching GUVI reference */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous promotional banner"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#172033] shadow-2xs transition-colors hover:border-[#172033] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <nav aria-label="Choose promotional slide" className="flex items-center gap-1.5">
          {SLIDE_LABELS.map((label, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show slide ${idx + 1}: ${label}`}
                aria-current={active ? "true" : undefined}
                className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] ${
                  active
                    ? "w-7 bg-[#172033]"
                    : "w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]"
                }`}
              />
            );
          })}
        </nav>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next promotional banner"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#172033] shadow-2xs transition-colors hover:border-[#172033] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing slide {activeIndex + 1} of {slideCount}: {SLIDE_LABELS[activeIndex]}
      </p>
    </section>
  );
}
