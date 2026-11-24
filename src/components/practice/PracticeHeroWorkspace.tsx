"use client";

import { useState } from "react";
import { 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Check, 
  Database, 
  Bug, 
  BarChart3, 
  Code2, 
  Braces,
  Cpu,
  Layers
} from "lucide-react";

export function PracticeHeroWorkspace() {
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(1);
  const [runtime, setRuntime] = useState(45);

  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setRunCount(prev => prev + 1);
      setRuntime(Math.floor(40 + Math.random() * 15));
    }, 450);
  };

  return (
    <div className="relative w-full max-w-[580px] mx-auto select-none py-6 sm:py-8">
      {/* Background Soft Glow & Radial Arcs */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-80 h-80 rounded-full bg-gradient-to-br from-orange-300/25 via-amber-200/20 to-transparent blur-3xl -z-10" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-[#FF6B35]/15 via-orange-100/30 to-transparent blur-2xl -z-10" />

      {/* Floating 3D Badge 1: </> (Top Left) */}
      <div className="absolute -top-3 left-2 sm:-left-4 z-20 animate-float-slow">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 border border-white/40 transform -rotate-6 hover:rotate-0 transition-transform">
          <Code2 className="w-7 h-7 drop-shadow-sm stroke-[2.5]" />
        </div>
      </div>

      {/* Floating 3D Badge 2: {} (Mid Left) */}
      <div className="absolute top-22 -left-6 sm:-left-8 z-20 animate-float-medium">
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-white/40 transform rotate-6 hover:rotate-0 transition-transform">
          <Braces className="w-6 h-6 drop-shadow-sm stroke-[2.5]" />
        </div>
      </div>

      {/* Floating 3D Badge 3: Database (Bottom Left) */}
      <div className="absolute bottom-16 -left-3 sm:-left-5 z-20 animate-float-fast">
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border border-white/40 transform -rotate-3 hover:rotate-0 transition-transform">
          <Database className="w-6 h-6 drop-shadow-sm stroke-[2.2]" />
        </div>
      </div>

      {/* Floating 3D Badge 4: Bug (Top Right) */}
      <div className="absolute -top-2 right-4 sm:-right-2 z-20 animate-float-medium">
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-rose-400 via-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 border border-white/40 transform rotate-12 hover:rotate-0 transition-transform">
          <Bug className="w-6 h-6 drop-shadow-sm stroke-[2.2]" />
        </div>
      </div>

      {/* Floating 3D Badge 5: Analytics / BarChart (Mid Right) */}
      <div className="absolute top-26 -right-5 sm:-right-7 z-20 animate-float-slow">
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border border-white/40 transform -rotate-8 hover:rotate-0 transition-transform">
          <BarChart3 className="w-6 h-6 drop-shadow-sm stroke-[2.2]" />
        </div>
      </div>

      {/* 3D Isometric Laptop Wrapper */}
      <div 
        className="relative z-10 transition-transform duration-500 ease-out hover:scale-[1.01]"
        style={{
          perspective: "1200px",
        }}
      >
        {/* Laptop Display Screen */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl bg-[#090D16] p-2.5 sm:p-3 border-2 border-slate-700/80 shadow-2xl shadow-slate-900/40"
          style={{
            transform: "rotateY(-5deg) rotateX(3deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Webcam Pinhole */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-700" />

          {/* Screen Inner Bezel */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden flex flex-col shadow-inner">
            {/* Laptop Screen Top Header */}
            <div className="px-3 py-2 bg-[#1E293B]/90 border-b border-slate-800/80 flex items-center justify-between">
              {/* Traffic Lights */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              </div>

              {/* Center Branding Pill */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-white">
                  <span className="text-[#FF6B35]">▲</span>
                  <span>Elevate</span>
                </div>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Practice
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Active</span>
              </div>
            </div>

            {/* Laptop Code & Output Body (Split View) */}
            <div className="p-3 sm:p-4 grid grid-cols-12 gap-3 sm:gap-4 items-stretch bg-[#0F172A] min-h-[220px] sm:min-h-[240px]">
              {/* Left Code Editor Pane (7 cols) */}
              <div className="col-span-7 font-mono text-[11px] sm:text-xs leading-relaxed flex">
                {/* Line Numbers */}
                <div className="select-none text-right pr-2 text-slate-600 border-r border-slate-800/80 space-y-1 font-mono text-[10px] sm:text-[11px]">
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                  <div>4</div>
                  <div>5</div>
                  <div>6</div>
                  <div>7</div>
                  <div>8</div>
                </div>

                {/* Code Content */}
                <div className="pl-3 space-y-1 text-slate-200">
                  <div>
                    <span className="text-purple-400 font-semibold">function</span>{" "}
                    <span className="text-amber-300 font-bold">solve</span>() &#123;
                  </div>
                  <div className="pl-3">
                    <span className="text-cyan-400 font-semibold">const</span> n ={" "}
                    <span className="text-blue-400">readInt</span>();
                  </div>
                  <div className="pl-3">
                    <span className="text-purple-400 font-semibold">return</span> n * n;
                  </div>
                  <div>&#125;</div>
                  <div className="text-slate-600 text-[10px] sm:text-[11px] pt-1">
                    &#47;&#47; O(1) runtime execution
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 pt-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Passing all test cases</span>
                  </div>
                </div>
              </div>

              {/* Right Output / Execution Card (5 cols) */}
              <div className="col-span-5 bg-[#1E293B]/70 border border-slate-700/60 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  {/* Accepted Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] sm:text-xs font-bold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Accepted</span>
                  </div>

                  {/* Runtime & Memory Metrics */}
                  <div className="space-y-1 text-[10px] sm:text-[11px] font-mono text-slate-300 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Runtime:</span>
                      <span className="font-semibold text-white">{runtime} ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Memory:</span>
                      <span className="font-semibold text-white">12.4 MB</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Run Code Button */}
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="w-full mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-orange-500 hover:to-orange-600 active:scale-95 shadow-md shadow-orange-500/30 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isRunning ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{isRunning ? "Testing..." : "Run Code"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Keyboard Base / Aluminum Chin */}
        <div 
          className="relative -mt-1 mx-auto w-[94%] h-4 sm:h-5 rounded-b-2xl bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-x-2 border-b-2 border-slate-600/60 shadow-xl"
          style={{
            transform: "rotateY(-5deg) rotateX(3deg)",
          }}
        >
          {/* Thumb Opening Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-slate-500/60" />
        </div>
      </div>

      {/* Desk Props & Accessories Layer (Foreground Props in CSS) */}
      <div className="relative mt-2 sm:mt-3 px-2 flex items-end justify-between z-20">
        {/* Left Accessory: Elevate Mug */}
        <div className="flex items-end gap-2 transform -translate-y-2 sm:-translate-y-4">
          <div className="relative group">
            {/* Steam animation */}
            <div className="absolute -top-3 left-3 w-2 h-3 border-l-2 border-dashed border-orange-300/60 rounded-full animate-pulse opacity-70" />
            <div className="w-11 h-12 sm:w-13 sm:h-14 rounded-b-2xl rounded-t-sm bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/90 shadow-md flex flex-col items-center justify-center p-1 relative">
              {/* Handle */}
              <div className="absolute top-2 -left-2.5 w-3.5 h-7 rounded-l-full border-2 border-slate-300 bg-transparent" />
              {/* Elevate Logo Stamp */}
              <span className="text-[#FF6B35] font-black text-xs sm:text-sm drop-shadow-xs">▲</span>
              <span className="text-[8px] font-bold text-slate-700 tracking-tighter">Elevate</span>
            </div>
          </div>
        </div>

        {/* Right Accessories: Stack of 4 Books + Succulent Plant */}
        <div className="flex items-end gap-3 sm:gap-4 transform -translate-y-1 sm:-translate-y-3">
          {/* Stack of 4 Books */}
          <div className="flex flex-col items-end shadow-lg rounded-md">
            {/* Book 1 (Top): DSA */}
            <div className="h-4 sm:h-5 w-24 sm:w-28 rounded-sm bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-700/60 flex items-center justify-between px-2 text-[9px] sm:text-[10px] font-extrabold text-white shadow-xs">
              <span>DSA</span>
              <span className="text-[8px] opacity-70">Algorithms</span>
            </div>
            {/* Book 2: Web Dev */}
            <div className="h-4 sm:h-5 w-26 sm:w-30 rounded-sm bg-gradient-to-r from-[#FF6B35] to-orange-500 border border-orange-600/60 flex items-center justify-between px-2 text-[9px] sm:text-[10px] font-extrabold text-white shadow-xs">
              <span>Web Dev</span>
              <span className="text-[8px] opacity-70">Fullstack</span>
            </div>
            {/* Book 3: SQL */}
            <div className="h-4 sm:h-5 w-28 sm:w-32 rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-700/60 flex items-center justify-between px-2 text-[9px] sm:text-[10px] font-extrabold text-white shadow-xs">
              <span>SQL</span>
              <span className="text-[8px] opacity-70">Database</span>
            </div>
            {/* Book 4 (Bottom): System Design */}
            <div className="h-4 sm:h-5 w-30 sm:w-34 rounded-sm bg-gradient-to-r from-emerald-600 to-teal-700 border border-emerald-700/60 flex items-center justify-between px-2 text-[9px] sm:text-[10px] font-extrabold text-white shadow-xs">
              <span>System Design</span>
              <span className="text-[8px] opacity-70">Scale</span>
            </div>
          </div>

          {/* Succulent Plant in Ceramic Pot */}
          <div className="flex flex-col items-center">
            {/* Leaves */}
            <div className="relative w-8 h-7 flex items-center justify-center">
              <span className="absolute top-0 w-3 h-4 bg-emerald-500 rounded-full rotate-0" />
              <span className="absolute top-1 left-0.5 w-3.5 h-4 bg-emerald-600 rounded-full -rotate-45" />
              <span className="absolute top-1 right-0.5 w-3.5 h-4 bg-emerald-600 rounded-full rotate-45" />
              <span className="absolute bottom-0 w-2.5 h-3 bg-emerald-400 rounded-full" />
            </div>
            {/* White Pot */}
            <div className="w-8 h-8 rounded-b-xl rounded-t-xs bg-white border border-slate-200 shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
