"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInstructorCourses } from "@/lib/instructorCourses";
import { useAuth } from "@/context/AuthContext";
import { liveService } from "@/services/liveService";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { 
  ArrowLeft, 
  Video, 
  Calendar, 
  Clock, 
  Layers, 
  Globe, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";

export default function ScheduleLiveClassPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const ownedCourses = useInstructorCourses();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "React 19 Server Functions Masterclass",
    courseId: "",
    description: "Live interactive deep dive into optimistic actions, server function execution, and caching strategies.",
    scheduledAt: "",
    startTime: "19:00",
    duration: 90,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedCourse = ownedCourses.find((c) => c.id === formData.courseId);

    try { await liveService.createLiveClass({
      title: formData.title,
      courseId: formData.courseId,
      courseTitle: selectedCourse?.title || "Open class",
      instructorId: user.id,
      instructorName: user.name,
      instructorRole: "Senior Software Architect",
      instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      scheduledAt: formData.scheduledAt,
      startTime: formData.startTime,
      duration: Number(formData.duration),
      status: "scheduled",
      description: formData.description,
      tags: ["Live Workshop", "Architecture"],
    });

    setIsSubmitting(false);

    notify({
      type: "success",
      title: "Live Class Scheduled! 📅",
      message: `"${formData.title}" is scheduled. A live provider must be configured before streaming.`,
    });

    setTimeout(() => {
      router.push("/instructor/live-classes");
    }, 600);
    } catch (error) {
      setIsSubmitting(false);
      notify({ type: "error", title: "Class not scheduled", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link
          href="/instructor/live-classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Live Classes</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Schedule a Live Class
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Set up an interactive real-time lecture or Q&A masterclass for your enrolled learners.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-[#172033]">
              Class Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
            />
          </div>

          {/* Associated Course */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-[#172033]">
              Associated Course
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
            >
              <option value="">Open class · no course</option>
              {ownedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-[#172033]">
              Class Overview & Syllabus Topics
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3.5 text-sm text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
            />
          </div>

          {/* Timing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Date</label>
              <input
                type="date"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                required
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Duration (mins)</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
              >
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1 hr)</option>
                <option value={90}>90 mins (1.5 hrs)</option>
                <option value={120}>120 mins (2 hrs)</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            The class schedule is saved to your account. Streaming and meeting links are unavailable until a live provider is connected.
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Link
              href="/instructor/live-classes"
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-97 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Scheduling..." : "Schedule Live Class"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
