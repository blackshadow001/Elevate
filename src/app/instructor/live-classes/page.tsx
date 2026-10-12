"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LiveClass } from "@/data/liveClasses";
import { liveService } from "@/services/liveService";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { 
  PlusCircle, 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  Edit3, 
  BarChart3, 
  Play, 
  CheckCircle2, 
  Radio
} from "lucide-react";
import { LiveAnalytics } from "@/components/instructor/live/LiveAnalytics";

export default function InstructorLiveClassesListPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [classesList, setClassesList] = useState<LiveClass[]>([]);
  const [tab, setTab] = useState<"All" | "Live Now" | "Upcoming" | "Completed" | "Cancelled">("All");
  const [selectedAnalyticsClass, setSelectedAnalyticsClass] = useState<LiveClass | null>(null);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [cancellingClass, setCancellingClass] = useState<LiveClass | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    liveService.getInstructorLiveClasses().then(setClassesList)
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Unable to load live classes."));
  }, []);

  useEffect(() => {
    if (!editingClass && !cancellingClass) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setEditingClass(null); setCancellingClass(null); } };
    window.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onEscape); };
  }, [editingClass, cancellingClass]);

  const handleStartClass = async (id: string) => {
    try {
      await liveService.updateLiveClassStatus(id, "live");
      notify({ type: "info", title: "Class opened", message: "The classroom is a development preview. Streaming requires a connected provider." });
      router.push(`/instructor/live-classes/${id}`);
    } catch (error) { notify({ type: "error", title: "Class not started", message: error instanceof Error ? error.message : "Please try again." }); }
  };

  const handleSaveClass = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingClass?.title.trim() || !editingClass.description.trim() || !editingClass.scheduledAt.trim() || !editingClass.startTime.trim() || editingClass.duration < 15) return;
    const wasCancelled = classesList.some((item) => item.id === editingClass.id && item.status === "cancelled");
    try { const updated = await (wasCancelled ? liveService.rescheduleLiveClass : liveService.updateLiveClass)(editingClass.id, {
      title: editingClass.title.trim(), description: editingClass.description.trim(), scheduledAt: editingClass.scheduledAt.trim(), startTime: editingClass.startTime.trim(), duration: editingClass.duration,
    });
    if (!updated) throw new Error("This class is unavailable. Refresh the list and try again.");
    setClassesList((previous) => previous.map((item) => item.id === updated.id ? { ...updated } : item));
    setEditingClass(null);
    notify({ type: "success", title: "Class updated", message: "Schedule changes are saved to your account." });
    } catch (error) { notify({ type: "error", title: "Class not updated", message: error instanceof Error ? error.message : "Please try again." }); }
  };

  const handleCancelClass = async (item: LiveClass) => {
    try { await liveService.updateLiveClassStatus(item.id, "cancelled");
    setClassesList((previous) => previous.map((entry) => entry.id === item.id ? { ...entry, status: "cancelled" } : entry));
    setCancellingClass(null);
    notify({ type: "info", title: "Class cancelled", message: `“${item.title}” is no longer scheduled.` });
    } catch (error) { notify({ type: "error", title: "Class not cancelled", message: error instanceof Error ? error.message : "Please try again." }); }
  };

  const handleRescheduleClass = async (item: LiveClass) => {
    setEditingClass({ ...item, status: "scheduled" });
  };

  const filtered = classesList.filter((c) => {
    if (tab === "Live Now") return c.status === "live";
    if (tab === "Upcoming") return c.status === "scheduled";
    if (tab === "Completed") return c.status === "completed";
    if (tab === "Cancelled") return c.status === "cancelled";
    return true;
  });

  if (selectedAnalyticsClass) {
    return (
      <LiveAnalytics
        liveClass={selectedAnalyticsClass}
        onBack={() => setSelectedAnalyticsClass(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Live Classes Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage class schedules and attendance. Streaming and live engagement require a connected provider.
          </p>
        </div>

        <Link
          href="/instructor/live-classes/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-97 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule Live Class</span>
        </Link>
      </div>
      {loadError && <p className="rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600" role="alert">{loadError} Refresh to retry.</p>}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E7EB] text-xs font-bold">
        {(["All", "Live Now", "Upcoming", "Completed", "Cancelled"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              tab === t
                ? "bg-[#172033] text-white shadow-xs"
                : "bg-white text-[#64748B] hover:text-[#172033] border border-[#E5E7EB]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Live Class Cards Grid (Requirement 15) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-3xl border p-6 transition-all flex flex-col justify-between space-y-6 ${
              item.status === "live"
                ? "border-red-300 ring-2 ring-red-100 shadow-lg"
                : "border-[#E5E7EB] hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {item.status === "live" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span>LIVE NOW</span>
                  </span>
                ) : item.status === "scheduled" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    <span>UPCOMING</span>
                  </span>
                ) : item.status === "completed" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>COMPLETED</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600">Cancelled</span>
                )}

                <span className="text-[11px] font-semibold text-[#64748B] capitalize">
                  {item.provider || item.platform || "Integrated"}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wide block">
                  {item.courseTitle}
                </span>
                <h3 className="font-extrabold text-[#172033] text-base leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Status specific metrics */}
              {item.status === "live" && (
                <div className="bg-red-50/70 border border-red-200/60 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-red-800 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    <span>{item.attendeesCount} in demo room</span>
                  </div>
                  <span>Streaming pending</span>
                </div>
              )}

              {item.status === "scheduled" && (
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] p-3 rounded-2xl flex items-center justify-between text-xs text-[#172033]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>{item.scheduledAt} · {item.startTime}</span>
                  </div>
                  <span className="text-[#64748B]">{item.duration} mins</span>
                </div>
              )}

              {item.status === "completed" && (
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#172033] font-bold">
                    <Users className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Class marked complete</span>
                  </div>
                  <span className="text-[#64748B] font-semibold">Attendance pending</span>
                </div>
              )}
            </div>

            {/* Actions matching Requirement 15 */}
            <div className="pt-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
              {item.status === "live" && (
                <Link
                  href={`/instructor/live-classes/${item.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Enter Classroom</span>
                </Link>
              )}

              {item.status === "scheduled" && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditingClass({ ...item })}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Edit</span>
                  </button>

                  <button type="button" onClick={() => setCancellingClass(item)} className="flex-1 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50">Cancel Class</button>

                  <button
                    type="button"
                    onClick={() => handleStartClass(item.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#172033] hover:bg-[#26344D] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Start Class</span>
                  </button>
                </>
              )}

              {item.status === "completed" && (
                <button
                  type="button"
                  onClick={() => setSelectedAnalyticsClass(item)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-[#FF6B35]" />
                  <span>View Session Summary</span>
                </button>
              )}
              {item.status === "cancelled" && <button type="button" onClick={() => handleRescheduleClass(item)} className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-xs font-bold text-[#172033] hover:bg-slate-50">Reschedule Class</button>}
            </div>
          </div>
        ))}
      </div>
      {editingClass && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={() => setEditingClass(null)} />
        <form role="dialog" aria-modal="true" aria-label="Edit live class" onSubmit={handleSaveClass} className="relative z-10 max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-[#172033]">Edit demo live class</h2>
          <label className="block text-xs font-bold text-[#172033]">Title<input required value={editingClass.title} onChange={(event) => setEditingClass({ ...editingClass, title: event.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
          <label className="block text-xs font-bold text-[#172033]">Description<textarea required value={editingClass.description} onChange={(event) => setEditingClass({ ...editingClass, description: event.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-[#172033]">Date<input required value={editingClass.scheduledAt} onChange={(event) => setEditingClass({ ...editingClass, scheduledAt: event.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
            <label className="block text-xs font-bold text-[#172033]">Start time<input required value={editingClass.startTime} onChange={(event) => setEditingClass({ ...editingClass, startTime: event.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
          </div>
          <label className="block text-xs font-bold text-[#172033]">Duration (minutes)<input required type="number" min={15} max={480} value={editingClass.duration} onChange={(event) => setEditingClass({ ...editingClass, duration: Number(event.target.value) })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingClass(null)} className="rounded-xl border px-4 py-2 text-xs font-bold">Cancel</button><button type="submit" className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white">Save changes</button></div>
        </form>
      </div>}
      {cancellingClass && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={() => setCancellingClass(null)} />
        <div role="dialog" aria-modal="true" aria-label="Cancel live class" className="relative z-10 w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-[#172033]">Cancel this demo class?</h2>
          <p className="text-sm text-[#64748B]">{cancellingClass.title} will move to Cancelled. You can reschedule it later.</p>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setCancellingClass(null)} className="rounded-xl border px-4 py-2 text-xs font-bold">Keep Class</button><button type="button" onClick={() => handleCancelClass(cancellingClass)} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Cancel Class</button></div>
        </div>
      </div>}
    </div>
  );
}
