"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LiveClass } from "@/data/liveClasses";
import { Participant } from "@/data/participants";
import { LiveChatMessage } from "@/data/chatMessages";
import { LivePoll } from "@/data/polls";
import { LiveVideo } from "@/components/live/LiveVideo";
import { InstructorControls } from "./InstructorControls";
import { ParticipantManager } from "./ParticipantManager";
import { PollCreator } from "./PollCreator";
import { ScreenShareModal } from "./ScreenShare";
import { Whiteboard } from "@/components/live/Whiteboard";
import { LiveChat } from "@/components/live/LiveChat";
import { LiveResources } from "@/components/live/LiveResources";
import { LiveAnalytics } from "./LiveAnalytics";
import { liveService } from "@/services/liveService";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { 
  Users, 
  Hand, 
  MessageSquare, 
  Vote, 
  PenTool, 
  FolderDown, 
  Radio, 
  PowerOff, 
  X,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";

interface InstructorLiveStudioProps {
  liveClass: LiveClass;
}

export function InstructorLiveStudio({ liveClass }: InstructorLiveStudioProps) {
  const router = useRouter();
  const { notify } = useNotification();
  const notifyRef = useRef(notify);
  useEffect(() => { notifyRef.current = notify; }, [notify]);

  // Active side panel: null | "participants" | "chat" | "poll" | "whiteboard" | "resources"
  const [activePanel, setActivePanel] = useState<string | null>("participants");
  const [isScreenSharing, setIsScreenSharing] = useState(true);
  const [screenShareModalOpen, setScreenShareModalOpen] = useState(false);
  const [endClassModalOpen, setEndClassModalOpen] = useState(false);
  const [isClassEnded, setIsClassEnded] = useState(liveClass.status === "completed");

  // State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [polls, setPolls] = useState<LivePoll[]>([]);

  // Load participants & polls
  useEffect(() => {
    liveService.getParticipants().then(setParticipants);
    if (liveClass.status === "live") {
      liveService.joinLiveClass(liveClass.id).then(() => liveService.getClassMessages(liveClass.id))
        .then(setChatMessages).catch((error) => notifyRef.current({ type: "error", title: "Classroom unavailable", message: error instanceof Error ? error.message : "Please try again." }));
    }
    liveService.getPolls().then(setPolls);
  }, [liveClass.id, liveClass.status]);

  const handleSendMessage = async (text: string) => {
    try {
      const newMsg = await liveService.sendClassMessage(liveClass.id, text);
      setChatMessages((prev) => [...prev, { ...newMsg, senderRole: "instructor", isInstructor: true }]);
    } catch (error) { notify({ type: "error", title: "Message not sent", message: error instanceof Error ? error.message : "Please try again." }); }
  };

  const handleLaunchPoll = async (question: string, options: string[]) => {
    const created = await liveService.createPoll(question, options);
    setPolls((prev) => [...prev, created]);
    setActivePanel("poll");
  };

  const handleConfirmEndClass = async () => {
    try { await liveService.updateLiveClassStatus(liveClass.id, "completed"); }
    catch (error) { notify({ type: "error", title: "Class not ended", message: error instanceof Error ? error.message : "Please try again." }); return; }
    setIsClassEnded(true);
    setEndClassModalOpen(false);
    notify({
      type: "success",
      title: "Class Successfully Ended",
      message: "The class status was saved. Recordings require a streaming provider.",
    });
  };

  if (isClassEnded) {
    return (
      <div className="space-y-6">
        <LiveAnalytics
          liveClass={{ ...liveClass, status: "completed" }}
          onBack={() => router.push("/instructor/live-classes")}
        />
      </div>
    );
  }

  const handsRaisedCount = participants.filter((p) => p.isHandRaised).length;

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#172033] text-white p-5 rounded-3xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/instructor/live-classes"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            title="Back to Live Classes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>Demo Classroom Live</span>
              </span>
              <span className="text-xs text-slate-400">Host: {liveClass.instructorName}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {liveClass.title}
            </h1>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {handsRaisedCount > 0 && (
            <button
              type="button"
              onClick={() => setActivePanel("participants")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 text-[#FF6B35] border border-[#FF6B35]/40 text-xs font-bold cursor-pointer animate-pulse"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>{handsRaisedCount} Hands Raised</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{participants.length} Learners In Room</span>
          </div>
        </div>
      </div>

      {/* Main Studio Area: Video + Floating Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Video Studio (8 cols if panel open, 12 if closed) */}
        <div className={`${activePanel ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
          <LiveVideo
            title={liveClass.title}
            instructorName={liveClass.instructorName}
            instructorRole={liveClass.instructorRole}
            instructorAvatar={liveClass.instructorAvatar}
            attendeesCount={participants.length}
            isScreenSharing={isScreenSharing}
            onToggleScreenShare={() => setScreenShareModalOpen(true)}
          />

          {/* Instructor Controls Bar */}
          <InstructorControls
            onToggleScreenShare={() => setScreenShareModalOpen(true)}
            isScreenSharing={isScreenSharing}
            onOpenParticipants={() =>
              setActivePanel(activePanel === "participants" ? null : "participants")
            }
            onOpenChat={() => setActivePanel(activePanel === "chat" ? null : "chat")}
            onOpenPoll={() => setActivePanel(activePanel === "poll" ? null : "poll")}
            onOpenWhiteboard={() =>
              setActivePanel(activePanel === "whiteboard" ? null : "whiteboard")
            }
            onOpenResources={() =>
              setActivePanel(activePanel === "resources" ? null : "resources")
            }
            onEndClass={() => setEndClassModalOpen(true)}
            activePanel={activePanel}
          />
        </div>

        {/* Right Active Drawer / Tool Panel (4 cols) */}
        {activePanel && (
          <div className="lg:col-span-4 h-[580px] flex flex-col relative animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Top Close Bar */}
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg bg-slate-200/60 hover:bg-slate-300 text-[#172033] cursor-pointer"
                title="Collapse Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Selector */}
            {activePanel === "participants" && (
              <ParticipantManager
                participants={participants}
                onMuteParticipant={(id) => liveService.muteParticipant(id)}
                onRemoveParticipant={(id) => liveService.removeParticipant(id)}
                onPinParticipant={(id) => liveService.pinParticipant(id)}
              />
            )}

            {activePanel === "chat" && (
              <LiveChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            )}

            {activePanel === "poll" && (
              <div className="h-full flex items-center justify-center p-2">
                <PollCreator
                  onLaunchPoll={handleLaunchPoll}
                  activePoll={polls[polls.length - 1]}
                />
              </div>
            )}

            {activePanel === "whiteboard" && (
              <Whiteboard onClose={() => setActivePanel(null)} />
            )}

            {activePanel === "resources" && (
              <LiveResources resources={[]} />
            )}
          </div>
        )}
      </div>

      {/* Screen Share Source Modal */}
      <ScreenShareModal
        isOpen={screenShareModalOpen}
        onClose={() => setScreenShareModalOpen(false)}
        onConfirmShare={(source) => {
          setIsScreenSharing(true);
        }}
      />

      {/* End Class Confirmation Modal */}
      {endClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-[#172033]">
                End Live Session for Everyone?
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                This will save the class as completed on this server. No live stream or cloud recording is running.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEndClassModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Keep Teaching
              </button>
              <button
                type="button"
                onClick={handleConfirmEndClass}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer"
              >
                Confirm End Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
