"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Play, 
  Check, 
  Bug, 
  Database, 
  BarChart3, 
  Code2, 
  Braces 
} from "lucide-react";

export function PracticeHeroBannerCSS() {
  const [isRunning, setIsRunning] = useState(false);
  const [runtime, setRuntime] = useState(45);

  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTimeout(() => {
      setRuntime(Math.floor(Math.random() * 20) + 35);
      setIsRunning(false);
    }, 700);
  };

  return (
    <section className="relative w-full overflow-hidden border-b border-[#E5E7EB]/80 bg-gradient-to-br from-[#FFFDF9] via-[#FFF8F0] via-60%-[#FFF1E4] to-[#FFE8D6] py-10 sm:py-14 lg:py-18 select-none">
      {/* =========================================================================
          BACKGROUND SVG WAVES (FULL-HEIGHT, FULL-WIDTH, NO HALFWAY CUTOFFS)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Continuous Soft Right-Side Wash */}
        <div className="absolute top-0 right-0 w-3/5 h-full bg-gradient-to-l from-orange-200/30 via-orange-100/15 to-transparent pointer-events-none" />

        {/* Top-Right & Right-Side Flowing Orange Curved Waves (Full height coverage) */}
        <svg
          className="absolute top-0 right-0 w-[58%] max-w-[920px] min-w-[420px] h-full pointer-events-none select-none"
          viewBox="0 0 920 560"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="trWave1" x1="920" y1="0" x2="250" y2="560" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA36B" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#FF7A38" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFF5ED" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trWave2" x1="920" y1="80" x2="380" y2="560" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#FFA873" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FFF9F2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trWave3" x1="920" y1="180" x2="520" y2="560" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5514" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFAE7B" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* Outer sweeping arc */}
          <path
            d="M 920,0 C 720,60 540,180 440,340 C 350,470 390,560 480,560 L 920,560 Z"
            fill="url(#trWave1)"
          />
          {/* Middle vibrant arc */}
          <path
            d="M 920,80 C 760,140 620,260 560,400 C 510,490 550,560 640,560 L 920,560 Z"
            fill="url(#trWave2)"
          />
          {/* Inner corner arc */}
          <path
            d="M 920,200 C 820,260 720,370 690,460 C 670,520 700,560 780,560 L 920,560 Z"
            fill="url(#trWave3)"
          />
        </svg>

        {/* Bottom-Left Organic Sweeping Orange Wave (Pinned directly to bottom-0 left-0) */}
        <svg
          className="absolute bottom-0 left-0 w-64 sm:w-80 md:w-96 lg:w-[480px] h-auto pointer-events-none select-none"
          viewBox="0 0 480 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="blWaveMain" x1="0" y1="200" x2="480" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5514" />
              <stop offset="50%" stopColor="#FF7A38" />
              <stop offset="100%" stopColor="#FFA670" />
            </linearGradient>
            <linearGradient id="blWaveGlow" x1="0" y1="200" x2="380" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA670" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFC8A3" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Subtle outer aura */}
          <path
            d="M 0,90 Q 160,80 300,140 T 480,200 L 0,200 Z"
            fill="url(#blWaveGlow)"
          />
          {/* Main crisp sweeping wave */}
          <path
            d="M 0,120 Q 140,110 260,160 T 420,200 L 0,200 Z"
            fill="url(#blWaveMain)"
          />
        </svg>
      </div>

      {/* =========================================================================
          CONTENT CONTAINER: Centered Grid within Max Width
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* =====================================================================
              LEFT COLUMN (7 cols): Typography, Pill, Feature Controls (Single Line)
              ===================================================================== */}
          <div className="lg:col-span-7 space-y-5 lg:pr-2">
            {/* Top Platform Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-[#FFF5EE] px-4 py-1.5 text-xs font-bold text-[#FF6B35] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B35] fill-orange-200" />
              <span>Elevate Practice Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[54px] font-black text-[#172033] tracking-tight leading-[1.12]">
              Learn by doing. <br />
              <span className="text-[#FF6B35]">Master by practicing.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
              Sharpen your algorithmic thinking, build fullstack web components, query real relational databases, and debug production code with zero setup required.
            </p>

            {/* Quick Feature Pills (Single horizontal row on desktop, wrapping gracefully on mobile) */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 sm:gap-3 pt-2 text-xs sm:text-sm font-semibold text-[#172033]">
              <Link
                href="/practice/codearena"
                title="Explore 1,200+ Coding Problems in CodeArena"
                className="group/pill inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-[#E5E7EB] shadow-xs hover:border-[#FF6B35]/40 hover:bg-orange-50/50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover/pill:scale-110 transition-transform shrink-0" />
                <span>1,200+ Coding Problems</span>
              </Link>

              <a
                href="#tracks"
                title="Explore 5 Interactive Practice Tracks"
                className="group/pill inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-[#E5E7EB] shadow-xs hover:border-[#FF6B35]/40 hover:bg-orange-50/50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap"
              >
                <Layers className="w-4 h-4 text-blue-600 group-hover/pill:scale-110 transition-transform shrink-0" />
                <span>5 Interactive Tracks</span>
              </a>

              <Link
                href="/practice/cloudstudio"
                title="Launch CloudStudio with zero installation"
                className="group/pill inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-[#E5E7EB] shadow-xs hover:border-[#FF6B35]/40 hover:bg-orange-50/50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap"
              >
                <Cpu className="w-4 h-4 text-amber-600 group-hover/pill:scale-110 transition-transform shrink-0" />
                <span>Instant In-Browser Execution</span>
              </Link>
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN (5 cols): Pure CSS 3D Scene
              ===================================================================== */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]">
            {/* Main 3D Container */}
            <div className="relative w-full max-w-[490px]">
              {/* -----------------------------------------------------------------
                  5 FLOATING 3D ICON BADGES
                  ----------------------------------------------------------------- */}
              {/* Badge 1 (Top Left): Code </> */}
              <div 
                className="absolute -top-5 left-2 sm:left-4 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-[#FF6B35] to-orange-600 shadow-xl shadow-orange-500/35 border-2 border-white/50 flex items-center justify-center text-white font-black text-sm sm:text-base hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
                title="Algorithmic Code Practice"
              >
                <Code2 className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-xs" />
              </div>

              {/* Badge 2 (Middle Left): Braces {} */}
              <div 
                className="absolute top-20 -left-4 sm:-left-5 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/35 border-2 border-white/50 flex items-center justify-center text-white font-black hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
                title="Modern Syntax & Frameworks"
              >
                <Braces className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-xs" />
              </div>

              {/* Badge 3 (Bottom Left): Database Cylinder */}
              <div 
                className="absolute top-44 -left-3 sm:-left-3 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-500/35 border-2 border-white/50 flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
                title="Relational SQL QueryMaster"
              >
                <Database className="w-5 h-5 drop-shadow-xs" />
              </div>

              {/* Badge 4 (Top Right): Bug Icon */}
              <div 
                className="absolute -top-4 right-5 sm:right-7 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 shadow-xl shadow-rose-500/35 border-2 border-white/50 flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
                title="BugHunter Defect Fixing"
              >
                <Bug className="w-5 h-5 drop-shadow-xs" />
              </div>

              {/* Badge 5 (Middle Right): Bar Chart */}
              <div 
                className="absolute top-28 -right-3 sm:-right-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/35 border-2 border-white/50 flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
                title="Runtime Performance Analysis"
              >
                <BarChart3 className="w-5 h-5 drop-shadow-xs" />
              </div>

              {/* -----------------------------------------------------------------
                  THE 3D LAPTOP
                  ----------------------------------------------------------------- */}
              <div className="relative mx-auto w-[92%] sm:w-[95%] transition-transform duration-500 hover:scale-[1.01]">
                {/* Screen Bezel */}
                <div className="rounded-2xl border-4 border-[#222838] bg-[#141824] shadow-2xl overflow-hidden relative">
                  {/* Screen Top Bar */}
                  <div className="h-6 bg-[#1C2130] border-b border-slate-700/60 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 tracking-wide">
                      <span className="text-[#FF6B35]">▲ Elevate</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">Practice</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                  </div>

                  {/* Code + Execution Split */}
                  <div className="p-3.5 sm:p-4 grid grid-cols-12 gap-3 items-center min-h-[175px] sm:min-h-[190px]">
                    {/* Left: Code Workspace */}
                    <div className="col-span-7 font-mono text-[10.5px] sm:text-xs leading-[1.6] text-slate-300">
                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-600 select-none text-right w-3">1</span>
                        <div>
                          <span className="text-[#F43F5E] font-bold">function</span>{" "}
                          <span className="text-[#60A5FA] font-bold">solve</span>() &#123;
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-600 select-none text-right w-3">2</span>
                        <div className="pl-3">
                          <span className="text-[#C084FC]">const</span>{" "}
                          <span className="text-[#38BDF8]">n</span> ={" "}
                          <span className="text-[#FBBF24]">readInt</span>();
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-600 select-none text-right w-3">3</span>
                        <div className="pl-3">
                          <span className="text-[#F43F5E]">return</span> n * n;
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-600 select-none text-right w-3">4</span>
                        <div>&#125;</div>
                      </div>
                      <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1.5 font-sans">
                        <span className="text-emerald-400 font-bold">✔</span>
                        <span>O(1) in-browser execution</span>
                      </div>
                    </div>

                    {/* Right: Output Card */}
                    <div className="col-span-5 bg-[#1B2133]/95 rounded-xl border border-slate-700/70 p-2.5 sm:p-3 shadow-inner flex flex-col justify-between h-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 shadow-xs">
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                          <span>Accepted</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-[10px] sm:text-[11px] text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Runtime:</span>
                          <span className="text-emerald-400 font-semibold">{runtime} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Memory:</span>
                          <span className="text-slate-200">12.4 MB</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#FF6B35] hover:bg-[#E85D2A] active:scale-95 text-white font-bold text-[11px] shadow-md shadow-orange-500/35 transition-all cursor-pointer disabled:opacity-75"
                      >
                        <Play className={`w-3 h-3 fill-current ${isRunning ? "animate-spin" : ""}`} />
                        <span>{isRunning ? "Running..." : "Run Code"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Laptop Deck */}
                <div className="h-3.5 sm:h-4 w-full bg-gradient-to-b from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] rounded-b-xl shadow-lg relative border-t border-slate-400/40">
                  <div className="w-14 sm:w-16 h-1 bg-slate-500/50 rounded-b-sm mx-auto" />
                </div>
                {/* Shadow */}
                <div className="absolute -bottom-3 inset-x-6 h-4 bg-slate-900/25 blur-md rounded-full pointer-events-none" />
              </div>

              {/* -----------------------------------------------------------------
                  DESK ACCESSORIES
                  ----------------------------------------------------------------- */}
              {/* 1. White Elevate Coffee Mug */}
              <div 
                className="absolute -bottom-3 left-1 sm:left-3 z-30 flex items-end hover:scale-105 transition-transform cursor-pointer"
                title="Fuel your daily problem-solving streak"
              >
                <div className="relative">
                  <div className="absolute -left-2.5 top-2.5 w-3.5 h-6 rounded-l-full border-[3px] border-white shadow-xs" />
                  <div className="w-10 sm:w-11 h-11 sm:h-12 rounded-b-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 border border-slate-300 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-slate-200 rounded-full border-b border-slate-300 flex items-center justify-center">
                      <div className="w-6 h-1 rounded-full bg-[#4A2610]" />
                    </div>
                    <div className="w-3.5 h-3.5 rounded bg-[#FF6B35] flex items-center justify-center mt-1 shadow-xs">
                      <span className="text-[8px] text-white font-black leading-none">▲</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-slate-900/20 blur-xs rounded-full pointer-events-none" />
                </div>
              </div>

              {/* 2. Stack of 4 Realistic Books */}
              <div 
                className="absolute -bottom-2 right-8 sm:right-11 z-30 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
                title="Practice Tracks: DSA, Web Dev, SQL, System Design"
              >
                <a href="#tracks" className="flex flex-col items-center">
                  <div className="w-22 sm:w-24 h-4 rounded-sm bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-[8.5px] font-bold text-white flex items-center px-2 shadow-xs border-b border-purple-800 relative -mb-0.5">
                    <span>DSA</span>
                    <div className="absolute right-0 top-0.5 bottom-0.5 w-1.5 bg-amber-50/90 rounded-r-xs border-l border-purple-900" />
                  </div>

                  <div className="w-24 sm:w-26 h-4.5 rounded-sm bg-gradient-to-r from-[#FF6B35] via-orange-500 to-amber-500 text-[8.5px] font-bold text-white flex items-center px-2 shadow-xs border-b border-orange-700 relative -mb-0.5">
                    <span>Web Dev</span>
                    <div className="absolute right-0 top-0.5 bottom-0.5 w-1.5 bg-amber-50/90 rounded-r-xs border-l border-orange-900" />
                  </div>

                  <div className="w-25 sm:w-27 h-4.5 rounded-sm bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 text-[8.5px] font-bold text-white flex items-center px-2 shadow-xs border-b border-blue-800 relative -mb-0.5">
                    <span>SQL</span>
                    <div className="absolute right-0 top-0.5 bottom-0.5 w-1.5 bg-amber-50/90 rounded-r-xs border-l border-blue-900" />
                  </div>

                  <div className="w-26 sm:w-28 h-5 rounded-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-[8.5px] font-bold text-white flex items-center px-2 shadow-md border-b border-emerald-800 relative">
                    <span>System Design</span>
                    <div className="absolute right-0 top-0.5 bottom-0.5 w-2 bg-amber-50/90 rounded-r-xs border-l border-emerald-900" />
                  </div>

                  <div className="w-26 sm:w-28 h-2 bg-slate-900/20 blur-xs rounded-full mt-0.5 pointer-events-none" />
                </a>
              </div>

              {/* 3. Potted Green Succulent Plant */}
              <div 
                className="absolute -bottom-1 right-0 sm:right-1 z-30 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
                title="Healthy learning habits"
              >
                <div className="relative w-8 h-8 -mb-1 flex items-center justify-center">
                  <div className="absolute w-2.5 h-4.5 rounded-full bg-gradient-to-t from-emerald-700 to-emerald-400 rotate-[-28deg] -left-0.5 top-0.5 shadow-xs" />
                  <div className="absolute w-3 h-5.5 rounded-full bg-gradient-to-t from-emerald-600 to-green-400 rotate-[0deg] top-0 shadow-xs" />
                  <div className="absolute w-2.5 h-4.5 rounded-full bg-gradient-to-t from-emerald-700 to-emerald-400 rotate-[28deg] -right-0.5 top-0.5 shadow-xs" />
                  <div className="absolute w-2.5 h-3.5 rounded-full bg-gradient-to-t from-emerald-500 to-lime-300 rotate-[-50deg] -left-1 bottom-1" />
                  <div className="absolute w-2.5 h-3.5 rounded-full bg-gradient-to-t from-emerald-500 to-lime-300 rotate-[50deg] -right-1 bottom-1" />
                </div>
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-b-xl bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-300 shadow-md relative overflow-hidden">
                  <div className="w-full h-1.5 bg-slate-200 border-b border-slate-300" />
                </div>
                <div className="w-7 sm:w-8 h-1.5 bg-slate-900/15 blur-xs rounded-full mt-0.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
