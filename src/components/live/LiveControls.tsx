"use client";

import React, { useState } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  MessageSquare, 
  FolderDown, 
  MoreHorizontal, 
  LogOut,
  HelpCircle,
  Settings,
  Sparkles
} from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

interface LiveControlsProps {
  onLeaveClass: () => void;
  onToggleSidebarTab?: (tab: "chat" | "qa" | "resources") => void;
  activeSidebarTab?: "chat" | "qa" | "resources";
  isHandRaised: boolean;
  onToggleHandRaise: () => void;
}

export function LiveControls({
  onLeaveClass,
  onToggleSidebarTab,
  activeSidebarTab = "chat",
  isHandRaised,
  onToggleHandRaise,
}: LiveControlsProps) {
  const { notify } = useNotification();
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const toggleMic = () => {
    setIsMicOn((prev) => {
      const next = !prev;
      notify({
        type: "info",
        title: next ? "Microphone Unmuted" : "Microphone Muted",
        message: "Demo microphone state changed. Real audio requires live media integration.",
      });
      return next;
    });
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const next = !prev;
      notify({
        type: "info",
        title: next ? "Camera Turned On" : "Camera Turned Off",
        message: "Demo camera state changed. Real video requires live media integration.",
      });
      return next;
    });
  };

  return (
    <div className="w-full bg-[#172033] border-t border-white/10 px-4 py-3 sm:py-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-white">
      {/* Left / Center Controls: Media & Interaction */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Mic */}
        <button
          type="button"
          onClick={toggleMic}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isMicOn
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-white/10 hover:bg-white/15 text-slate-300"
          }`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-400" />}
          <span className="hidden sm:inline">{isMicOn ? "Mute" : "Unmute"}</span>
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isCameraOn
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-white/10 hover:bg-white/15 text-slate-300"
          }`}
          title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-slate-400" />}
          <span className="hidden sm:inline">{isCameraOn ? "Stop Video" : "Start Video"}</span>
        </button>

        <div className="h-5 w-px bg-white/15 hidden sm:block" />

        {/* Raise Hand (Requirement 12) */}
        <button
          type="button"
          onClick={onToggleHandRaise}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
            isHandRaised
              ? "bg-[#FF6B35] text-white hover:bg-[#E85D2A] ring-2 ring-[#FF6B35]/40"
              : "bg-white/10 hover:bg-white/15 text-slate-200"
          }`}
        >
          <Hand className={`w-4 h-4 ${isHandRaised ? "animate-bounce" : ""}`} />
          <span>{isHandRaised ? "✋ Hand Raised" : "✋ Raise Hand"}</span>
        </button>

        {/* Chat tab toggle */}
        {onToggleSidebarTab && (
          <button
            type="button"
            onClick={() => onToggleSidebarTab("chat")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === "chat"
                ? "bg-white/20 text-white"
                : "bg-white/10 hover:bg-white/15 text-slate-300"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#FF6B35]" />
            <span>Chat</span>
          </button>
        )}

        {/* Resources tab toggle */}
        {onToggleSidebarTab && (
          <button
            type="button"
            onClick={() => onToggleSidebarTab("resources")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === "resources"
                ? "bg-white/20 text-white"
                : "bg-white/10 hover:bg-white/15 text-slate-300"
            }`}
          >
            <FolderDown className="w-4 h-4 text-blue-400" />
            <span>Resources</span>
          </button>
        )}

        {/* More Menu Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {moreMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#172033] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2">
              <button
                type="button"
                onClick={() => {
                  onToggleSidebarTab?.("qa");
                  setMoreMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#FF6B35]" />
                <span>Open Q&A Panel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  notify({
                    type: "info",
                    title: "Audio Settings",
                    message: "Device selection will be available when live media is connected.",
                  });
                  setMoreMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Audio / Video Setup</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Leave Class Action */}
      <button
        type="button"
        onClick={onLeaveClass}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
      >
        <LogOut className="w-4 h-4" />
        <span>Leave Class</span>
      </button>
    </div>
  );
}
