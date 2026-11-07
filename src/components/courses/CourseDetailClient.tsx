"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Star, 
  Clock, 
  BookOpen, 
  Globe2, 
  CheckCircle2, 
  PlayCircle, 
  Heart, 
  ShieldCheck, 
  Award, 
  FileText,
  ChevronDown,
  Share2,
  ArrowRight,
  Sparkles,
  MonitorPlay,
  Layers3,
  X
} from "lucide-react";
import { Course } from "@/types";
import { formatINR } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { EnrollmentModal } from "@/components/courses/EnrollmentModal";
import { PaidCheckoutModal } from "@/components/courses/PaidCheckoutModal";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { CourseReviews } from "@/components/courses/CourseReviews";
import { CourseCard } from "@/components/courses/CourseCard";
import { enrollCourse, useLearningState } from "@/lib/learningState";
import { useAuth } from "@/context/AuthContext";

interface CourseDetailClientProps {
  course: Course;
  relatedCourses?: Course[];
}

export function CourseDetailClient({ course, relatedCourses = [] }: CourseDetailClientProps) {
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { notify } = useNotification();
  const learningState = useLearningState();
  const { isAuthenticated, isReady } = useAuth();
  const isEnrolled = learningState.enrolledCourseIds.includes(course.id);
  const wishlisted = isWishlisted(course.id);

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "instructor" | "reviews">("overview");
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewLesson = course.sections.flatMap((section) => section.lessons).find((lesson) => lesson.type === "video" && lesson.isPreview && lesson.videoUrl);

  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [course.sections[0]?.id || ""]: true,
  });

  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      notify({
        type: "info",
        title: "Link copied",
        message: "Course link copied to clipboard",
      });
    }
  };

  const firstLessonId = course.sections[0]?.lessons[0]?.id || "les-1";

  const handleConfirmEnrollment = async () => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setEnrollModalOpen(false);
      router.push("/login");
      return;
    }
    try {
      await enrollCourse(course);
      setEnrollModalOpen(false);
      notify({ type: "success", title: "Enrollment ready", message: `${course.title} is now in My Learning.` });
      router.push(`/learn/${course.slug}/${firstLessonId}`);
    } catch (error) {
      notify({ type: "error", title: "Enrollment unavailable", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const discountPercent = Math.round(
    course.originalPrice > 0 ? ((course.originalPrice - course.price) / course.originalPrice) * 100 : 0
  );
  const quickFacts = [
    { label: "Level", value: course.level, icon: Layers3 },
    { label: "Language", value: course.language, icon: Globe2 },
    { label: "Lessons", value: String(course.totalLessons), icon: BookOpen },
    { label: "Total length", value: course.duration, icon: Clock },
  ];
  const faqs = [
    { question: "What language is this course taught in?", answer: `This course is taught in ${course.language}.` },
    { question: "What should I know before starting?", answer: course.requirements.length
      ? course.requirements.join(" · ") : "No prerequisites have been listed for this course. Review the lessons to see the topics covered." },
    { question: "Can I track my progress?", answer: "Yes. Your completed lessons and course progress are saved in My Learning." },
    { question: "Is there a completion certificate?", answer: "A certificate is issued when you complete all required course lessons and activities." },
  ];

  return (
    <>
      <EnrollmentModal
        isOpen={enrollModalOpen && course.price === 0}
        onClose={() => setEnrollModalOpen(false)}
        onConfirm={handleConfirmEnrollment}
        courseTitle={course.title}
        coursePrice={course.price}
      />
      <PaidCheckoutModal open={enrollModalOpen && course.price > 0} onClose={() => setEnrollModalOpen(false)}
        courseId={course.id} courseTitle={course.title} displayedPrice={course.price} />

      {/* Shared course landing hero, populated from the published course. */}
      <section className="relative overflow-hidden bg-[#172033] py-12 text-white lg:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#FF6B35]/20 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href={`/courses?category=${encodeURIComponent(course.category)}`} className="hover:text-white transition-colors">
                  {course.category}
                </Link>
                <span>/</span>
                <span className="text-white truncate max-w-xs">{course.title}</span>
              </nav>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
                <span className="rounded-full border border-orange-300/35 bg-orange-300/10 px-3 py-1.5">{course.category}</span>
                <span className="rounded-full border border-white/20 px-3 py-1.5">{course.level}</span>
              </div>
              <h1 className="max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {course.title}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
                {course.subtitle}
              </p>

              {/* Ratings & Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                {course.isBestseller && (
                  <span className="bg-[#FF6B35] text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    Bestseller
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span>{course.ratingCount ? course.rating.toFixed(1) : "New"}</span>
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-[#94A3B8] font-normal underline">
                    ({course.ratingCount ? `${course.ratingCount.toLocaleString()} ratings` : "No reviews yet"})
                  </span>
                </div>

                <span className="text-[#94A3B8]">·</span>
                <span className="text-white font-medium">
                  {course.studentsCount.toLocaleString()} students
                </span>
              </div>

              {/* Instructor & Meta */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#CBD5E1]">
                <div className="flex items-center gap-2">
                  {course.instructor.avatar ? <img src={course.instructor.avatar} alt="" className="h-7 w-7 rounded-full border border-white/20 object-cover" /> : <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-xs font-bold text-[#C96114]">{course.instructor.name.charAt(0)}</span>}
                  <span>Created by <strong className="text-white font-semibold underline">{course.instructor.name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-[#FF6B35]" />
                  <span>Language: {course.language}</span>
                </div>
                <div>Last updated: {course.updatedAt}</div>
              </div>
              <a href="#enroll" className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition-colors hover:bg-[#E85D2A] lg:hidden">
                {isEnrolled ? "Continue learning" : course.price > 0 ? "Explore enrollment" : "Start learning"} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/30">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#0F172A]"><CourseThumbnail category={course.category} title={course.title} imageUrl={course.image} className="h-full w-full" /></div>
                <p className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-[#E2E8F0]"><MonitorPlay className="h-4 w-4 text-[#FF6B35]" /> Learn at your own pace, lesson by lesson</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Course at a glance" className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
          {quickFacts.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] px-4 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#E85D2A]"><Icon className="h-5 w-5" /></span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{label}</p><p className="text-sm font-bold text-[#172033]">{value}</p></div></div>)}
        </div>
      </section>

      {/* Course content and enrollment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Content Column */}
          <div id="course-content" className="order-2 space-y-10 lg:order-1 lg:col-span-8">
            <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#E85D2A]"><Sparkles className="h-4 w-4" /> Your learning path</div>
              <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight text-[#172033] sm:text-3xl">What you will explore</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#64748B]">Follow the published lessons in order, practise the activities, and keep your progress in one place.</p>
              {course.whatYouWillLearn.length > 0 && <div className="mt-7 grid gap-3 sm:grid-cols-2">{course.whatYouWillLearn.slice(0, 6).map((outcome, index) => <div key={`${outcome}-${index}`} className="flex gap-3 rounded-2xl bg-[#FFF7F1] p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#E85D2A]" /><span className="text-sm font-medium leading-relaxed text-[#172033]">{outcome}</span></div>)}</div>}
            </section>
            {course.sections.length > 0 && <section aria-labelledby="course-path-title"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#E85D2A]">Step by step</p><h2 id="course-path-title" className="mt-2 text-2xl font-extrabold text-[#172033]">Inside the course</h2></div><div className="grid gap-4 sm:grid-cols-2">{course.sections.slice(0, 4).map((section, index) => <article key={section.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><span className="text-xs font-bold uppercase tracking-wide text-[#E85D2A]">Module {String(index + 1).padStart(2, "0")}</span><h3 className="mt-2 text-base font-bold text-[#172033]">{section.title}</h3><p className="mt-2 text-xs text-[#64748B]">{section.lessons.length} {section.lessons.length === 1 ? "lesson" : "lessons"}</p>{section.lessons[0] && <p className="mt-4 border-t border-[#E5E7EB] pt-3 text-xs leading-relaxed text-[#475569]">Starts with {section.lessons[0].title}</p>}</article>)}</div>{course.sections.length > 4 && <p className="mt-3 text-xs text-[#64748B]">Plus {course.sections.length - 4} more {course.sections.length - 4 === 1 ? "module" : "modules"} in the curriculum.</p>}</section>}
            {/* Animated Tab Bar */}
            <div role="tablist" aria-label="Course details" className="flex items-center gap-6 overflow-x-auto border-b border-[#E5E7EB] text-sm font-bold text-[#64748B]">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "overview"}
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
                role="tab"
                aria-selected={activeTab === "curriculum"}
                onClick={() => setActiveTab("curriculum")}
                className={`pb-3 transition-colors ${
                  activeTab === "curriculum"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "hover:text-[#172033]"
                }`}
              >
                Curriculum ({course.totalLessons})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "instructor"}
                onClick={() => setActiveTab("instructor")}
                className={`pb-3 transition-colors ${
                  activeTab === "instructor"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "hover:text-[#172033]"
                }`}
              >
                Instructor
              </button>
              <button type="button" role="tab" aria-selected={activeTab === "reviews"} onClick={() => setActiveTab("reviews")}
                className={`shrink-0 pb-3 transition-colors ${activeTab === "reviews" ? "border-b-2 border-[#FF6B35] text-[#FF6B35]" : "hover:text-[#172033]"}`}>
                Reviews ({course.ratingCount})
              </button>
            </div>

            {activeTab === "overview" && <div role="tabpanel" className="space-y-10">
            {/* What You'll Learn Box */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#172033] mb-6">
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#172033] leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#172033] mb-4">Requirements</h2>
              <ul className="space-y-2 text-sm text-[#64748B] list-disc list-inside">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className="leading-relaxed text-[#172033]">{req}</li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-[#172033]">Description</h2>
              <p className="text-sm text-[#172033] leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>
            </div>}

            {activeTab === "curriculum" && <div role="tabpanel">
            {/* Course Curriculum Breakdown */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-xl font-bold text-[#172033]">Course content</h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    {course.sections.length} sections · {course.totalLessons} {course.totalLessons === 1 ? "lecture" : "lectures"} · {course.duration} total length
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = Object.values(expandedSections).filter(Boolean).length === course.sections.length;
                    const newState: Record<string, boolean> = {};
                    course.sections.forEach((s) => {
                      newState[s.id] = !allOpen;
                    });
                    setExpandedSections(newState);
                  }}
                  className="mt-2 sm:mt-0 text-xs font-bold text-[#FF6B35] hover:underline"
                >
                  Expand / Collapse All
                </button>
              </div>

              <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
                {course.sections.map((section) => {
                  const isExpanded = !!expandedSections[section.id];
                  return (
                    <div key={section.id} className="bg-[#FFFDF9]/60">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full text-left p-4.5 flex items-center justify-between font-bold text-[#172033] text-sm select-none hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                          <span>{section.title}</span>
                        </div>
                        <span className="text-xs font-normal text-[#64748B]">
                          {section.lessons.length} {section.lessons.length === 1 ? "lecture" : "lectures"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-4.5 pb-4 pt-1 space-y-2 bg-white border-t border-[#F1F5F9] animate-in slide-in-from-top-1 duration-150">
                          {section.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/learn/${course.slug}/${lesson.id}`}
                              className="flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-[#F7F8FA] hover:text-[#FF6B35] transition-colors"
                            >
                              <div className="flex items-center gap-2.5 text-[#172033]">
                                <PlayCircle className="w-4 h-4 text-[#FF6B35]" />
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-[#64748B] font-mono">{lesson.duration}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            </div>}

            {activeTab === "instructor" && <div role="tabpanel">
            {/* Instructor Bio Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#172033] mb-6">Instructor</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                {course.instructor.avatar ? <img src={course.instructor.avatar} alt="" className="w-24 h-24 rounded-2xl object-cover border border-[#E5E7EB]" /> : <span aria-hidden="true" className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-orange-100 text-3xl font-bold text-[#C96114]">{course.instructor.name.charAt(0)}</span>}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#172033]">{course.instructor.name}</h3>
                  <p className="text-xs text-[#FF6B35] font-semibold">{course.instructor.role}</p>
                  {course.instructor.headline && <p className="text-sm font-semibold text-[#475569]">{course.instructor.headline}</p>}
                  {course.instructor.bio && <p className="whitespace-pre-line pt-1 text-sm leading-relaxed text-[#64748B]">{course.instructor.bio}</p>}
                  <div className="flex items-center gap-5 pt-2 text-xs font-semibold text-[#172033]">
                    {course.instructor.rating > 0 && <span>⭐ {course.instructor.rating} Rating</span>}
                    <span>👥 {course.instructor.studentsCount.toLocaleString()} Students</span>
                    <span>📚 {course.instructor.coursesCount} Courses</span>
                  </div>
                </div>
              </div>
            </div>
            </div>}
            {activeTab === "reviews" && <div role="tabpanel"><CourseReviews courseId={course.id} /></div>}
            <section className="rounded-3xl bg-[#172033] p-7 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-300">Know before you start</p><h2 className="mt-2 text-2xl font-extrabold">Common questions</h2><div className="mt-6 divide-y divide-white/15">{faqs.map((item) => <details key={item.question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold marker:hidden">{item.question}<ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#CBD5E1]">{item.answer}</p></details>)}</div></section>
            {relatedCourses.length > 0 && <section aria-labelledby="related-courses-title"><h2 id="related-courses-title" className="text-2xl font-extrabold text-[#172033]">Continue with related concepts</h2><p className="mt-1 text-sm text-[#64748B]">Published courses in {course.subcategory || course.category}.</p><div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{relatedCourses.map((item) => <CourseCard key={item.id} course={item} />)}</div></section>}
          </div>

          {/* Right Column: Sticky Purchase & Preview Card */}
          <div id="enroll" className="order-1 lg:order-2 lg:col-span-4">
            <div className="sticky top-24 z-20 space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              {/* Video Preview Box */}
              <button
                type="button"
                onClick={() => {
                  if (previewLesson) setPreviewOpen(true);
                  else { setActiveTab("curriculum"); document.getElementById("course-content")?.scrollIntoView({ behavior: "smooth" }); }
                }}
                className="relative aspect-video rounded-2xl overflow-hidden bg-black group cursor-pointer w-full"
                aria-label={previewLesson ? "Play free course preview" : "View course curriculum"}
              >
                <CourseThumbnail
                  category={course.category}
                  title={course.title}
                  imageUrl={course.image}
                  className="opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-7 h-7" />
                  </div>
                </div>
                <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {previewLesson ? "Play free preview" : "View course curriculum"}
                </span>
              </button>

              {/* Pricing Info */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-[#172033]">
                    {formatINR(course.price)}
                  </span>
                  {discountPercent > 0 && <span className="text-base text-[#64748B] line-through">{formatINR(course.originalPrice)}</span>}
                  {discountPercent > 0 && <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded">{discountPercent}% OFF</span>}
                </div>
                <p className="text-xs text-[#64748B]">{course.price === 0 ? "Free enrollment gives immediate access." : "Secure checkout uses the final price confirmed by the server."}</p>
              </div>

              {/* Primary CTA Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => isEnrolled ? router.push(`/learn/${course.slug}/${firstLessonId}`) : setEnrollModalOpen(true)}
                  className="w-full inline-flex items-center justify-center text-center font-bold text-white bg-[#FF6B35] hover:bg-[#E85D2A] py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/25 transition-all text-base active:scale-98"
                >
                  {isEnrolled ? "Continue Learning" : course.price > 0 ? "Buy Course" : "Enroll for Free"}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(course.id, course.title)}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#172033] font-semibold py-3 px-4 rounded-xl text-xs transition-colors active:scale-98"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        wishlisted ? "fill-[#FF6B35] text-[#FF6B35]" : "text-[#172033]"
                      }`}
                    />
                    <span>{wishlisted ? "In Wishlist" : "Wishlist"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-3 border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#172033] rounded-xl text-xs transition-colors"
                    title="Share course"
                    aria-label="Share course"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Guarantee & Benefits */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-3 text-xs text-[#64748B]">
                <div className="font-bold text-[#172033] text-sm">This course includes:</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B35]" />
                  <span>{course.duration} of course lessons</span>
                </div>
                {course.sections.some((section) => section.lessons.some((lesson) => lesson.resources?.length)) && <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6B35]" />
                  <span>Downloadable learning resources</span>
                </div>}
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FF6B35]" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>{course.price === 0 ? "No payment required" : "Buy once for ongoing access to this course"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {previewOpen && previewLesson?.videoUrl && <div role="dialog" aria-modal="true" aria-label="Free course preview" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewOpen(false)}>
        <div className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-3 flex items-center justify-between text-white"><strong>{previewLesson.title}</strong><button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview" className="rounded-full p-2 hover:bg-white/20"><X className="h-5 w-5" /></button></div>
          <video controls autoPlay playsInline src={previewLesson.videoUrl} className="aspect-video w-full rounded-xl bg-black" />
        </div>
      </div>}
    </>
  );
}
