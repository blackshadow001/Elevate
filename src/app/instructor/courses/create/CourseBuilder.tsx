"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { mockInstructors } from "@/data/instructors";
import { InstructorCourse, saveInstructorCourse } from "@/lib/instructorCourses";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
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
}

interface BuilderSection {
  id: string;
  title: string;
  lessons: BuilderLesson[];
}

export function CourseBuilder({ initialCourse }: { initialCourse?: InstructorCourse }) {
  const router = useRouter();
  const { notify } = useNotification();
  const courseId = useRef(initialCourse?.id || `local-${crypto.randomUUID()}`);

  // Multi-step: 1. Basic Info -> 2. Thumbnail -> 3. Curriculum -> 4. Video & Content -> 5. Pricing -> 6. Publish
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    title: initialCourse?.title || "Next.js 15 & AI Agents Masterclass",
    shortDescription: initialCourse?.subtitle || "Learn to build production-grade web applications with React 19, Turbopack, and autonomous RAG agents.",
    fullDescription: initialCourse?.description || "A comprehensive journey through modern full-stack web architecture. Master server actions, caching strategies, and agentic workflows.",
    category: initialCourse?.category || "Development",
    subcategory: "Full Stack & AI",
    level: initialCourse?.level || "Intermediate",
    language: initialCourse?.language || "English",
    requirements: initialCourse?.requirements.join("\n") || "Basic JavaScript and React fundamentals",
    whatYouWillLearn: initialCourse?.whatYouWillLearn.join("\n") || "Build scalable Next.js apps\nImplement RAG vectors with LangChain\nDeploy with CI/CD",
  });

  // Thumbnail State
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialCourse?.image || "/courses/course-1.jpg");

  // Curriculum State
  const [sections, setSections] = useState<BuilderSection[]>(initialCourse ? initialCourse.sections.map((section) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, duration: lesson.duration, type: (lesson.type === "video" ? "Video" : lesson.type === "quiz" ? "Quiz" : lesson.type === "project" ? "Assignment" : "Text") as LessonType, videoUrl: lesson.videoUrl, content: lesson.content })),
  })) : [
    {
      id: "sec-1",
      title: "01. Fundamentals & Project Setup",
      lessons: [
        {
          id: "les-1",
          title: "Introduction to Next.js 15 & App Architecture",
          duration: "14 mins",
          type: "Video",
          videoUrl: "/videos/lesson-demo.webm",
          videoFileName: "NextJS15_Intro.mp4",
        },
        {
          id: "les-2",
          title: "Server Actions and Optimistic Mutations",
          duration: "25 mins",
          type: "Video",
          videoUrl: "/videos/lesson-demo.webm",
          videoFileName: "ServerActions_DeepDive.mp4",
        },
      ],
    },
    {
      id: "sec-2",
      title: "02. AI Agents & Vector Retrieval",
      lessons: [
        {
          id: "les-3",
          title: "Building an Autonomous Coding Agent",
          duration: "38 mins",
          type: "Video",
          videoUrl: "/videos/lesson-demo.webm",
          videoFileName: "AgenticRAG.mp4",
        },
        {
          id: "les-4",
          title: "Section Quiz: Core Architectural Patterns",
          duration: "10 mins",
          type: "Quiz",
        },
      ],
    },
  ]);

  // Local preview only; provider-backed uploads are not configured.
  const [activeUploadLesson, setActiveUploadLesson] = useState<string>("les-1");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  // Pricing State
  const [pricing, setPricing] = useState({
    price: initialCourse?.price ?? 1499,
    originalPrice: initialCourse?.originalPrice ?? 2499,
    isFree: initialCourse?.isFree ?? false,
  });
  const [marginPercent, setMarginPercent] = useState(initialCourse?.marginBps === undefined ? 20 : initialCourse.marginBps / 100);
  const basePriceMinor = initialCourse?.pricing?.basePriceMinor;
  const proposedPrice = basePriceMinor === null || basePriceMinor === undefined ? pricing.price :
    (basePriceMinor + Math.round(basePriceMinor * Math.round(marginPercent * 100) / 10000)) / 100;

  // Section & Lesson Handlers
  const handleAddSection = () => {
    const newSection: BuilderSection = {
      id: `sec-new-${crypto.randomUUID()}`,
      title: `0${sections.length + 1}. New Curriculum Module`,
      lessons: [
        {
          id: `les-new-${crypto.randomUUID()}`,
          title: "Lesson 1: Overview",
          duration: "15 mins",
          type: "Video",
          videoUrl: "/videos/lesson-demo.webm",
          videoFileName: "sample_lesson.mp4",
        },
      ],
    };
    setSections((prev) => [...prev, newSection]);
    notify({ type: "info", title: "Section Added", message: "New module added to curriculum." });
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleAddLesson = (sectionId: string) => {
    const newLesson: BuilderLesson = {
      id: `les-new-${crypto.randomUUID()}`,
      title: "New Practical Lesson",
      duration: "20 mins",
      type: "Video",
      videoUrl: "/videos/lesson-demo.webm",
      videoFileName: "lesson_preview.mp4",
    };
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s))
    );
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

  const handleLocalVideoPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["video/mp4", "video/webm"].includes(file.type) || file.size > 200_000_000) {
      notify({ type: "error", title: "Preview unavailable", message: "Choose an MP4 or WebM file no larger than 200 MB." });
      e.target.value = "";
      return;
    }
    setPreviewFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    notify({ type: "info", title: "Local preview ready", message: "This file is only previewed in your browser. It has not been uploaded or saved with the course." });
  };

  const buildCourse = (status: InstructorCourse["status"]): InstructorCourse => {
    const lessons = sections.flatMap((section) => section.lessons);
    const minutes = lessons.reduce((sum, lesson) => sum + (Number.parseInt(lesson.duration, 10) || 0), 0);
    const title = basicInfo.title.trim();
    return {
      id: courseId.current,
      slug: initialCourse?.slug || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${courseId.current.slice(-8)}`,
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
      image: thumbnailPreview.startsWith("blob:") ? "/courses/course-1.jpg" : thumbnailPreview,
      instructor: initialCourse?.instructor || mockInstructors[0],
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
        })),
      })),
      status,
    };
  };

  const handlePublishCourse = async () => {
    const missing = [];
    if (!basicInfo.title.trim()) missing.push("title");
    if (!basicInfo.shortDescription.trim()) missing.push("short description");
    if (!basicInfo.fullDescription.trim()) missing.push("full description");
    if (!basicInfo.whatYouWillLearn.trim()) missing.push("learning outcomes");
    if (!sections.length || sections.some((section) => !section.title.trim() || !section.lessons.length || section.lessons.some((lesson) => !lesson.title.trim()))) missing.push("complete curriculum");
    if (sections.some((section) => section.lessons.some((lesson) => lesson.type === "Video"))) missing.push("hosted video media (provider not connected)");
    if (sections.some((section) => section.lessons.some((lesson) => lesson.type === "Text" && !lesson.content?.trim()))) missing.push("reading lesson content");
    if (sections.some((section) => section.lessons.some((lesson) => ["Quiz", "Assignment", "Resource"].includes(lesson.type)))) missing.push("quiz, assignment, and resource authoring (not connected)");
    if (!Number.isFinite(proposedPrice) || proposedPrice < 0) missing.push("valid proposed pricing");
    if (basePriceMinor !== null && basePriceMinor !== undefined &&
      (Math.round(marginPercent * 100) < (initialCourse?.pricing?.minMarginBps ?? 0) ||
        Math.round(marginPercent * 100) > (initialCourse?.pricing?.maxMarginBps ?? 0))) missing.push("margin within the admin range");
    if (missing.length) {
      notify({ type: "error", title: "Course is incomplete", message: `Add ${missing.join(", ")} before publishing.` });
      return;
    }
    try {
      courseId.current = await saveInstructorCourse(buildCourse("Pending Approval"));
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
            onClick={() => {
              void (async () => {
                try {
                  courseId.current = await saveInstructorCourse(buildCourse("Draft"));
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
                <p className="text-xs text-[#64748B]">1280x720 (16:9 ratio) recommended. JPG or PNG.</p>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172033] hover:bg-[#26344D] text-white text-xs font-bold cursor-pointer">
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setThumbnailPreview(url);
                        notify({ type: "success", title: "Thumbnail Updated", message: "New preview active." });
                      }
                    }}
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
                                lessons: s.lessons.map((l) => (l.id === les.id ? { ...l, type: t } : l)),
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
                    {["Quiz", "Assignment", "Resource"].includes(les.type) && <p className="text-xs text-amber-700">Draft only: authoring and submission for this lesson type are not connected yet.</p>}
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
                  onChange={(e) => setActiveUploadLesson(e.target.value)}
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
              <div className="border-2 border-dashed border-[#E5E7EB] hover:border-[#FF6B35] rounded-3xl p-6 text-center space-y-3 bg-[#F7F8FA]">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#172033]">Preview a local video</div>
                  <div className="text-[11px] text-[#64748B]">MP4 or WebM, up to 200 MB. Upload and publishing require private media storage.</div>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#172033] hover:bg-[#26344D] text-white text-xs font-bold cursor-pointer">
                  <span>Select file to preview</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={handleLocalVideoPreview}
                  />
                </label>
              </div>

              {/* Local preview status, never represented as a completed upload. */}
              <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E5E7EB] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                  <span className="min-w-0 truncate">{previewFileName || "No local file selected"}</span>
                  <span className="shrink-0 text-amber-700">Not uploaded</span>
                </div>
                <p className="text-[11px] text-[#64748B]">The selected file stays in this browser tab only. A draft saves lesson details, not video bytes.</p>
              </div>
            </div>

            {/* Right 7 Cols: Video Preview with Real Player (Requirement 17) */}
            <div className="lg:col-span-7 space-y-2">
              <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider block">
                Instructor Quality & Timeline Verification
              </span>
              <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xl bg-black">
                <VideoPlayer
                  src={previewUrl || "/videos/lesson-demo.webm"}
                  title="Lesson Preview Mode"
                  lessonId="preview-lesson"
                  poster={thumbnailPreview}
                  onLessonEnded={() => notify({ type: "info", title: "Preview Complete", message: "Video timeline reached end." })}
                />
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
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-97 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

