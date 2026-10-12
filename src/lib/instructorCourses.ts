"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Course, Instructor } from "@/types";
import { mockCourses } from "@/data/courses";
import { mockInstructors } from "@/data/instructors";
import { useAuth } from "@/context/AuthContext";

export type InstructorCourse = Course & {
  status: "Draft" | "Pending Approval" | "Approved" | "Published" | "Rejected" | "Unpublished" | "Archived";
  marginBps?: number;
  pricing?: { basePriceMinor: number | null; minMarginBps: number; maxMarginBps: number;
    maxFinalMinor: number | null; proposedMarginBps: number | null; proposedFinalMinor: number | null;
    approvedMarginBps: number | null; finalPriceMinor: number | null; status: string } | null;
  reviewFeedback?: string | null;
};
type ApiCourse = {
  id: string; slug: string; title: string; subtitle: string; description: string; category: string;
  level: string; language: string; thumbnail: string | null; price: number; rating: number; status: string;
  durationSeconds: number; lessonCount: number; updatedAt: string;
  studentsCount: number; ratingCount: number;
  instructor: { id: string; name: string; avatar: string | null };
  pricing?: InstructorCourse["pricing"];
  reviewFeedback?: string | null;
  metadata: { whatYouWillLearn?: string[]; requirements?: string[]; originalPrice?: number };
  sections: Array<{ id: string; title: string; lessons: Array<{
    id: string; title: string; description: string; type: string; durationSeconds: number;
  }> }>;
};
const EMPTY: InstructorCourse[] = [];
let courses: InstructorCourse[] = EMPTY;
let activeUserId = "";
let pending: Promise<void> | null = null;
let loading = false;
let loadedUserId = "";
const listeners = new Set<() => void>();
function emit(next: InstructorCourse[]) { courses = next; listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function snapshot() { return courses; }
function serverSnapshot() { return EMPTY; }

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Unable to save instructor course.");
  return body.data;
}

function duration(seconds: number) { return seconds >= 3600 ? `${Math.floor(seconds / 3600)}h ${Math.ceil(seconds % 3600 / 60)}m` : `${Math.max(1, Math.ceil(seconds / 60))} mins`; }
function toCourse(course: ApiCourse): InstructorCourse {
  const fixture = mockCourses.find((item) => item.id === course.id);
  const fixtureInstructor = mockInstructors.find((item) => item.name === course.instructor.name);
  const instructor: Instructor = { id: course.instructor.id, name: course.instructor.name,
    avatar: course.instructor.avatar || fixtureInstructor?.avatar || "", bio: fixtureInstructor?.bio || "Course instructor",
    role: fixtureInstructor?.role || "Instructor", rating: 0, studentsCount: 0, coursesCount: 0 };
  return {
    id: course.id, slug: course.slug, title: course.title, subtitle: course.subtitle,
    description: course.description, category: course.category,
    level: course.level === "Advanced" || course.level === "Intermediate" ? course.level : "Beginner",
    language: course.language === "Hindi" || course.language === "Tamil" ? course.language : "English",
    price: course.pricing?.proposedFinalMinor !== null && course.pricing?.proposedFinalMinor !== undefined ? course.pricing.proposedFinalMinor / 100 : course.price,
    originalPrice: course.metadata?.originalPrice ?? course.price,
    isFree: course.price === 0, rating: course.ratingCount > 0 ? course.rating : 0, ratingCount: course.ratingCount, studentsCount: course.studentsCount,
    duration: duration(course.durationSeconds), totalLessons: course.lessonCount,
    image: course.thumbnail || "", instructor,
    updatedAt: new Date(course.updatedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    whatYouWillLearn: course.metadata?.whatYouWillLearn || [], requirements: course.metadata?.requirements || [],
    sections: course.sections.map((section) => ({ id: section.id, title: section.title,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id, title: lesson.title, content: lesson.description, duration: duration(lesson.durationSeconds),
        type: lesson.type === "quiz" || lesson.type === "project" || lesson.type === "reading" ? lesson.type : "video",
        videoUrl: fixture?.sections.flatMap((item) => item.lessons).find((item) => item.id === lesson.id)?.videoUrl,
      })),
    })),
    status: course.status === "published" ? "Published" : course.status === "archived" ? "Archived" :
      course.status === "pending_approval" ? "Pending Approval" : course.status === "approved" ? "Approved" :
      course.status === "rejected" ? "Rejected" : course.status === "unpublished" ? "Unpublished" : "Draft",
    pricing: course.pricing,
    marginBps: course.pricing?.proposedMarginBps ?? undefined,
    reviewFeedback: course.reviewFeedback,
  };
}

export async function refreshInstructorCourses(userId = activeUserId): Promise<void> {
  if (!userId) { emit(EMPTY); return; }
  if (pending) return pending;
  loading = true;
  const promise = (async () => {
    try {
      const listed = await request("/api/instructor/courses") as Array<{ id: string }>;
      const details = await Promise.all(listed.map((item) => request(`/api/instructor/courses/${encodeURIComponent(item.id)}`) as Promise<ApiCourse>));
      if (activeUserId === userId) { loadedUserId = userId; emit(details.map(toCourse)); }
    } catch {
      if (activeUserId === userId) { loadedUserId = userId; emit(EMPTY); }
    } finally { loading = false; }
  })();
  pending = promise;
  void promise.finally(() => { if (pending === promise) pending = null; });
  return promise;
}

export function useInstructorCourses() {
  const { user, isReady, isAuthenticated } = useAuth();
  const current = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => {
    if (!isReady) return;
    const nextId = isAuthenticated && (user.role === "instructor" || user.role === "admin") ? user.id : "";
    if (nextId !== activeUserId) {
      activeUserId = nextId;
      loadedUserId = "";
      emit(EMPTY);
      if (nextId) void refreshInstructorCourses(nextId);
    }
  }, [isReady, isAuthenticated, user.id, user.role]);
  return current;
}

export function instructorCoursesLoading() { return loading; }
export function instructorCoursesLoaded(userId: string) { return loadedUserId === userId; }

export async function saveInstructorCourse(course: InstructorCourse): Promise<string> {
  const saved = await request("/api/instructor/courses/save", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(course),
  }) as ApiCourse;
  await refreshInstructorCourses();
  return saved.id;
}

export async function setInstructorCourseStatus(id: string, status: InstructorCourse["status"]): Promise<void> {
  await request(`/api/instructor/courses/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: status.toLowerCase().replaceAll(" ", "_") }),
  });
  await refreshInstructorCourses();
}
