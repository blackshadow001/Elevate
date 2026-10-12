"use client";

import React, { useState } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Users, 
  MessageSquare, 
  Vote, 
  PenTool, 
  FolderDown, 
  CircleDot, 
  MoreHorizontal, 
  PowerOff,
  Radio,
  Share2
} from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

interface InstructorControlsProps {
  onToggleScreenShare: () => void;
  isScreenSharing: boolean;
  onOpenParticipants: () => void;
  onOpenChat: () => void;
  onOpenPoll: () => void;
  onOpenWhiteboard: () => void;
  onOpenResources: () => void;
  onEndClass: () => void;
  activePanel?: string | null;
}

export function InstructorControls({
  onToggleScreenShare,
  isScreenSharing,
  onOpenParticipants,
  onOpenChat,
  onOpenPoll,
  onOpenWhiteboard,
  onOpenResources,
  onEndClass,
  activePanel,
}: InstructorControlsProps) {
  const { notify } = useNotification();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const toggleMic = () => {
    setIsMicOn((prev) => {
      const next = !prev;
      notify({
        type: "info",
        title: next ? "Instructor Mic Active" : "Instructor Mic Muted",
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
        title: next ? "Instructor Camera Active" : "Instructor Camera Off",
        message: "Demo camera state changed. Real video requires live media integration.",
      });
      return next;
    });
  };

  const toggleRecord = () => {
    setIsRecording((prev) => {
      const next = !prev;
      notify({
        type: next ? "success" : "warning",
        title: next ? "Recording Resumed" : "Recording Paused",
        message: "This is a demo recording indicator. No media file is being created.",
      });
      return next;
    });
  };

  return (
    <div className="w-full bg-[#172033] border-t border-white/10 px-4 py-3 sm:py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-white flex-wrap">
      {/* Left / Center: Studio Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        {/* Mic */}
        <button
          type="button"
          onClick={toggleMic}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isMicOn
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
          title="Mic"
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMicOn ? "Mic On" : "Muted"}</span>
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isCameraOn
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
          title="Camera"
        >
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{isCameraOn ? "Camera On" : "Cam Off"}</span>
        </button>

        {/* Share Screen */}
        <button
          type="button"
          onClick={onToggleScreenShare}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isScreenSharing
              ? "bg-[#FF6B35] text-white ring-2 ring-[#FF6B35]/40"
              : "bg-white/10 hover:bg-white/20 text-slate-200"
          }`}
          title="Share Screen"
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isScreenSharing ? "Screen Active" : "Share Screen"}
          </span>
        </button>

        <div className="h-5 w-px bg-white/15 hidden md:block" />

        {/* Participants */}
        <button
          type="button"
          onClick={onOpenParticipants}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePanel === "participants"
              ? "bg-white/25 text-white"
              : "bg-white/10 hover:bg-white/15 text-slate-200"
          }`}
          title="Manage Participants"
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>Participants</span>
        </button>

        {/* Chat */}
        <button
          type="button"
          onClick={onOpenChat}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePanel === "chat"
              ? "bg-white/25 text-white"
              : "bg-white/10 hover:bg-white/15 text-slate-200"
          }`}
          title="Live Chat"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Chat</span>
        </button>

        {/* Poll */}
        <button
          type="button"
          onClick={onOpenPoll}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePanel === "poll"
              ? "bg-white/25 text-white"
              : "bg-white/10 hover:bg-white/15 text-slate-200"
          }`}
          title="Create or View Poll"
        >
          <Vote className="w-4 h-4 text-amber-400" />
          <span>Poll</span>
        </button>

        {/* Whiteboard */}
        <button
          type="button"
          onClick={onOpenWhiteboard}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePanel === "whiteboard"
              ? "bg-white/25 text-white"
              : "bg-white/10 hover:bg-white/15 text-slate-200"
          }`}
          title="Interactive Whiteboard"
        >
          <PenTool className="w-4 h-4 text-purple-400" />
          <span>Whiteboard</span>
        </button>

        {/* Resources */}
        <button
          type="button"
          onClick={onOpenResources}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePanel === "resources"
              ? "bg-white/25 text-white"
              : "bg-white/10 hover:bg-white/15 text-slate-200"
          }`}
          title="Class Materials"
        >
          <FolderDown className="w-4 h-4 text-blue-400" />
          <span>Resources</span>
        </button>

        {/* Recording Indicator & Toggle */}
        <button
          type="button"
          onClick={toggleRecord}
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isRecording
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-white/10 text-slate-400"
          }`}
          title="Record Session"
        >
          <CircleDot className={`w-3.5 h-3.5 ${isRecording ? "animate-pulse text-red-500" : ""}`} />
          <span className="hidden xl:inline">{isRecording ? "Demo REC" : "Demo REC Off"}</span>
        </button>
      </div>

      {/* Right: End Class Button */}
      <button
        type="button"
        onClick={onEndClass}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 cursor-pointer shrink-0"
      >
        <PowerOff className="w-4 h-4" />
        <span>End Class</span>
      </button>
    </div>
  );
}
