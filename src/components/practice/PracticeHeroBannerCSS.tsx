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
  const [outputAccepted, setOutputAccepted] = useState(true);
  const [runtime, setRuntime] = useState(45);

  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTimeout(() => {
      setRuntime(Math.floor(Math.random() * 20) + 35);
      setOutputAccepted(true);
      setIsRunning(false);
    }, 700);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#E5E7EB]/90 bg-gradient-to-br from-[#FFFBF7] via-[#FFF9F2] to-[#FFF5EC] shadow-md select-none">
      {/* =========================================================================
          BACKGROUND SVG WAVES & AMBIENT GLOWS
          Matches the sweeping curves and vibrant orange/peach wave arcs
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft Ambient Radial Lighting */}
        <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-orange-400/15 via-amber-200/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-[#FF6B35]/10 blur-3xl" />

        {/* Top-Right Sweeping Orange Curved Wave Bands */}
        <svg
          className="absolute -top-10 -right-10 w-[600px] sm:w-[720px] lg:w-[820px] h-auto text-orange-400/25 transition-transform duration-700"
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="topWaveGrad1" x1="800" y1="0" x2="200" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA066" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#FF7A38" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFF5ED" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="topWaveGrad2" x1="800" y1="100" x2="350" y2="450" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3" />
              <stop offset="80%" stopColor="#FFA26B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFFDF9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M800 0 C640 60 520 180 440 320 C380 430 420 500 480 500 L800 500 Z"
            fill="url(#topWaveGrad1)"
          />
          <path
            d="M800 120 C680 180 580 270 540 380 C500 460 530 500 600 500 L800 500 Z"
            fill="url(#topWaveGrad2)"
          />
        </svg>

        {/* Bottom-Left Curved Orange Wave Arc */}
        <svg
          className="absolute -bottom-1 -left-1 w-64 sm:w-80 md:w-96 lg:w-[420px] h-auto"
          viewBox="0 0 420 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="botWaveGradMain" x1="0" y1="260" x2="380" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5514" />
              <stop offset="50%" stopColor="#FF7A38" />
              <stop offset="100%" stopColor="#FFA36B" />
            </linearGradient>
            <linearGradient id="botWaveGradInner" x1="0" y1="260" x2="300" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF854D" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFC299" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Subtle Outer Wave Glow */}
          <path
            d="M0 130 C90 140 180 160 260 200 C320 230 370 250 420 260 L0 260 Z"
            fill="url(#botWaveGradInner)"
          />
          {/* Main Vibrant Orange Sweeping Wave */}
          <path
            d="M0 165 C70 170 150 190 220 220 C280 245 320 255 380 260 L0 260 Z"
            fill="url(#botWaveGradMain)"
          />
        </svg>
      </div>

      {/* =========================================================================
          BANNER MAIN GRID:
          Left (7 cols): Typography, Badge, Pills
          Right (5 cols): Pure CSS 3D Laptop, Books, Mug, Plant & Floating Badges
          ========================================================================= */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center p-6 sm:p-8 lg:p-10 xl:p-12">
        {/* =====================================================================
            LEFT COLUMN: Pure Typography & Interactive Navigation Pills
            ===================================================================== */}
        <div className="lg:col-span-7 space-y-5 lg:pr-4">
          {/* Top Platform Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-[#FFF5EE] px-3.5 py-1.5 text-xs font-bold text-[#FF6B35] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B35] fill-orange-200" />
            <span>Elevate Practice Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] font-black text-[#172033] tracking-tight leading-[1.12]">
            Learn by doing. <br />
            <span className="text-[#FF6B35]">Master by practicing.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
            Sharpen your algorithmic thinking, build fullstack web components, query real relational databases, and debug production code with zero setup required.
          </p>

          {/* Quick Feature Pills */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 text-xs sm:text-sm font-semibold text-[#172033]">
            <Link
              href="/practice/codearena"
              title="Explore 1,200+ Coding Problems in CodeArena"
              className="group/pill inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-[#E5E7EB] shadow-xs hover:border-[#FF6B35]/40 hover:bg-orange-50/50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover/pill:scale-110 transition-transform" />
              <span>1,200+ Coding Problems</span>
            </Link>

            <a
              href="#tracks"
              title="Explore 5 Interactive Practice Tracks"
              className="group/pill inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-[#E5E7EB] shadow-xs hover:border-[#FF6B35]/40 hover:bg-orange-50/50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <Layers className="w-4 h-4 text-blue-600 group-hover/pill:scale-110 transition-transform" />
              <span>5 Interactive Tracks</span>
            </a>

            <Link
              href="/practice/cloudstudio"
              title="Launch CloudStudio with zero installation"
              className="group/pill inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-[#E5E7EB] shadow-xs hover:border-[#FF6B35]/40 hover:bg-orange-50/50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <Cpu className="w-4 h-4 text-amber-600 group-hover/pill:scale-110 transition-transform" />
              <span>Instant In-Browser Execution</span>
            </Link>
          </div>
        </div>

        {/* =====================================================================
            RIGHT COLUMN: Pure CSS 3D Scene
            - 3D Floating Badges (</>, {}, DB, Bug, Chart)
            - 3D Laptop with glowing interactive code screen and Run button
            - Elevate Coffee Mug
            - Stack of 4 Books (DSA, Web Dev, SQL, System Design)
            - Potted Green Succulent Plant
            ===================================================================== */}
        <div className="lg:col-span-5 relative w-full flex items-center justify-center min-h-[340px] sm:min-h-[380px] lg:min-h-[400px]">
          {/* Main 3D Container with slight perspective angle */}
          <div className="relative w-full max-w-[480px]">
            {/* -----------------------------------------------------------------
                5 FLOATING 3D ICON BADGES (Glows, Gradients & Bobbing CSS Animation)
                ----------------------------------------------------------------- */}
            {/* Badge 1 (Top Left): Code </> (Orange) */}
            <div 
              className="absolute -top-4 left-3 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-[#FF6B35] to-orange-600 shadow-lg shadow-orange-500/30 border-2 border-white/40 flex items-center justify-center text-white font-black text-sm sm:text-base hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
              title="Algorithmic Code Practice"
            >
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-xs" />
            </div>

            {/* Badge 2 (Middle Left): Braces {} (Purple) */}
            <div 
              className="absolute top-20 -left-3 sm:-left-4 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 border-2 border-white/40 flex items-center justify-center text-white font-black hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
              title="Modern Syntax & Frameworks"
            >
              <Braces className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-xs" />
            </div>

            {/* Badge 3 (Bottom Left): Database Cylinder (Blue) */}
            <div 
              className="absolute top-44 -left-2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 border-2 border-white/40 flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
              title="Relational SQL QueryMaster"
            >
              <Database className="w-5 h-5 drop-shadow-xs" />
            </div>

            {/* Badge 4 (Top Right): Bug Icon (Coral/Red) */}
            <div 
              className="absolute -top-3 right-6 sm:right-8 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-500/30 border-2 border-white/40 flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
              title="BugHunter Defect Fixing"
            >
              <Bug className="w-5 h-5 drop-shadow-xs" />
            </div>

            {/* Badge 5 (Middle Right): Bar Chart (Violet) */}
            <div 
              className="absolute top-28 -right-2 sm:-right-3 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 border-2 border-white/40 flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
              title="Runtime Performance Analysis"
            >
              <BarChart3 className="w-5 h-5 drop-shadow-xs" />
            </div>

            {/* -----------------------------------------------------------------
                THE 3D LAPTOP (Screen Bezel, Code Editor, Execution Card, Deck)
                ----------------------------------------------------------------- */}
            <div className="relative mx-auto w-[92%] sm:w-[94%] transition-transform duration-500 hover:scale-[1.01]">
              {/* Laptop Screen Bezel */}
              <div className="rounded-2xl border-4 border-[#252B3B] bg-[#161A26] shadow-2xl overflow-hidden relative">
                {/* Screen Top Bar */}
                <div className="h-6 bg-[#1F2433] border-b border-slate-700/60 px-3 flex items-center justify-between">
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

                {/* Screen Inner Split: Code Editor (Left) + Execution Card (Right) */}
                <div className="p-3.5 sm:p-4 grid grid-cols-12 gap-3 items-center min-h-[175px] sm:min-h-[190px]">
                  {/* Left: Interactive Code Workspace */}
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

                  {/* Right: Accepted Badge, Runtime Metrics & Interactive Run Code Button */}
                  <div className="col-span-5 bg-[#1F2537]/90 rounded-xl border border-slate-700/70 p-2.5 sm:p-3 shadow-inner flex flex-col justify-between h-full space-y-2">
                    {/* Status Pill */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        <span>Accepted</span>
                      </div>
                    </div>

                    {/* Metrics */}
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

                    {/* Run Code Button */}
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#FF6B35] hover:bg-[#E85D2A] active:scale-95 text-white font-bold text-[11px] shadow-md shadow-orange-500/30 transition-all cursor-pointer disabled:opacity-75"
                    >
                      <Play className={`w-3 h-3 fill-current ${isRunning ? "animate-spin" : ""}`} />
                      <span>{isRunning ? "Running..." : "Run Code"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Laptop Keyboard Deck (Aluminum Silver Gradient with center notch) */}
              <div className="h-3.5 sm:h-4 w-full bg-gradient-to-b from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] rounded-b-xl shadow-lg relative border-t border-slate-400/40">
                <div className="w-14 sm:w-16 h-1 bg-slate-500/50 rounded-b-sm mx-auto" />
              </div>
              {/* Laptop Drop Shadow */}
              <div className="absolute -bottom-3 inset-x-6 h-4 bg-slate-900/25 blur-md rounded-full pointer-events-none" />
            </div>

            {/* -----------------------------------------------------------------
                DESK ACCESSORIES:
                1. Elevate Ceramic Coffee Mug (bottom-left)
                2. Stack of 4 Books: DSA, Web Dev, SQL, System Design (bottom-right)
                3. Potted Succulent Plant (far right)
                ----------------------------------------------------------------- */}
            {/* 1. White Elevate Coffee Mug */}
            <div 
              className="absolute -bottom-3 left-1 sm:left-3 z-30 flex items-end hover:scale-105 transition-transform cursor-pointer"
              title="Fuel your daily problem-solving streak"
            >
              <div className="relative">
                {/* Handle */}
                <div className="absolute -left-2.5 top-2.5 w-3.5 h-6 rounded-l-full border-[3px] border-white shadow-xs" />
                {/* Cup Body */}
                <div className="w-10 sm:w-11 h-11 sm:h-12 rounded-b-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 border border-slate-300 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Top rim and coffee */}
                  <div className="absolute top-0 inset-x-0 h-2 bg-slate-200 rounded-full border-b border-slate-300 flex items-center justify-center">
                    <div className="w-6 h-1 rounded-full bg-[#4A2610]" />
                  </div>
                  {/* Elevate Logo Stamp */}
                  <div className="w-3.5 h-3.5 rounded bg-[#FF6B35] flex items-center justify-center mt-1 shadow-xs">
                    <span className="text-[8px] text-white font-black leading-none">▲</span>
                  </div>
                </div>
                {/* Mug Shadow */}
                <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-slate-900/20 blur-xs rounded-full pointer-events-none" />
              </div>
            </div>

            {/* 2. Stack of 4 Realistic Books (DSA, Web Dev, SQL, System Design) */}
            <div 
              className="absolute -bottom-2 right-8 sm:right-11 z-30 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
              title="Practice Tracks: DSA, Web Dev, SQL, System Design"
            >
              <a href="#tracks" className="flex flex-col items-center">
                {/* Book 1 (Top): DSA (Purple) */}
                <div className="w-22 sm:w-24 h-4 rounded-sm bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-[8.5px] font-bold text-white flex items-center px-2 shadow-xs border-b border-purple-800 relative -mb-0.5">
                  <span>DSA</span>
                  <div className="absolute right-0 top-0.5 bottom-0.5 w-1.5 bg-amber-50/90 rounded-r-xs border-l border-purple-900" />
                </div>

                {/* Book 2: Web Dev (Orange) */}
                <div className="w-24 sm:w-26 h-4.5 rounded-sm bg-gradient-to-r from-[#FF6B35] via-orange-500 to-amber-500 text-[8.5px] font-bold text-white flex items-center px-2 shadow-xs border-b border-orange-700 relative -mb-0.5">
                  <span>Web Dev</span>
                  <div className="absolute right-0 top-0.5 bottom-0.5 w-1.5 bg-amber-50/90 rounded-r-xs border-l border-orange-900" />
                </div>

                {/* Book 3: SQL (Blue) */}
                <div className="w-25 sm:w-27 h-4.5 rounded-sm bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 text-[8.5px] font-bold text-white flex items-center px-2 shadow-xs border-b border-blue-800 relative -mb-0.5">
                  <span>SQL</span>
                  <div className="absolute right-0 top-0.5 bottom-0.5 w-1.5 bg-amber-50/90 rounded-r-xs border-l border-blue-900" />
                </div>

                {/* Book 4 (Bottom): System Design (Emerald Green) */}
                <div className="w-26 sm:w-28 h-5 rounded-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-[8.5px] font-bold text-white flex items-center px-2 shadow-md border-b border-emerald-800 relative">
                  <span>System Design</span>
                  <div className="absolute right-0 top-0.5 bottom-0.5 w-2 bg-amber-50/90 rounded-r-xs border-l border-emerald-900" />
                </div>

                {/* Desk Shadow under books */}
                <div className="w-26 sm:w-28 h-2 bg-slate-900/20 blur-xs rounded-full mt-0.5 pointer-events-none" />
              </a>
            </div>

            {/* 3. Potted Green Succulent Plant */}
            <div 
              className="absolute -bottom-1 right-0 sm:right-1 z-30 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
              title="Healthy learning habits"
            >
              {/* Succulent Leaves */}
              <div className="relative w-8 h-8 -mb-1 flex items-center justify-center">
                <div className="absolute w-2.5 h-4.5 rounded-full bg-gradient-to-t from-emerald-700 to-emerald-400 rotate-[-28deg] -left-0.5 top-0.5 shadow-xs" />
                <div className="absolute w-3 h-5.5 rounded-full bg-gradient-to-t from-emerald-600 to-green-400 rotate-[0deg] top-0 shadow-xs" />
                <div className="absolute w-2.5 h-4.5 rounded-full bg-gradient-to-t from-emerald-700 to-emerald-400 rotate-[28deg] -right-0.5 top-0.5 shadow-xs" />
                <div className="absolute w-2 h-3.5 rounded-full bg-gradient-to-t from-emerald-500 to-lime-300 rotate-[-50deg] -left-1 bottom-1" />
                <div className="absolute w-2 h-3.5 rounded-full bg-gradient-to-t from-emerald-500 to-lime-300 rotate-[50deg] -right-1 bottom-1" />
              </div>
              {/* Ceramic Pot */}
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-b-xl bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-300 shadow-md relative overflow-hidden">
                <div className="w-full h-1.5 bg-slate-200 border-b border-slate-300" />
              </div>
              {/* Pot Shadow */}
              <div className="w-7 sm:w-8 h-1.5 bg-slate-900/15 blur-xs rounded-full mt-0.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
