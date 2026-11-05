"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LiveClass } from "@/data/liveClasses";
import { LiveChatMessage, LiveQuestion } from "@/data/chatMessages";
import { LivePoll } from "@/data/polls";
import { LiveResource } from "@/data/liveResources";
import { liveService } from "@/services/liveService";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { Logo } from "@/components/ui/Logo";
import { LiveVideo } from "@/components/live/LiveVideo";
import { LiveControls } from "@/components/live/LiveControls";
import { LiveChat } from "@/components/live/LiveChat";
import { LiveQA } from "@/components/live/LiveQA";
import { LiveResources } from "@/components/live/LiveResources";
import { Poll } from "@/components/live/Poll";
import { 
  Radio, 
  MessageSquare, 
  HelpCircle, 
  FolderDown, 
  Vote, 
  ArrowLeft, 
  Sparkles,
  Users,
  Video
} from "lucide-react";

interface LearnerClassroomClientProps {
  initialClass: LiveClass;
}

export function LearnerClassroomClient({ initialClass }: LearnerClassroomClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<"chat" | "qa" | "resources">("chat");
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  // Classroom data
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [activePoll, setActivePoll] = useState<LivePoll | undefined>();
  const [showPollOverlay, setShowPollOverlay] = useState(true);
  const [classAccess, setClassAccess] = useState<"checking" | "joined" | "unavailable">("checking");
  const [classError, setClassError] = useState("");
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    liveService.joinLiveClass(initialClass.id)
      .then((access) => { if (active) setMeetingUrl(access.meetingUrl); return liveService.getClassMessages(initialClass.id); })
      .then((messages) => { if (active) { setChatMessages(messages); setClassAccess("joined"); } })
      .catch((error) => { if (active) { setClassError(error instanceof Error ? error.message : "Classroom unavailable."); setClassAccess("unavailable"); } });
    liveService.getQuestions().then(setQuestions);
    liveService.getPolls().then((p) => {
      const active = p.find((item) => item.status === "active") || p[0];
      setActivePoll(active);
    });
    return () => { active = false; };
  }, [initialClass.id]);

  const handleSendMessage = async (text: string) => {
    try {
      const newMsg = await liveService.sendClassMessage(initialClass.id, text);
      setChatMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      notify({ type: "error", title: "Message not sent", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleAskQuestion = async (question: string) => {
    const newQ = await liveService.askQuestion(question, user?.name || "Alex Johnson");
    setQuestions((prev) => [...prev, newQ]);
    notify({
      type: "success",
      title: "Question Submitted",
      message: "Your question appears in this demo classroom. Instructor delivery requires a backend.",
    });
  };

  const handleUpvoteQuestion = async (id: string) => {
    const upvotes = await liveService.upvoteQuestion(id);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes } : q))
    );
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    const updated = await liveService.votePoll(pollId, optionId);
    if (updated) {
      setActivePoll({ ...updated });
    }
  };

  const handleToggleHandRaise = async () => {
    const next = !isHandRaised;
    await liveService.toggleHandRaise(user?.id);
    setIsHandRaised(next);
    if (next) {
      notify({
        type: "success",
        title: "✋ Hand Raised",
        message: "Your hand is raised in this demo classroom.",
      });
    } else {
      notify({
        type: "info",
        title: "✋ Hand Lowered",
        message: "Hand lowered.",
      });
    }
  };

  const handleLeaveClass = () => {
    setLeaveModalOpen(true);
  };

  const confirmLeaveClass = async () => {
    if (classAccess === "joined") await liveService.leaveLiveClass(initialClass.id).catch(() => {});
    setLeaveModalOpen(false);
    notify({
      type: "info",
      title: "Class Left",
      message: "You have disconnected from the live classroom.",
    });
    router.push("/live");
  };

  if (classAccess !== "joined") return (
    <main className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">{classAccess === "checking" ? "Checking classroom access…" : "Classroom unavailable"}</h1>
      {classAccess === "unavailable" && <p className="max-w-md text-slate-300">{classError}</p>}
      <Link href="/live" className="rounded-xl bg-[#FF6B35] px-5 py-3 font-bold">View live classes</Link>
    </main>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between">
      <div className="bg-[#243047] px-5 py-2 text-center text-xs text-slate-200">Video runs in the linked meeting service. Classroom Q&A, polls, and video controls here are previews.</div>
      {/* Top Navbar Header (Requirement 8) */}
      <header className="h-16 px-4 sm:px-6 bg-[#172033] border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Logo />
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <Link
            href="/live"
            className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Live Learning Hub</span>
          </Link>
        </div>

        {/* Center: Live indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>LIVE CLASSROOM</span>
          </span>
        </div>

        {/* Right: Learner Profile */}
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
            alt={user?.name || "Alex"}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{user?.name || "Alex Johnson"}</div>
            <div className="text-[10px] text-slate-400 capitalize">{user?.role || "Learner"}</div>
          </div>
        </div>
      </header>

      {/* Main Classroom Body: 70% Video + 30% Sidebar */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1700px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        {/* Left 70% Video Area (8 or 8.5 cols) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            {meetingUrl ? <div className="aspect-video rounded-3xl bg-[#172033] border border-white/10 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <Video className="h-10 w-10 text-[#FF6B35]" />
              <h2 className="text-xl font-bold">Join the live video meeting</h2>
              <p className="max-w-md text-sm text-slate-300">The meeting opens in a new tab. Keep this classroom open for saved chat.</p>
              <a href={meetingUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#FF6B35] px-6 py-3 font-bold text-white">Open meeting</a>
            </div> : <LiveVideo
              title={initialClass.title}
              instructorName={initialClass.instructorName}
              instructorRole={initialClass.instructorRole}
              instructorAvatar={initialClass.instructorAvatar}
              attendeesCount={initialClass.attendeesCount}
              isScreenSharing={isScreenSharing}
              onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
            />}

            {/* Title & Instructor meta below video */}
            <div className="bg-[#172033] rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-black text-white">
                  {initialClass.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {initialClass.instructorName} · {initialClass.instructorRole}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                  {initialClass.courseTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Learner Controls (Requirement 11) */}
          <div className="pt-2">
            {meetingUrl ? <p className="text-xs text-slate-400">Use the meeting tab for microphone, camera, and screen sharing controls.</p> : <LiveControls
              onLeaveClass={handleLeaveClass}
              onToggleSidebarTab={setActiveTab}
              activeSidebarTab={activeTab}
              isHandRaised={isHandRaised}
              onToggleHandRaise={handleToggleHandRaise}
            />}
          </div>
        </div>

        {/* Right 30% Sidebar (4 cols) */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col h-full min-h-[500px] lg:min-h-0 space-y-3">
          {/* Tab buttons (Requirement 10: Live Chat, Q&A, Resources) */}
          <div className="bg-[#172033] p-1.5 rounded-2xl border border-white/10 grid grid-cols-3 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "chat"
                  ? "bg-[#FF6B35] text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("qa")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "qa"
                  ? "bg-[#FF6B35] text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Q&A ({questions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("resources")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "resources"
                  ? "bg-[#FF6B35] text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>Resources</span>
            </button>
          </div>

          {/* Active Poll banner popup if active (Requirement 20) */}
          {activePoll && showPollOverlay && (
            <div className="relative">
              <Poll
                poll={activePoll}
                onVote={handleVotePoll}
                onClose={() => setShowPollOverlay(false)}
              />
            </div>
          )}

          {/* Tab Content Panes */}
          <div className="flex-1 min-h-0">
            {activeTab === "chat" && (
              <LiveChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            )}

            {activeTab === "qa" && (
              <LiveQA
                questions={questions}
                onAskQuestion={handleAskQuestion}
                onUpvoteQuestion={handleUpvoteQuestion}
              />
            )}

            {activeTab === "resources" && (
              <LiveResources resources={[]} />
            )}
          </div>
        </div>
      </main>

      {/* Leave Class Confirmation Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#E5E7EB] text-[#172033] animate-in zoom-in-95">
            <h3 className="text-lg font-black">Leave Classroom?</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              You will leave this active live session. You can re-join anytime from the Live Learning hub.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] hover:bg-slate-50 cursor-pointer"
              >
                Stay in Class
              </button>
              <button
                type="button"
                onClick={confirmLeaveClass}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Leave Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
