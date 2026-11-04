"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Menu,
  X,
  Sparkles,
  Trophy,
  RotateCcw,
  Share2,
  Star,
  ChevronDown,
  CalendarDays,
  Globe2,
  Users
} from "lucide-react";
import { Course, Lesson } from "@/types";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { setLessonCompletion, useLearningState } from "@/lib/learningState";
import { useAuth } from "@/context/AuthContext";
import { formatVideoDuration } from "@/lib/videoDuration";
import { LessonActivityView } from "@/components/learning/LessonActivityView";
import { LearningScheduleCard } from "@/components/learning/LearningScheduleCard";

interface CoursePlayerProps {
  course: Course;
  initialLessonId: string;
}

export function CoursePlayer({ course, initialLessonId }: CoursePlayerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { notify } = useNotification();
  const { user, isReady, isAuthenticated } = useAuth();
  const learningState = useLearningState();

  // Flatten lessons
  const allFlatLessons: Lesson[] = [];
  course.sections.forEach((sec) => {
    sec.lessons.forEach((les) => {
      allFlatLessons.push(les);
    });
  });

  const routeLessonId = pathname?.split("/").at(-1);
  const currentLessonId = routeLessonId && allFlatLessons.some((lesson) => lesson.id === routeLessonId)
    ? routeLessonId : initialLessonId;

  const completedLessonIds = learningState.completedLessonIds[course.id] || [];

  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "resources" | "qa">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedNotes, setSavedNotes] = useState("");
  const [notesByLesson, setNotesByLesson] = useState<Record<string, string[]>>({});
  const [questionText, setQuestionText] = useState("");
  const [questionsByLesson, setQuestionsByLesson] = useState<Record<string, string[]>>({});
  const [savingProgress, setSavingProgress] = useState(false);
  const [actualDurations, setActualDurations] = useState<Record<string, string>>({});
  const [progressOpen, setProgressOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ average: course.rating, count: course.ratingCount });

  const currentLesson = allFlatLessons.find((l) => l.id === currentLessonId) || allFlatLessons[0];
  const notesList = notesByLesson[currentLesson.id] || [];
  const questions = questionsByLesson[currentLesson.id] || [];
  const currentIndex = allFlatLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allFlatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allFlatLessons.length - 1 ? allFlatLessons[currentIndex + 1] : null;
  const isFinalLesson = currentIndex === allFlatLessons.length - 1;

  const toggleCompleted = async (lessonId: string) => {
    if (completedLessonIds.includes(lessonId)) return true;
    if (savingProgress) return false;
    setSavingProgress(true);
    try {
      await setLessonCompletion(course, lessonId, true, user.name);
      notify({ type: "success", title: "Lesson Completed ✓", message: allFlatLessons.find((lesson) => lesson.id === lessonId)?.title || currentLesson.title });
      return true;
    } catch (error) {
      notify({ type: "error", title: "Progress not saved", message: error instanceof Error ? error.message : "Please try again." });
      return false;
    } finally { setSavingProgress(false); }
  };

  const handleMarkCompleteAndNext = async () => {
    if (!completedLessonIds.includes(currentLesson.id)) {
      if (!await toggleCompleted(currentLesson.id)) return;
    }

    if (nextLesson) {
      router.push(`/learn/${course.slug}/${nextLesson.id}`);
    }
  };

  const isCompleted = completedLessonIds.includes(currentLesson.id);
  const isMediaUnavailable = currentLesson.type === "video" && !currentLesson.videoUrl;
  const requiresSubmission = (currentLesson.type === "quiz" || currentLesson.type === "project") && !isCompleted;
  const progressPercent = Math.min(
    100,
    Math.round((completedLessonIds.length / allFlatLessons.length) * 100)
  );

  const isCourseFullyCompleted = progressPercent === 100;
  const earnedCertificate = learningState.certificates.find((certificate) => certificate.courseId === course.id);
  const nextUnfinishedLesson = allFlatLessons.find((lesson) => !completedLessonIds.includes(lesson.id));

  const shareCourse = async () => {
    try {
      await navigator.clipboard.writeText(new URL(`/courses/${course.slug}`, window.location.origin).toString());
      notify({ type: "success", title: "Course link copied", message: "Share this course with a friend." });
    } catch {
      notify({ type: "error", title: "Could not copy link", message: "Please copy the course URL from its details page." });
    }
  };

  const submitRating = async () => {
    if (!ratingValue || reviewBusy) return;
    setReviewBusy(true);
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(course.id)}/reviews`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratingValue, comment: ratingComment.trim() }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Your rating could not be saved.");
      setRatingSummary({ average: body.data.averageRating, count: body.data.ratingCount });
      setRatingOpen(false);
      notify({ type: "success", title: "Rating saved", message: "Thanks for sharing your experience with this course." });
    } catch (error) {
      notify({ type: "error", title: "Rating not saved", message: error instanceof Error ? error.message : "Please try again." });
    } finally { setReviewBusy(false); }
  };

  const handleSaveNote = () => {
    if (savedNotes.trim()) {
      setNotesByLesson((prev) => ({ ...prev, [currentLesson.id]: [savedNotes.trim(), ...(prev[currentLesson.id] || [])] }));
      setSavedNotes("");
      notify({ type: "info", title: "Demo note added", message: "This note is kept only while this learning page stays open." });
    }
  };

  if (!isReady || learningState.loading) return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-sm text-[#64748B]">Loading your course access…</div>;
  if (!isAuthenticated || !learningState.enrolledCourseIds.includes(course.id)) return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-[#172033]">Course access required</h1>
      <p className="text-sm text-[#64748B]">Sign in and enroll before opening this lesson. Paid enrollment requires a configured checkout.</p>
      <Link href={`/courses/${course.slug}`} className="rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white">View Course →</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans">
      {/* Learning workspace header */}
      <header className="relative z-30 shrink-0 border-b border-white/10 bg-[#172033] px-4 py-3 text-white sm:px-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <Link href="/dashboard" aria-label="Back to My learning" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FF6B35] text-lg">E</span>
            <span className="hidden sm:inline">Elevate</span>
          </Link>
          <div className="hidden h-6 w-px bg-white/20 sm:block" />
          <div className="min-w-0 flex-1 basis-40"><p className="text-[10px] font-semibold uppercase tracking-widest text-[#FFB18F]">Learning workspace</p><h1 className="truncate text-sm font-bold">{course.title}</h1></div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setRatingOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold hover:bg-white/10" aria-label="Rate this course"><Star className="h-4 w-4 text-[#FFB18F]" /><span className="hidden md:inline">Rate course</span></button>
            <div className="relative">
              <button type="button" onClick={() => setProgressOpen((open) => !open)} aria-expanded={progressOpen} aria-label="Your course progress" className="flex items-center gap-2 rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/10">
                <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: `conic-gradient(#FF6B35 ${progressPercent}%, #41506A 0)` }}><span className="grid h-5 w-5 place-items-center rounded-full bg-[#172033] text-[9px]">{progressPercent}</span></span>
                <span className="hidden lg:inline">Your progress</span><ChevronDown className="h-3.5 w-3.5" />
              </button>
              {progressOpen && <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[#E5E7EB] bg-white p-4 text-[#172033] shadow-xl"><p className="text-sm font-bold">{completedLessonIds.length} of {allFlatLessons.length} lessons complete</p><div className="mt-3 h-2 rounded-full bg-[#E5E7EB]"><div className="h-full rounded-full bg-[#FF6B35]" style={{ width: `${progressPercent}%` }} /></div><p className="mt-2 text-xs text-[#64748B]">{progressPercent}% of this course completed</p>{nextUnfinishedLesson && <button type="button" onClick={() => { setProgressOpen(false); router.push(`/learn/${course.slug}/${nextUnfinishedLesson.id}`); }} className="mt-4 text-xs font-bold text-[#E85D2A]">Continue: {nextUnfinishedLesson.title} →</button>}</div>}
            </div>
            <button type="button" onClick={() => void shareCourse()} className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-2.5 py-2 text-xs font-semibold hover:bg-white/10" aria-label="Share this course"><Share2 className="h-4 w-4" /><span className="hidden md:inline">Share</span></button>
            <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#26344D] px-2.5 py-2 text-xs font-semibold hover:bg-[#324566]" aria-label={sidebarOpen ? "Hide course content" : "Show course content"}>{sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}<span className="hidden xl:inline">{sidebarOpen ? "Hide content" : "Course content"}</span></button>
          </div>
        </div>
      </header>

      {/* Main Learning Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left/Middle: Video & Content Tabs */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-white">
          {/* Custom Video Player Box */}
          {isCourseFullyCompleted && isFinalLesson ? (
            <div className="w-full bg-[#172033] aspect-video sm:max-h-[520px] flex flex-col justify-center items-center relative p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-[#FF6B35] text-white flex items-center justify-center mx-auto shadow-2xl mb-4">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2">Course Completed! 🎉</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                Congratulations! You have completed all curriculum modules and lessons in {course.title}.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {earnedCertificate && <Link
                  href={`/certificates/${earnedCertificate.id}`}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-xs transition-colors shadow-lg shadow-orange-500/25"
                >
                  View Your Certificate
                </Link>}
                <button
                  onClick={() => router.push(`/learn/${course.slug}/${allFlatLessons[0].id}`)}
                  className="px-4 py-2.5 rounded-xl bg-[#26344D] hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Review from Start</span>
                </button>
              </div>
            </div>
          ) : (currentLesson.type === "quiz" && currentLesson.activity?.kind === "quiz") ||
            (currentLesson.type === "project" && currentLesson.activity?.kind === "assignment") ? (
            <LessonActivityView key={currentLesson.id} activity={currentLesson.activity} courseId={course.id}
              lessonId={currentLesson.id} title={currentLesson.title} onCompleted={() => toggleCompleted(currentLesson.id)} />
          ) : currentLesson.type === "resource" && currentLesson.activity?.kind === "resource" ? (
            <div className="min-h-72 bg-[#172033] px-6 py-12 text-white sm:px-12"><div className="mx-auto max-w-3xl space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FFB18F]">Learning resource</p>
              <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
              <p className="text-sm text-slate-200">{currentLesson.activity.description}</p>
              <a href={currentLesson.activity.url} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white hover:bg-[#E85D2A]">Open {currentLesson.activity.label} ↗</a>
              <p className="text-xs text-slate-300">Open the resource, then mark this lesson complete.</p>
            </div></div>
          ) : currentLesson.type === "reading" ? (
            <div className="min-h-72 bg-[#172033] px-6 py-12 text-white sm:px-12">
              <div className="mx-auto max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-wider text-[#FFB18F]">Reading lesson</p>
                <h2 className="mt-3 text-2xl font-bold">{currentLesson.title}</h2>
                <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-slate-200">{currentLesson.content || "Lesson content is being prepared. Check back before marking this lesson complete."}</p>
              </div>
            </div>
          ) : currentLesson.videoUrl ? (
            <VideoPlayer
              key={currentLesson.id}
              src={currentLesson.videoUrl}
              poster={course.image}
              title={currentLesson.title}
              lessonId={currentLesson.id}
              isCompleted={isCompleted}
              onLessonEnded={() => toggleCompleted(currentLesson.id)}
              onWatchEvent={async (event) => {
                const response = await fetch(`/api/courses/${encodeURIComponent(course.id)}/lessons/${encodeURIComponent(currentLesson.id)}/watch`, {
                  method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(event),
                });
                if (!response.ok) {
                  const result = await response.json();
                  throw new Error(result.error?.message || "Video watch progress could not be saved.");
                }
                const result = await response.json();
                return { canComplete: result.data?.canComplete === true };
              }}
              onDurationKnown={(seconds) => setActualDurations((previous) => ({
                ...previous, [currentLesson.id]: formatVideoDuration(seconds),
              }))}
              onContinueNext={nextLesson ? handleMarkCompleteAndNext : undefined}
              hasNextLesson={!!nextLesson}
            />
          ) : (
            <div className="min-h-72 bg-[#172033] px-6 py-12 text-center text-white flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold">Lesson media unavailable</h2>
              <p className="mt-2 max-w-lg text-sm text-slate-300">The instructor has not added playable media for this lesson yet.</p>
            </div>
          )}

          {/* Player Bottom Control Bar */}
          <div className="p-4 sm:p-6 border-b border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#FF6B35] uppercase tracking-wider mb-1">
                Lecture {currentIndex + 1} of {allFlatLessons.length} · {actualDurations[currentLesson.id] || currentLesson.duration}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033]">
                {currentLesson.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {prevLesson && (
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/learn/${course.slug}/${prevLesson.id}`);
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#F7F8FA] hover:bg-slate-200 text-[#172033] text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { void toggleCompleted(currentLesson.id); }}
                disabled={savingProgress || isCompleted || isMediaUnavailable || requiresSubmission}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                  isCompleted
                    ? "bg-emerald-50 text-[#16A34A] border border-emerald-200"
                    : "bg-[#172033] text-white hover:bg-[#26344D]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? "Completed ✓" : "Mark Complete"}</span>
              </button>

              {nextLesson && (
                <button
                  type="button"
                  onClick={handleMarkCompleteAndNext}
                  disabled={savingProgress || isMediaUnavailable || requiresSubmission}
                  className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors active:scale-95"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Lesson Tabs */}
          <div className="p-4 sm:p-6 space-y-6 flex-1">
            <div className="flex items-center gap-6 border-b border-[#E5E7EB] text-sm font-semibold text-[#64748B]">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`pb-3 transition-colors ${
                  activeTab === "overview"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "hover:text-[#172033]"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`pb-3 transition-colors ${
                  activeTab === "notes"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "hover:text-[#172033]"
                }`}
              >
                Notes ({notesList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("resources")}
                className={`pb-3 transition-colors ${
                  activeTab === "resources"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "hover:text-[#172033]"
                }`}
              >
                Resources ({currentLesson.resources?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("qa")}
                className={`pb-3 transition-colors ${
                  activeTab === "qa"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "hover:text-[#172033]"
                }`}
              >
                Q&A ({questions.length})
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="max-w-4xl space-y-7 text-sm leading-relaxed text-[#172033]">
                <div><p className="text-xs font-bold uppercase tracking-widest text-[#E85D2A]">Course overview</p><h3 className="mt-2 text-2xl font-extrabold leading-tight">{course.title}</h3>{course.subtitle && <p className="mt-2 text-base text-[#475569]">{course.subtitle}</p>}</div>
                <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><strong>{ratingSummary.count ? ratingSummary.average.toFixed(1) : "New"}</strong><span className="text-[#64748B]">{ratingSummary.count ? `${ratingSummary.count.toLocaleString()} ${ratingSummary.count === 1 ? "rating" : "ratings"}` : "No ratings yet"}</span></div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#E85D2A]" /><strong>{course.studentsCount.toLocaleString()}</strong><span className="text-[#64748B]">learners</span></div>
                  <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#E85D2A]" /><strong>{course.duration}</strong><span className="text-[#64748B]">of lessons</span></div>
                </div>
                {course.description && <p className="whitespace-pre-line text-[#475569]">{course.description}</p>}
                <LearningScheduleCard courseId={course.id} courseSlug={course.slug} courseTitle={course.title} userId={user.id} />
                <div className="grid gap-4 border-t border-[#E5E7EB] pt-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div><p className="text-xs font-bold uppercase text-[#94A3B8]">Level</p><p className="mt-1 font-semibold">{course.level}</p></div>
                  <div><p className="text-xs font-bold uppercase text-[#94A3B8]">Curriculum</p><p className="mt-1 font-semibold">{course.totalLessons} {course.totalLessons === 1 ? "lesson" : "lessons"} · {course.sections.length} {course.sections.length === 1 ? "section" : "sections"}</p></div>
                  <div><p className="text-xs font-bold uppercase text-[#94A3B8]">Language</p><p className="mt-1 flex items-center gap-1.5 font-semibold"><Globe2 className="h-4 w-4 text-[#E85D2A]" />{course.language}</p></div>
                  <div><p className="text-xs font-bold uppercase text-[#94A3B8]">Last updated</p><p className="mt-1 font-semibold">{course.updatedAt}</p></div>
                </div>
                <div className="border-t border-[#E5E7EB] pt-5"><h3 className="font-bold">About this lesson</h3><p className="mt-2 text-[#64748B]">{currentLesson.content || `Learn about ${currentLesson.title} in this course.`}</p></div>
                {course.whatYouWillLearn.length > 0 && <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4"><h4 className="text-xs font-bold uppercase text-[#64748B]">What you will learn</h4><ul className="mt-2 list-inside list-disc space-y-1 text-xs">{course.whatYouWillLearn.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul></div>}
              </div>
            )}

            {/* Tab: Notes */}
            {activeTab === "notes" && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-sm font-bold text-[#172033]">Demo Notes</h3>
                <p className="text-xs text-[#64748B]">These notes stay on this page only and are cleared when you leave or refresh.</p>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={savedNotes}
                    onChange={(e) => setSavedNotes(e.target.value)}
                    placeholder="Type your notes for this lesson..."
                    className="w-full p-4 border border-[#E5E7EB] rounded-xl text-xs text-[#172033] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-[#172033] text-white rounded-lg text-xs font-semibold hover:bg-[#FF6B35] transition-colors"
                  >
                    Add Note
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {notesList.map((note, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-xs text-[#172033]">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Resources */}
            {activeTab === "resources" && (
              <div className="space-y-3 max-w-xl">
                {currentLesson.resources?.length ? currentLesson.resources.map((resource) => (
                  <a key={resource.url} href={resource.url} download className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-3.5 text-xs text-[#172033] hover:border-[#FF6B35]">
                    <span className="flex items-center gap-3"><FileText className="h-5 w-5 text-[#FF6B35]" /><span><strong>{resource.name}</strong><br />{resource.size}</span></span>
                    <Download className="h-4 w-4 text-[#FF6B35]" />
                  </a>
                )) : <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 text-xs text-[#64748B]">No files are attached to this lesson yet. Continue with the lesson overview.</div>}
              </div>
            )}

            {/* Tab: Q&A */}
            {activeTab === "qa" && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={questionText}
                    onChange={(event) => setQuestionText(event.target.value)}
                    placeholder="Ask a question about this lecture..."
                    className="flex-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button
                    onClick={() => {
                      if (!questionText.trim()) return;
                      setQuestionsByLesson((previous) => ({ ...previous, [currentLesson.id]: [questionText.trim(), ...(previous[currentLesson.id] || [])] }));
                      setQuestionText("");
                      notify({ type: "info", title: "Demo question added", message: "Your question is visible in this session. Instructor delivery requires a backend." });
                    }}
                    className="bg-[#FF6B35] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#E85D2A]"
                  >
                    Post Question
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {questions.length ? questions.map((question, index) => <div key={`${question}-${index}`} className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 text-xs text-[#172033]"><strong>{user.name}</strong><p className="mt-2">{question}</p></div>) : <p className="text-xs text-[#64748B]">No questions yet.</p>}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right: Lesson Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 lg:w-96 border-l border-[#E5E7EB] bg-[#FFFDF9] flex flex-col h-full shrink-0 z-20">
            <div className="p-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172033]">Course Content</h3>
                <p className="text-xs text-[#64748B]">
                  {completedLessonIds.length} / {allFlatLessons.length} completed
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]">
              {course.sections.map((section) => (
                <div key={section.id} className="bg-white">
                  <div className="px-4 py-3 bg-[#F7F8FA] font-bold text-xs text-[#172033]">
                    {section.title}
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    {section.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLesson.id;
                      const isLesCompleted = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            router.push(`/learn/${course.slug}/${lesson.id}`);
                          }}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                            isActive
                              ? "bg-orange-50 border-l-4 border-[#FF6B35]"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              void toggleCompleted(lesson.id);
                            }}
                            className="mt-0.5"
                          >
                            {isLesCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs font-semibold leading-snug line-clamp-2 ${
                                isActive ? "text-[#FF6B35]" : "text-[#172033]"
                              }`}
                            >
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748B]">
                              <span>{actualDurations[lesson.id] || lesson.duration}</span>
                              {lesson.type === "project" && (
                                <span className="bg-orange-100 text-[#FF6B35] px-1.5 py-0.2 rounded font-bold">
                                  Project
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
      {ratingOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setRatingOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-label="Rate this course" className="w-full max-w-md rounded-2xl bg-white p-6 text-[#172033] shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#E85D2A]">Course feedback</p><h2 className="mt-1 text-xl font-bold">How was your learning experience?</h2></div><button type="button" onClick={() => setRatingOpen(false)} aria-label="Close rating" className="rounded-lg p-1 hover:bg-[#F1F5F9]"><X className="h-5 w-5" /></button></div>
          <p className="mt-3 text-sm text-[#64748B]">Your rating helps other learners choose a course. You can update it later.</p>
          <div role="group" aria-label="Rating" className="mt-5 flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRatingValue(value)} aria-label={`${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={ratingValue === value} className="rounded-lg p-1 hover:bg-amber-50"><Star className={`h-8 w-8 ${value <= ratingValue ? "fill-amber-400 text-amber-400" : "text-[#CBD5E1]"}`} /></button>)}</div>
          <label htmlFor="course-rating-comment" className="mt-5 block text-sm font-semibold">Review (optional)</label><textarea id="course-rating-comment" value={ratingComment} onChange={(event) => setRatingComment(event.target.value)} maxLength={2000} rows={4} className="mt-2 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm" placeholder="What helped you learn?" />
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setRatingOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold">Cancel</button><button type="button" onClick={() => void submitRating()} disabled={!ratingValue || reviewBusy} className="rounded-lg bg-[#FF6B35] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{reviewBusy ? "Saving…" : "Save rating"}</button></div>
        </div>
      </div>}
    </div>
  );
}
