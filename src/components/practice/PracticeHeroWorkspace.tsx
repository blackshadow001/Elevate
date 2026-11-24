"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, CheckCircle2, Sparkles, Terminal } from "lucide-react";

export function PracticeHeroWorkspace() {
  const [isRunning, setIsRunning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [runtime, setRuntime] = useState(45);

  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setShowToast(false);

    setTimeout(() => {
      setIsRunning(false);
      setShowToast(true);
      setRuntime(Math.floor(38 + Math.random() * 12));
      setTimeout(() => setShowToast(false), 3500);
    }, 450);
  };

  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none group">
      {/* 3D Scene Wrapper with subtle interactive perspective */}
      <div 
        className="relative w-full aspect-[1208/682] rounded-3xl overflow-visible transition-transform duration-500 ease-out group-hover:scale-[1.01]"
      >
        {/* High-Resolution 3D Render Image (Laptop, Books, Mug, Plant, Wave Arcs, Floating Badges) */}
        <Image
          src="/images/practice-hero-3d-scene-seamless.webp"
          alt="Elevate Interactive Practice Platform — 3D Cloud IDE Workspace"
          width={1208}
          height={682}
          priority
          className="w-full h-full object-contain drop-shadow-2xl"
        />

        {/* Interactive CSS Click Target Over the Laptop "Run Code" Button */}
        {/* In the 1208x682 asset, the "Run Code" button is located at approximately:
            left: 71.5% to 85.5% (width ~14%)
            top: 55.5% to 64% (height ~8.5%) */}
        <button
          type="button"
          onClick={handleRunCode}
          disabled={isRunning}
          title="Click to test in-browser code execution"
          aria-label="Run Code Simulation"
          className="absolute left-[70.8%] top-[55.2%] w-[15.8%] h-[9.6%] rounded-lg sm:rounded-xl bg-transparent hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn focus:outline-none"
        >
          {isRunning && (
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-[#FF6B35]/90 flex items-center justify-center gap-1.5 text-white text-[9px] sm:text-[11px] font-bold shadow-md animate-pulse">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Testing...</span>
            </div>
          )}
        </button>

        {/* Floating CSS Pulse Glow Over Status Badge */}
        <div className="absolute left-[70.8%] top-[34.8%] w-[14.5%] h-[6.8%] rounded-md pointer-events-none">
          <span className="absolute inset-0 rounded-md bg-emerald-400/10 animate-ping opacity-40" />
        </div>

        {/* Micro Interactive Toast when Run Code is clicked */}
        {showToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-semibold shadow-xl border border-slate-700/80 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Passed 100% of test cases ({runtime} ms)</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
