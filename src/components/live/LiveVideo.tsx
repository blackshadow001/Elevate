"use client";

import React, { useState, useRef } from "react";
import { 
  Radio, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Monitor, 
  User, 
  BadgeCheck,
  Signal,
  Layers
} from "lucide-react";

interface LiveVideoProps {
  title: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  attendeesCount: number;
  isScreenSharing?: boolean;
  onToggleScreenShare?: () => void;
}

export function LiveVideo({
  title,
  instructorName,
  instructorRole,
  instructorAvatar,
  attendeesCount,
  isScreenSharing = true, // default screen share is on for realism
  onToggleScreenShare,
}: LiveVideoProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video sm:aspect-16/10 lg:aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between group select-none"
    >
      {/* Top Overlay Badges */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5">
          {/* Subtle Live Badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg pointer-events-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>LIVE DEMO</span>
          </span>

          {/* Quality Indicator */}
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 border border-white/15 text-[11px] font-bold pointer-events-auto flex items-center gap-1">
            <Signal className="w-3 h-3 text-emerald-400" />
            <span>Sample view</span>
          </span>

          {/* Live Watchers */}
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-200 border border-white/15 text-xs font-semibold pointer-events-auto">
            {attendeesCount} watching
          </span>
        </div>

        {/* Mode Switcher pill (Screen Share vs Full Camera) */}
        {onToggleScreenShare && (
          <button
            type="button"
            onClick={onToggleScreenShare}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer border border-white/20"
          >
            <Monitor className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{isScreenSharing ? "Screen Active" : "Camera Active"}</span>
          </button>
        )}
      </div>

      {/* Main Video Surface */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0A0E17]">
        {isScreenSharing ? (
          /* Screen Sharing View */
          <div className="w-full h-full relative flex flex-col bg-[#0F172A] p-4 sm:p-6 select-none">
            {/* Mock Code Editor Screen */}
            <div className="w-full h-full rounded-2xl bg-[#1E293B] border border-slate-700/60 overflow-hidden shadow-2xl flex flex-col font-mono text-xs sm:text-sm">
              {/* Top editor tab bar */}
              <div className="bg-[#0F172A] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 pr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="px-3 py-1 rounded-md bg-[#1E293B] text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                    actions/authenticate.ts
                  </span>
                  <span className="hidden sm:inline text-slate-500">app/page.tsx</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-sans font-bold flex items-center gap-1">
                  ● SCREEN SHARING ACTIVE
                </span>
              </div>

              {/* Code simulation lines */}
              <div className="p-4 sm:p-6 text-slate-200 space-y-2 leading-relaxed overflow-hidden flex-1 bg-gradient-to-b from-[#1E293B] to-[#151D2C]">
                <div><span className="text-purple-400 font-bold">&quot;use server&quot;</span>;</div>
                <div className="text-slate-500">{"// React 19 Native Server Action with optimistic state & cookies"}</div>
                <div>
                  <span className="text-blue-400 font-bold">export async function</span>{" "}
                  <span className="text-yellow-300 font-bold">loginUserAction</span>(
                  <span className="text-orange-300">prevState</span>: ActionState,{" "}
                  <span className="text-orange-300">formData</span>: FormData
                  ) &#123;
                </div>
                <div className="pl-6">
                  <span className="text-blue-400 font-bold">const</span> email = formData.get(
                  <span className="text-emerald-300">&quot;email&quot;</span>) as string;
                </div>
                <div className="pl-6">
                  <span className="text-blue-400 font-bold">const</span> password = formData.get(
                  <span className="text-emerald-300">&quot;password&quot;</span>) as string;
                </div>
                <div className="pl-6 text-slate-500">{"// 1. Validate payload via Zod runtime schema"}</div>
                <div className="pl-6">
                  <span className="text-blue-400 font-bold">const</span> validated = UserSchema.safeParse(&#123; email, password &#125;);
                </div>
                <div className="pl-6 text-slate-500">{"// Preview snippet only — not connected to Elevate authentication"}</div>
                <div className="pl-6">
                  <span className="text-blue-400 font-bold">return</span> &#123; status: <span className="text-emerald-300">&quot;preview&quot;</span> &#125;;
                </div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Picture-in-Picture: Instructor Camera */}
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-28 sm:w-36 lg:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-[#FF6B35] shadow-2xl bg-black z-10 transition-transform hover:scale-105">
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <div className="text-white">
                  <div className="text-[10px] sm:text-xs font-bold leading-none truncate max-w-[120px]">
                    {instructorName}
                  </div>
                  <div className="text-[9px] text-[#FF6B35] font-semibold">Tutor (Camera)</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Screen Instructor Camera View */
          <div className="w-full h-full relative">
            <img
              src={instructorAvatar}
              alt={instructorName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-wider inline-block">
                  Instructor Spotlight
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">{instructorName}</h3>
                <p className="text-xs text-slate-300">{instructorRole}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Overlay Control Bar on Hover */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <span className="text-xs font-bold text-white truncate max-w-[240px] sm:max-w-md">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:text-[#FF6B35] transition-colors cursor-pointer"
            title={isMuted ? "Unmute stream" : "Mute stream"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 hover:text-[#FF6B35] transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
