"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InstructorCourse, setInstructorCourseStatus, useInstructorCourses } from "@/lib/instructorCourses";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { 
  PlusCircle, 
  Search, 
  MoreVertical, 
  Star, 
  Users, 
  Clock, 
  Eye, 
  Edit3, 
  BarChart2, 
  Archive, 
  Globe, 
  AlertTriangle,
  X,
  CheckCircle2
} from "lucide-react";

export default function InstructorCoursesPage() {
  const { notify } = useNotification();
  const instructorCourses = useInstructorCourses();
  const allCourses = instructorCourses;
  const [activeTab, setActiveTab] = useState<"All" | InstructorCourse["status"]>("All");
  const [search, setSearch] = useState("");

  // Modal State for Confirmations
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    courseId?: string;
    courseTitle?: string;
    action?: "submit" | "archive";
  }>({ open: false });

  const filteredCourses = allCourses.filter((c) => {
    const matchesTab = activeTab === "All" || c.status === activeTab;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleActionClick = (courseId: string, courseTitle: string, action: "submit" | "archive") => {
    setConfirmModal({
      open: true,
      courseId,
      courseTitle,
      action,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.courseId || !confirmModal.action) return;

    const newStatus =
      confirmModal.action === "submit"
        ? "Pending Approval"
        : confirmModal.action === "archive"
        ? "Archived"
        : "Draft";

    try {
      await setInstructorCourseStatus(confirmModal.courseId, newStatus);
      notify({ type: "success", title: `Course ${newStatus}`, message: `"${confirmModal.courseTitle}" is now marked as ${newStatus}.` });
    } catch (error) {
      notify({ type: "error", title: "Course status unchanged", message: error instanceof Error ? error.message : "Please try again." });
    }

    setConfirmModal({ open: false });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            My Courses
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage your curriculum, review enrollments, and submit courses for admin approval.
          </p>
        </div>

        <Link
          href="/instructor/courses/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-97 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Pending Approval", "Approved", "Published", "Rejected", "Draft", "Unpublished", "Archived"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#172033] text-white"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#F7F8FA]"
              }`}
            >
              {tab} (
              {tab === "All"
                ? allCourses.length
                : allCourses.filter((c) => c.status === tab).length}
              )
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35] focus:bg-white"
          />
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail + Status */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                    c.status === "Published"
                      ? "bg-emerald-600 text-white"
                      : c.status === "Draft"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-600 text-white"
                  }`}
                >
                  {c.status}
                </span>
                {c.status === "Rejected" && c.reviewFeedback && <p className="mt-2 text-xs text-red-700">Admin feedback: {c.reviewFeedback}</p>}

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {c.totalLessons} {c.totalLessons === 1 ? "lesson" : "lessons"}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wide">
                    {c.category}
                  </span>
                  <h3 className="font-bold text-[#172033] text-sm leading-snug line-clamp-2">
                    {c.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B] pt-1 border-t border-[#F7F8FA]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{c.studentsCount.toLocaleString()} learners</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{c.rating}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-5 pt-0 border-t border-[#F7F8FA] space-y-2">
              <p className="pt-3 text-[11px] text-[#64748B]">{c.pricing?.basePriceMinor === null || c.pricing?.basePriceMinor === undefined
                ? `Proposed price: ₹${c.price.toFixed(2)} · Awaiting admin base price`
                : `Admin base: ₹${(c.pricing.basePriceMinor / 100).toFixed(2)} · Margin: ${((c.pricing.proposedMarginBps ?? c.pricing.approvedMarginBps ?? 0) / 100).toFixed(2)}% · Proposed final: ₹${((c.pricing.proposedFinalMinor ?? c.pricing.finalPriceMinor ?? 0) / 100).toFixed(2)}`}</p>
              <div className="grid grid-cols-2 gap-2 pt-3">
                {c.status === "Published" ? <Link href={`/courses/${c.slug}`} className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033]">View public page</Link> :
                  <Link href={`/instructor/courses/${c.id}/edit`} className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors"><Edit3 className="w-3.5 h-3.5 text-[#64748B]" /><span>Edit</span></Link>}

                <Link
                  href="/instructor/analytics"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Analytics</span>
                </Link>
              </div>

              {/* Status toggles */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                {["Draft", "Rejected", "Unpublished"].includes(c.status) ? (
                  <button
                    type="button"
                    onClick={() => handleActionClick(c.id, c.title, "submit")}
                    className="text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Submit for Approval</span>
                  </button>
                ) : <span className="text-[#64748B]">{c.status === "Published" ? "Ask admin to unpublish before editing" : c.status}</span>}

                {c.status === "Draft" && (
                  <button
                    type="button"
                    onClick={() => handleActionClick(c.id, c.title, "archive")}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-1"
                  >
                    <Archive className="w-3 h-3" />
                    <span>Archive</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal (Requirement 32) */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false })}
                className="text-slate-400 hover:text-[#172033] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#172033]">
                {confirmModal.action === "submit" ? "Submit this course for approval?" : "Archive this course?"}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {confirmModal.action === "submit"
                  ? "An admin will review the content and pricing. The course stays private until an admin publishes it."
                  : "Archiving keeps this draft out of the approval queue."}
              </p>
              <div className="bg-[#F7F8FA] p-3 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033]">
                {confirmModal.courseTitle}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
