"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { useAuth } from "@/context/AuthContext";
import { InstructorCourse, refreshInstructorCourses, saveInstructorCourse } from "@/lib/instructorCourses";
import { MAX_VIDEO_SIZE_BYTES } from "@/lib/mediaLimits";
import { formatVideoDuration, measureVideoDuration } from "@/lib/videoDuration";
import { type LessonActivity, newLessonActivity } from "@/lib/lessonActivities";
import { LessonActivityEditor } from "@/components/instructor/LessonActivityEditor";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { VideoEditingStudio } from "@/components/instructor/VideoEditingStudio";
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp,
  ArrowDown,
  Check, 
  Plus, 
  Trash2, 
  Upload, 
  Video, 
  FileText, 
  HelpCircle, 
  Briefcase, 
  Paperclip, 
  Sparkles, 
  ImageIcon, 
  Play, 
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Layers
} from "lucide-react";

type LessonType = "Video" | "Text" | "Quiz" | "Assignment" | "Resource";

interface BuilderLesson {
  id: string;
  title: string;
  duration: string;
  type: LessonType;
  videoUrl?: string;
  content?: string;
  videoFileName?: string;
  activity?: LessonActivity | null;
}

interface BuilderSection {
  id: string;
  title: string;
  lessons: BuilderLesson[];
}

function uploadLessonVideo(url: string, file: File, durationSeconds: number,
  onProgress: (percent: number) => void, onProcessing: () => void, signal: AbortSignal): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error("Video upload cancelled.")); return; }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("X-Video-Duration-Seconds", String(durationSeconds));
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && file.size) onProgress(Math.min(100, Math.round(event.loaded / file.size * 100)));
    });
    xhr.upload.addEventListener("load", onProcessing);
    const abort = () => xhr.abort();
    signal.addEventListener("abort", abort, { once: true });
    xhr.addEventListener("loadend", () => signal.removeEventListener("abort", abort));
    xhr.addEventListener("error", () => reject(new Error("The network connection interrupted the upload. Please try again.")));
    xhr.addEventListener("abort", () => reject(new Error("Video upload was cancelled.")));
    xhr.addEventListener("load", () => {
      let result: { data?: { url?: string }; error?: { message?: string } };
      try { result = JSON.parse(xhr.responseText); }
      catch { reject(new Error("The server returned an unreadable upload response.")); return; }
      if (xhr.status < 200 || xhr.status >= 300 || !result.data?.url) {
        reject(new Error(result.error?.message || "Video upload failed.")); return;
      }
      resolve({ url: result.data.url });
    });
    xhr.send(file);
  });
}

function isHttpsUrl(value: string): boolean {
  try { return new URL(value).protocol === "https:"; }
  catch { return false; }
}

export function CourseBuilder({ initialCourse }: { initialCourse?: InstructorCourse }) {
  const router = useRouter();
  const { notify } = useNotification();
  const { user } = useAuth();
  const courseId = useRef(initialCourse?.id || `local-${crypto.randomUUID()}`);
  const courseSlug = useRef(initialCourse?.slug || "");

  // Multi-step: 1. Basic Info -> 2. Thumbnail -> 3. Curriculum -> 4. Video & Content -> 5. Pricing -> 6. Publish
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    title: initialCourse?.title || "",
    shortDescription: initialCourse?.subtitle || "",
    fullDescription: initialCourse?.description || "",
    category: initialCourse?.category || "Development",
    subcategory: "",
    level: initialCourse?.level || "Intermediate",
    language: initialCourse?.language || "English",
    requirements: initialCourse?.requirements.join("\n") || "",
    whatYouWillLearn: initialCourse?.whatYouWillLearn.join("\n") || "",
  });

  // Thumbnail State
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialCourse?.image || "");
  const persistedThumbnail = useRef(initialCourse?.image || "");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  useEffect(() => () => { if (thumbnailPreview.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview); }, [thumbnailPreview]);

  // Curriculum State
  const [sections, setSections] = useState<BuilderSection[]>(initialCourse ? initialCourse.sections.map((section) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, duration: lesson.duration, type: (lesson.type === "video" ? "Video" : lesson.type === "quiz" ? "Quiz" : lesson.type === "project" ? "Assignment" : lesson.type === "resource" ? "Resource" : "Text") as LessonType, videoUrl: lesson.videoUrl, content: lesson.content, activity: lesson.activity })),
  })) : []);

  // A selected file is previewed locally while it streams to private server storage.
  const [activeUploadLesson, setActiveUploadLesson] = useState<string>(
    initialCourse?.sections.flatMap((section) => section.lessons).find((lesson) => lesson.type === "video")?.id || ""
  );
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showVideoStudio, setShowVideoStudio] = useState(false);
  const [videoUploadPercent, setVideoUploadPercent] = useState<number | null>(null);
  const [videoUploadStage, setVideoUploadStage] = useState<"preparing" | "uploading" | "processing" | null>(null);
  const [videoUploadStalled, setVideoUploadStalled] = useState(false);
  const videoUploadLastProgress = useRef(0);
  const videoUploadAbort = useRef<AbortController | null>(null);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    if (videoUploadStage !== "uploading") return;
    const timer = window.setInterval(() => setVideoUploadStalled(Date.now() - videoUploadLastProgress.current > 60_000), 5000);
    return () => window.clearInterval(timer);
  }, [videoUploadStage]);

  // Pricing State
  const [pricing, setPricing] = useState({
    price: initialCourse?.price ?? 0,
    originalPrice: initialCourse?.originalPrice ?? 0,
    isFree: initialCourse?.isFree ?? true,
  });
  const [marginPercent, setMarginPercent] = useState(initialCourse?.marginBps === undefined ? 20 : initialCourse.marginBps / 100);
  const basePriceMinor = initialCourse?.pricing?.basePriceMinor;
  const proposedPrice = basePriceMinor === null || basePriceMinor === undefined ? pricing.price :
    (basePriceMinor + Math.round(basePriceMinor * Math.round(marginPercent * 100) / 10000)) / 100;

  // Section & Lesson Handlers
  const handleAddSection = () => {
    const newSection: BuilderSection = {
      id: `sec-new-${crypto.randomUUID()}`,
      title: "",
      lessons: [],
    };
    setSections((prev) => [...prev, newSection]);
    notify({ type: "info", title: "Section Added", message: "Enter a section title to continue." });
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleAddLesson = (sectionId: string) => {
    const newLesson: BuilderLesson = {
      id: `les-new-${crypto.randomUUID()}`,
      title: "",
      duration: "1 mins",
      type: "Video",
    };
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s))
    );
    setActiveUploadLesson((current) => current || newLesson.id);
  };

  const handleDeleteLesson = (sectionId: string, lessonId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      )
    );
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    setSections((previous) => {
      const index = previous.findIndex((section) => section.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const moveLesson = (sectionId: string, lessonId: string, direction: -1 | 1) => {
    setSections((previous) => previous.map((section) => {
      if (section.id !== sectionId) return section;
      const index = section.lessons.findIndex((lesson) => lesson.id === lessonId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= section.lessons.length) return section;
      const lessons = [...section.lessons];
      [lessons[index], lessons[target]] = [lessons[target], lessons[index]];
      return { ...section, lessons };
    }));
  };

  const buildCourse = (status: InstructorCourse["status"]): InstructorCourse => {
    const lessons = sections.flatMap((section) => section.lessons);
    const minutes = lessons.reduce((sum, lesson) => sum + (Number.parseInt(lesson.duration, 10) || 0), 0);
    const title = basicInfo.title.trim();
    return {
      id: courseId.current,
      slug: courseSlug.current || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${courseId.current.slice(-8)}`,
      title,
      subtitle: basicInfo.shortDescription.trim(),
      description: basicInfo.fullDescription.trim(),
      category: basicInfo.category,
      level: basicInfo.level as InstructorCourse["level"],
      language: basicInfo.language as InstructorCourse["language"],
      price: basePriceMinor === null || basePriceMinor === undefined ? pricing.price : proposedPrice,
      ...(basePriceMinor === null || basePriceMinor === undefined ? {} : { marginBps: Math.round(marginPercent * 100) }),
      originalPrice: proposedPrice,
      isFree: proposedPrice === 0,
      rating: initialCourse?.rating || 0,
      ratingCount: initialCourse?.ratingCount || 0,
      studentsCount: initialCourse?.studentsCount || 0,
      duration: minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} mins`,
      totalLessons: lessons.length,
      image: thumbnailPreview.startsWith("blob:") ? persistedThumbnail.current : thumbnailPreview,
      instructor: initialCourse?.instructor || { id: user.id, name: user.name, avatar: user.avatar, role: "Instructor", bio: "", rating: 0, studentsCount: 0, coursesCount: 0 },
      updatedAt: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      whatYouWillLearn: basicInfo.whatYouWillLearn.split("\n").map((item) => item.trim()).filter(Boolean),
      requirements: basicInfo.requirements.split("\n").map((item) => item.trim()).filter(Boolean),
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title.trim(),
        lessons: section.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title.trim(),
          duration: lesson.duration,
          type: lesson.type === "Video" ? "video" : lesson.type === "Quiz" ? "quiz" : lesson.type === "Assignment" ? "project" : "reading",
          videoUrl: lesson.type === "Video" ? lesson.videoUrl : undefined,
          content: lesson.type === "Text" ? lesson.content?.trim() : undefined,
          activity: lesson.type === "Quiz" || lesson.type === "Assignment" || lesson.type === "Resource" ? lesson.activity : undefined,
        })),
      })),
      status,
    };
  };

  const saveDraft = async () => {
    const previousSections = sections;
    const saved = await saveInstructorCourse(buildCourse("Draft"));
    courseId.current = saved.id;
    courseSlug.current = saved.slug;
    const mappedActive = previousSections.flatMap((section, sectionIndex) => section.lessons.map((lesson, lessonIndex) => ({
      oldId: lesson.id, newId: saved.sections[sectionIndex]?.lessons[lessonIndex]?.id || lesson.id,
    }))).find((lesson) => lesson.oldId === activeUploadLesson)?.newId || activeUploadLesson;
    setSections(previousSections.map((section, sectionIndex) => ({
      ...section,
      id: saved.sections[sectionIndex]?.id || section.id,
      lessons: section.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        id: saved.sections[sectionIndex]?.lessons[lessonIndex]?.id || lesson.id,
        videoUrl: saved.sections[sectionIndex]?.lessons[lessonIndex]?.mediaAssetId
          ? `/api/media/${saved.sections[sectionIndex].lessons[lessonIndex].mediaAssetId}/stream` : lesson.videoUrl,
      })),
    })));
    setActiveUploadLesson(mappedActive);
    return { saved, lessonId: mappedActive };
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000) {
      notify({ type: "error", title: "Thumbnail not uploaded", message: "Choose a JPG, PNG or WebP image no larger than 5 MB." });
      return;
    }
    setThumbnailPreview(URL.createObjectURL(file));
    setUploadingThumbnail(true);
    try {
      const { saved } = await saveDraft();
      const response = await fetch(`/api/instructor/courses/${encodeURIComponent(saved.id)}/thumbnail`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": file.type }, body: file,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Thumbnail upload failed.");
      persistedThumbnail.current = result.data.url as string;
      setThumbnailPreview(persistedThumbnail.current);
      await refreshInstructorCourses();
      notify({ type: "success", title: "Thumbnail uploaded", message: initialCourse?.status === "Pending Approval" || initialCourse?.status === "Approved"
        ? "The new image is saved. Submit the course again for admin review." : "The image is saved and will appear on the course card." });
    } catch (error) {
      setThumbnailPreview(persistedThumbnail.current);
      notify({ type: "error", title: "Thumbnail not uploaded", message: error instanceof Error ? error.message : "Please try again." });
    } finally { setUploadingThumbnail(false); }
  };

  const uploadSelectedVideo = async (file: File, editedDurationSeconds?: number) => {
    if (!["video/mp4", "video/webm"].includes(file.type) || file.size > MAX_VIDEO_SIZE_BYTES) {
      notify({ type: "error", title: "Upload unavailable", message: "Choose an MP4 or WebM file no larger than 1 GB." });
      return;
    }
    if (!sections.some((section) => section.lessons.some((lesson) => lesson.id === activeUploadLesson && lesson.type === "Video"))) {
      notify({ type: "error", title: "Select a video lesson", message: "Choose the lesson that should receive this video." });
      return;
    }
    setPreviewFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadingVideo(true);
    setVideoUploadPercent(0);
    setVideoUploadStage("preparing");
    setVideoUploadStalled(false);
    const uploadController = new AbortController();
    videoUploadAbort.current = uploadController;
    try {
      const durationSeconds = editedDurationSeconds ? Math.max(1, Math.round(editedDurationSeconds)) : await measureVideoDuration(file);
      const { saved, lessonId } = await saveDraft();
      videoUploadLastProgress.current = Date.now();
      setVideoUploadStage("uploading");
      const result = await uploadLessonVideo(`/api/instructor/courses/${encodeURIComponent(saved.id)}/lessons/${encodeURIComponent(lessonId)}/media`,
        file, durationSeconds, (percent) => { videoUploadLastProgress.current = Date.now(); setVideoUploadStalled(false); setVideoUploadPercent(percent); },
        () => { setVideoUploadPercent(100); setVideoUploadStage("processing"); }, uploadController.signal);
      const hostedUrl = result.url;
      setSections((previous) => previous.map((section) => ({ ...section, lessons: section.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, videoUrl: hostedUrl, duration: formatVideoDuration(durationSeconds) } : lesson) })));
      setVideoUploadPercent(100);
      setVideoUploadStage(null);
      notify({ type: "success", title: "Video uploaded", message: "The video is saved privately with this lesson. You can now submit the completed course for review." });
    } catch (error) {
      setVideoUploadPercent(null);
      setVideoUploadStage(null);
      notify({ type: "error", title: "Video not uploaded", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
        videoUploadAbort.current = null;
      setUploadingVideo(false);
    }
  };

  const handleLocalVideoPreview = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadSelectedVideo(file);
  };

  const handlePublishCourse = async () => {
    if (uploadingThumbnail || uploadingVideo) {
      notify({ type: "info", title: "Upload in progress", message: "Wait for the upload to finish before submitting the course." });
      return;
    }
    const missing = [];
    if (!basicInfo.title.trim()) missing.push("title");
    if (!basicInfo.shortDescription.trim()) missing.push("short description");
    if (!basicInfo.fullDescription.trim()) missing.push("full description");
    if (!basicInfo.whatYouWillLearn.trim()) missing.push("learning outcomes");
    if (!sections.length || sections.some((section) => !section.title.trim() || !section.lessons.length || section.lessons.some((lesson) => !lesson.title.trim()))) missing.push("complete curriculum");
    if (sections.some((section) => section.lessons.some((lesson) => lesson.type === "Video" && !lesson.videoUrl?.startsWith("/api/media/")))) missing.push("uploaded video for each video lesson");
    if (sections.some((section) => section.lessons.some((lesson) => lesson.type === "Text" && !lesson.content?.trim()))) missing.push("reading lesson content");
    if (sections.some((section) => section.lessons.some((lesson) => lesson.type === "Quiz" &&
      (lesson.activity?.kind !== "quiz" || !lesson.activity.questions.length || lesson.activity.questions.some((question) =>
        !question.prompt.trim() || question.options.some((option) => !option.trim()) || question.correctIndex === undefined))))) missing.push("complete quiz questions and answers");
    if (sections.some((section) => section.lessons.some((lesson) => lesson.type === "Assignment" &&
      (lesson.activity?.kind !== "assignment" || !lesson.activity.instructions.trim())))) missing.push("assignment instructions");
    if (sections.some((section) => section.lessons.some((lesson) => lesson.type === "Resource" &&
      (lesson.activity?.kind !== "resource" || !lesson.activity.label.trim() || !isHttpsUrl(lesson.activity.url))))) missing.push("resource names and HTTPS links");
    if (!Number.isFinite(proposedPrice) || proposedPrice < 0) missing.push("valid proposed pricing");
    if (basePriceMinor !== null && basePriceMinor !== undefined &&
      (Math.round(marginPercent * 100) < (initialCourse?.pricing?.minMarginBps ?? 0) ||
        Math.round(marginPercent * 100) > (initialCourse?.pricing?.maxMarginBps ?? 0))) missing.push("margin within the admin range");
    if (missing.length) {
      notify({ type: "error", title: "Course is incomplete", message: `Add ${missing.join(", ")} before publishing.` });
      return;
    }
    try {
      courseId.current = (await saveInstructorCourse(buildCourse("Pending Approval"))).id;
      notify({ type: "success", title: "Submitted for review", message: `"${basicInfo.title}" is awaiting admin approval and publication.` });
      router.push("/instructor/courses");
    } catch (error) {
      notify({ type: "error", title: "Submission failed", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Thumbnail" },
    { num: 3, label: "Curriculum" },
    { num: 4, label: "Video Preview" },
    { num: 5, label: "Pricing" },
    { num: 6, label: "Publish" },
  ];
  const selectedVideo = sections.flatMap((section) => section.lessons).find((lesson) => lesson.id === activeUploadLesson);
  const videoIsHosted = Boolean(selectedVideo?.videoUrl?.startsWith("/api/media/"));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Courses</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Course Studio Builder
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={uploadingVideo || uploadingThumbnail}
            onClick={() => {
              void (async () => {
                try {
                  await saveDraft();
                  notify({ type: "success", title: "Draft saved", message: "This draft is saved to your instructor account." });
                } catch (error) {
                  notify({ type: "error", title: "Draft not saved", message: error instanceof Error ? error.message : "Please try again." });
                }
              })();
            }}
            className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors cursor-pointer"
          >
            Save Draft
          </button>
        </div>
      </div>

      {/* Step Progress Bar (Requirement 12) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-1">
          {steps.map((st, i) => (
            <React.Fragment key={st.num}>
              <button
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center gap-2.5 shrink-0 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentStep === st.num
                    ? "text-[#FF6B35] font-extrabold"
                    : currentStep > st.num
                    ? "text-[#16A34A] font-semibold"
                    : "text-[#94A3B8] font-medium"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === st.num
                      ? "bg-[#FF6B35] text-white shadow-xs"
                      : currentStep > st.num
                      ? "bg-emerald-100 text-[#16A34A]"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                </div>
                <span className="text-xs whitespace-nowrap">{st.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-0.5 mx-2 bg-[#E5E7EB]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ========================================================
          STEP 1: BASIC INFORMATION (Requirement 13)
         ======================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-[#172033]">1. Course Information</h2>

          <div className="space-y-4 max-w-3xl">
            <div className="space-y-1.5">
              <label htmlFor="course-builder-title" className="block text-xs font-bold uppercase text-[#172033]">Course Title</label>
              <input
                id="course-builder-title"
                type="text"
                value={basicInfo.title}
                onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Short Subtitle / Description</label>
              <input
                type="text"
                value={basicInfo.shortDescription}
                onChange={(e) => setBasicInfo({ ...basicInfo, shortDescription: e.target.value })}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Category</label>
                <select
                  value={basicInfo.category}
                  onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
                >
                  <option>Development</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>AI & ML</option>
                  <option>Cloud & DevOps</option>
                  <option>Cybersecurity</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Level</label>
                <select
                  value={basicInfo.level}
                  onChange={(e) => setBasicInfo({ ...basicInfo, level: e.target.value as InstructorCourse["level"] })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Language</label>
                <select
                  value={basicInfo.language}
                  onChange={(e) => setBasicInfo({ ...basicInfo, language: e.target.value as InstructorCourse["language"] })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
                >
                  <option>English</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Full Description</label>
              <textarea
                rows={3}
                value={basicInfo.fullDescription}
                onChange={(e) => setBasicInfo({ ...basicInfo, fullDescription: e.target.value })}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3.5 text-sm text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold cursor-pointer"
            >
              <span>Next: Course Thumbnail</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: COURSE THUMBNAIL (Requirement 14)
         ======================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-[#172033]">2. Course Thumbnail</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-[#E5E7EB] hover:border-[#FF6B35] rounded-3xl p-8 text-center space-y-4 bg-[#F7F8FA] transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#172033]">Drop course thumbnail here</h4>
                <p className="text-xs text-[#64748B]">1280x720 (16:9 ratio) recommended. JPG, PNG or WebP, up to 5 MB.</p>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172033] hover:bg-[#26344D] text-white text-xs font-bold cursor-pointer">
                  <span>{uploadingThumbnail ? "Uploading…" : "Choose Image"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingThumbnail || uploadingVideo}
                    className="hidden"
                    onChange={(e) => { void handleThumbnailUpload(e); }}
                  />
                </label>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider">
                Marketplace Card Preview
              </span>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-[#E5E7EB] bg-slate-900">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#FF6B35] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Preview
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold cursor-pointer"
            >
              <span>Next: Curriculum Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: CURRICULUM BUILDER (Requirement 15)
         ======================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">3. Curriculum & Modules</h2>
              <p className="text-xs text-[#64748B]">Organize sections and lessons for your students.</p>
            </div>
            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172033] text-white text-xs font-bold hover:bg-[#26344D] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module / Section</span>
            </button>
          </div>

          <div className="space-y-6">
            {sections.map((sec, secIdx) => (
              <div
                key={sec.id}
                className="bg-[#F7F8FA] rounded-2xl border border-[#E5E7EB] p-5 space-y-4"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-xs font-bold text-[#FF6B35] bg-white px-2 py-1 rounded-lg border border-[#E5E7EB]">
                      Sec {secIdx + 1}
                    </span>
                    <input
                      type="text"
                      aria-label={`Section ${secIdx + 1} title`}
                      value={sec.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSections((prev) =>
                          prev.map((s) => (s.id === sec.id ? { ...s, title: val } : s))
                        );
                      }}
                      className="flex-1 bg-transparent font-bold text-sm text-[#172033] focus:bg-white focus:outline-none px-2 py-1 rounded-lg border border-transparent focus:border-[#FF6B35]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveSection(sec.id, -1)} disabled={secIdx === 0} aria-label={`Move section ${sec.title} up`} className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B35] disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveSection(sec.id, 1)} disabled={secIdx === sections.length - 1} aria-label={`Move section ${sec.title} down`} className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B35] disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    <button
                      type="button"
                      onClick={() => handleAddLesson(sec.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] bg-white px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#FF6B35] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lesson</span>
                    </button>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg cursor-pointer"
                        title="Delete Section"
                        aria-label={`Delete section ${sec.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lessons List in Section */}
                <div className="space-y-2 pl-4 border-l-2 border-[#E5E7EB]">
                  {sec.lessons.map((les, lessonIndex) => (
                    <div
                      key={les.id}
                      className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] space-y-3"
                    >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {les.type === "Video" && <Video className="w-4 h-4 text-blue-500 shrink-0" />}
                        {les.type === "Text" && <FileText className="w-4 h-4 text-slate-500 shrink-0" />}
                        {les.type === "Quiz" && <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                        {les.type === "Assignment" && <Briefcase className="w-4 h-4 text-purple-500 shrink-0" />}
                        {les.type === "Resource" && <Paperclip className="w-4 h-4 text-emerald-500 shrink-0" />}

                        <input
                          type="text"
                          aria-label={`Lesson ${lessonIndex + 1} title`}
                          value={les.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections((prev) =>
                              prev.map((s) => ({
                                ...s,
                                lessons: s.lessons.map((l) => (l.id === les.id ? { ...l, title: val } : l)),
                              }))
                            );
                          }}
                          className="flex-1 bg-transparent text-xs font-semibold text-[#172033] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button type="button" onClick={() => moveLesson(sec.id, les.id, -1)} disabled={lessonIndex === 0} aria-label={`Move lesson ${les.title} up`} className="p-1 rounded text-slate-500 hover:text-[#FF6B35] disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => moveLesson(sec.id, les.id, 1)} disabled={lessonIndex === sec.lessons.length - 1} aria-label={`Move lesson ${les.title} down`} className="p-1 rounded text-slate-500 hover:text-[#FF6B35] disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                        <select
                          value={les.type}
                          onChange={(e) => {
                            const t = e.target.value as LessonType;
                            setSections((prev) =>
                              prev.map((s) => ({
                                ...s,
                                lessons: s.lessons.map((l) => (l.id === les.id ? { ...l, type: t,
                                  activity: t === "Quiz" || t === "Assignment" || t === "Resource" ? newLessonActivity(t) : null } : l)),
                              }))
                            );
                          }}
                          className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-2 py-1 text-[11px] font-bold text-[#172033]"
                        >
                          <option>Video</option>
                          <option>Text</option>
                          <option>Quiz</option>
                          <option>Assignment</option>
                          <option>Resource</option>
                        </select>

                        {les.type === "Video" && <button
                          type="button"
                          onClick={() => {
                            setActiveUploadLesson(les.id);
                            setCurrentStep(4);
                          }}
                          className="text-[11px] font-bold text-[#FF6B35] hover:underline px-2 py-1"
                        >
                          Manage Video →
                        </button>}

                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(sec.id, les.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded cursor-pointer"
                          aria-label={`Delete lesson ${les.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {les.type === "Text" && <textarea value={les.content || ""} onChange={(event) => setSections((previous) => previous.map((section) => ({ ...section, lessons: section.lessons.map((lesson) => lesson.id === les.id ? { ...lesson, content: event.target.value } : lesson) })))} aria-label={`Reading content for ${les.title}`} placeholder="Write the reading lesson content" rows={3} className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 text-xs text-[#172033]" />}
                    {(les.type === "Quiz" || les.type === "Assignment" || les.type === "Resource") &&
                      <LessonActivityEditor activity={les.activity || newLessonActivity(les.type)}
                        onChange={(activity) => setSections((previous) => previous.map((section) => ({ ...section,
                          lessons: section.lessons.map((lesson) => lesson.id === les.id ? { ...lesson, activity } : lesson) })))} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold cursor-pointer"
            >
              <span>Next: Video Upload & Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 4: VIDEO UPLOAD & PREVIEW (Requirement 16 & 17)
         ======================================================== */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">4. Lesson Video Management & Verification</h2>
              <p className="text-xs text-[#64748B]">
                Upload high-definition lesson recordings and test seeking, playback, and audio with the embedded video player.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Video Upload Box */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Select Lesson to Edit Video</label>
                <select
                  value={activeUploadLesson}
                  disabled={uploadingVideo}
                  onChange={(e) => { setActiveUploadLesson(e.target.value); setPreviewFileName(""); setPreviewUrl(""); }}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#172033]"
                >
                  {sections.flatMap((s) =>
                    s.lessons.filter((l) => l.type === "Video").map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Upload Box (Requirement 16) */}
              <button type="button" disabled={uploadingVideo || !activeUploadLesson} onClick={() => setShowVideoStudio(true)}
                className="w-full rounded-2xl border border-[#FF6B35] bg-orange-50 px-5 py-3 text-sm font-bold text-[#172033] hover:bg-orange-100 disabled:opacity-50">
                Open Video Studio · record, cut, caption and overlay
              </button>
              <div className="border-2 border-dashed border-[#E5E7EB] hover:border-[#FF6B35] rounded-3xl p-6 text-center space-y-3 bg-[#F7F8FA]">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#172033]">Upload a lesson video</div>
                  <div className="text-[11px] text-[#64748B]">MP4 or WebM, up to 1 GB per video. Saved privately on this server.</div>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#172033] hover:bg-[#26344D] text-white text-xs font-bold cursor-pointer">
                  <span>{uploadingVideo ? "Uploading video…" : "Select file to upload"}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    disabled={uploadingVideo}
                    onChange={handleLocalVideoPreview}
                  />
                </label>
                {videoUploadPercent !== null && <div className="pt-1 text-left" role="status" aria-live="polite">
                  <div className="mb-1 flex justify-between text-[11px] font-bold text-[#172033]">
                    <span>{videoUploadStage === "preparing" ? "Preparing lesson…" : videoUploadStage === "processing" ? "Upload sent; saving on server…" : videoUploadStage === "uploading" ? "Uploading video…" : "Upload complete"}</span>
                    <span>{videoUploadPercent}%</span>
                  </div>
                  <progress max={100} value={videoUploadPercent} aria-label="Video upload progress" className="h-2 w-full accent-[#FF6B35]" />
                  {videoUploadStalled && videoUploadStage === "uploading" && <p className="mt-2 text-xs text-amber-700">No upload progress for over a minute. Check your connection; you can cancel and try again.</p>}
                </div>}
                {uploadingVideo && <button type="button" onClick={() => videoUploadAbort.current?.abort()}
                  className="text-xs font-semibold text-red-600 hover:underline">Cancel upload</button>}
              </div>

              {/* A local preview remains distinct from a completed server upload. */}
              <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E5E7EB] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                  <span className="min-w-0 truncate">{previewFileName || (videoIsHosted ? "Saved lesson video" : "No local file selected")}</span>
                  <span className={`shrink-0 ${videoIsHosted ? "text-emerald-700" : "text-amber-700"}`}>{uploadingVideo ? "Uploading…" : videoIsHosted ? "Uploaded" : "Not uploaded"}</span>
                </div>
                <p className="text-[11px] text-[#64748B]">{videoIsHosted ? "This lesson video is stored on the server and available only to authorized viewers." : "Wait for Upload complete before submitting. A local preview alone is not saved with the lesson."}</p>
              </div>
            </div>

            {/* Right 7 Cols: Video Preview with Real Player (Requirement 17) */}
            <div className="lg:col-span-7 space-y-2">
              <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider block">
                Instructor Quality & Timeline Verification
              </span>
              <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xl bg-black">
                {previewUrl || selectedVideo?.videoUrl ? <VideoPlayer
                  key={previewUrl || selectedVideo?.videoUrl || "no-video"}
                  allowSeeking
                  src={previewUrl || selectedVideo?.videoUrl}
                  title="Lesson Preview Mode"
                  lessonId="preview-lesson"
                  poster={thumbnailPreview}
                  onLessonEnded={() => notify({ type: "info", title: "Preview Complete", message: "Video timeline reached end." })}
                /> : <div className="flex aspect-video items-center justify-center text-sm text-white">Upload a lesson video to preview it.</div>}
              </div>
              <p className="text-[11px] text-[#64748B] italic pt-1">
                Verify seeking, playback speeds (1x–1.5x), and audio before publishing this lecture. Captions require a configured provider or uploaded subtitle track.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold cursor-pointer"
            >
              <span>Next: Course Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 5: PRICING (Requirement 12)
         ======================================================== */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-[#172033]">5. Pricing Proposal</h2>
          <p className="text-xs text-[#64748B]">The admin sets the official base price and allowed margin. Your proposal is reviewed before publication. Margin is added to the base price; it is not a tutor payout.</p>

          <div className="max-w-xl space-y-5">
            {basePriceMinor !== null && basePriceMinor !== undefined ? <div className="space-y-2 rounded-xl bg-[#F7F8FA] p-4 text-sm"><p>Admin base: <strong>₹{(basePriceMinor / 100).toFixed(2)}</strong></p><p>Allowed margin: {(initialCourse?.pricing?.minMarginBps ?? 0) / 100}%–{(initialCourse?.pricing?.maxMarginBps ?? 0) / 100}%</p><label htmlFor="tutor-margin" className="block text-xs font-bold">Your proposed margin %</label><input id="tutor-margin" type="number" min={(initialCourse?.pricing?.minMarginBps ?? 0) / 100} max={(initialCourse?.pricing?.maxMarginBps ?? 0) / 100} step="0.01" value={marginPercent} onChange={(event) => setMarginPercent(Number(event.target.value))} className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2" /><p>Proposed final price: <strong>₹{proposedPrice.toFixed(2)}</strong></p></div> : <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Proposed selling price (INR ₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="number"
                  value={pricing.price}
                  onChange={(e) => setPricing({ ...pricing, price: Number(e.target.value) })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-[#172033] focus:bg-white focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
            </div>}

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold cursor-pointer"
            >
              <span>Next: Preview & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 6: PREVIEW & PUBLISH (Requirement 12 & 32)
         ======================================================== */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#172033]">6. Review & Submit</h2>
            <p className="text-xs text-[#64748B]">Verify your curriculum, then send it to the admin approval queue.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-4 max-w-3xl">
            <div className="flex items-center gap-4">
              <img
                src={thumbnailPreview}
                alt="Course Thumbnail"
                className="w-24 h-16 rounded-xl object-cover border border-[#E5E7EB]"
              />
              <div>
                <span className="text-[10px] font-bold uppercase text-[#FF6B35]">{basicInfo.category}</span>
                <h3 className="text-base font-bold text-[#172033]">{basicInfo.title}</h3>
                <p className="text-xs text-[#64748B] line-clamp-1">{basicInfo.shortDescription}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-200">
              <div>
                <span className="text-[#64748B]">Modules:</span>{" "}
                <strong className="text-[#172033]">{sections.length}</strong>
              </div>
              <div>
                <span className="text-[#64748B]">Lessons:</span>{" "}
                <strong className="text-[#172033]">{sections.reduce((acc, s) => acc + s.lessons.length, 0)}</strong>
              </div>
              <div>
                <span className="text-[#64748B]">Price:</span>{" "}
                <strong className="text-[#172033]">₹{proposedPrice.toFixed(2)} proposed</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handlePublishCourse}
              disabled={uploadingVideo}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-97 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>
      )}
      {showVideoStudio && <VideoEditingStudio onClose={() => setShowVideoStudio(false)} onExport={(file, durationSeconds) => {
        setShowVideoStudio(false);
        void uploadSelectedVideo(file, durationSeconds);
      }} />}
    </div>
  );
}

