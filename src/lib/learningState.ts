"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Course } from "@/types";
import { Certificate } from "@/data/certificates";
import { useAuth } from "@/context/AuthContext";

export interface LearningState {
  enrolledCourseIds: string[];
  enrolledCourses: Array<{
    courseId: string; courseSlug: string; courseTitle: string; courseImage: string;
    category: string; instructorName: string; enrolledAt: string;
    lastLessonId: string; lastLessonTitle: string; totalLessons: number;
    completedLessons: number; progressPercent: number;
  }>;
  completedLessonIds: Record<string, string[]>;
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}
const EMPTY: LearningState = { enrolledCourseIds: [], enrolledCourses: [], completedLessonIds: {}, certificates: [], loading: false, error: null };
let state: LearningState = EMPTY;
let activeUserId = "";
let inFlight: { userId: string; promise: Promise<void> } | null = null;
const subscribers = new Set<() => void>();
function emit(next: LearningState) { state = next; subscribers.forEach((notify) => notify()); }
function subscribe(notify: () => void) { subscribers.add(notify); return () => { subscribers.delete(notify); }; }
function snapshot() { return state; }
function serverSnapshot() { return EMPTY; }

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Unable to load learning data.");
  return body.data;
}

type ApiEnrollment = { courseId: string; enrolledAt: string; course: { slug: string; title: string; thumbnail: string | null } };
type ApiProgress = { lessons: Array<{ lessonId: string; completed: boolean }> };
type ApiCourse = { category: string; instructor: { name: string }; sections: Array<{ lessons: Array<{ id: string; title: string }> }> };
type ApiCertificate = {
  id: string; certificateNumber: string; courseId: string; courseSlug: string; courseName: string;
  studentName: string; instructorName: string; completedAt: string; skills: unknown[];
};

export async function refreshLearningState(userId = activeUserId, force = false): Promise<void> {
  if (!userId) { emit(EMPTY); return; }
  if (inFlight?.userId === userId) {
    if (!force) return inFlight.promise;
    await inFlight.promise;
  }
  emit({ ...state, loading: true, error: null });
  const promise = (async () => {
    try {
      const [enrollments, certificates] = await Promise.all([
        api("/api/me/enrollments") as Promise<ApiEnrollment[]>,
        api("/api/me/certificates") as Promise<ApiCertificate[]>,
      ]);
      const pairs = await Promise.all(enrollments.map(async (enrollment) => {
        const [progress, course] = await Promise.all([
          api(`/api/courses/${encodeURIComponent(enrollment.courseId)}/progress`) as Promise<ApiProgress>,
          api(`/api/courses/${encodeURIComponent(enrollment.courseId)}`) as Promise<ApiCourse>,
        ]);
        const completed = progress.lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.lessonId);
        const lessons = course.sections.flatMap((section) => section.lessons);
        const next = lessons.find((lesson) => !completed.includes(lesson.id)) || lessons.at(-1);
        return {
          courseId: enrollment.courseId, completed,
          summary: {
            courseId: enrollment.courseId, courseSlug: enrollment.course.slug, courseTitle: enrollment.course.title,
            courseImage: enrollment.course.thumbnail || "", lastLessonId: next?.id || "",
            category: course.category, instructorName: course.instructor.name, enrolledAt: enrollment.enrolledAt,
            lastLessonTitle: next?.title || "No lessons available", totalLessons: lessons.length,
            completedLessons: completed.length, progressPercent: lessons.length ? Math.round(completed.length / lessons.length * 100) : 0,
          },
        };
      }));
      if (activeUserId !== userId) return;
      emit({
        enrolledCourseIds: enrollments.map((enrollment) => enrollment.courseId),
        enrolledCourses: pairs.map((pair) => pair.summary),
        completedLessonIds: Object.fromEntries(pairs.map((pair) => [pair.courseId, pair.completed])),
        certificates: certificates.map((certificate) => ({
          id: certificate.id, certificateId: certificate.certificateNumber, courseId: certificate.courseId,
          courseSlug: certificate.courseSlug, courseTitle: certificate.courseName, studentName: certificate.studentName,
          instructorName: certificate.instructorName, instructorRole: "Instructor", completedAt: new Date(certificate.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
          skillsAcquired: certificate.skills.filter((skill): skill is string => typeof skill === "string"), grade: "Completed",
        })),
        loading: false, error: null,
      });
    } catch (error) {
      if (activeUserId === userId) emit({ ...EMPTY, loading: false, error: error instanceof Error ? error.message : "Unable to load learning data." });
    }
  })();
  inFlight = { userId, promise };
  void promise.finally(() => { if (inFlight?.promise === promise) inFlight = null; });
  return promise;
}

export function useLearningState() {
  const { user, isAuthenticated, isReady } = useAuth();
  const current = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => {
    if (!isReady) return;
    const nextId = isAuthenticated ? user.id : "";
    if (activeUserId !== nextId) {
      activeUserId = nextId;
      emit(EMPTY);
      if (nextId) void refreshLearningState(nextId);
    }
  }, [isReady, isAuthenticated, user.id]);
  return isReady && isAuthenticated && activeUserId !== user.id ? { ...current, loading: true } : current;
}

export async function enrollCourse(course: Course): Promise<void> {
  await api(`/api/courses/${encodeURIComponent(course.id)}/enroll`, { method: "POST" });
  await refreshLearningState(activeUserId, true);
}

export async function setLessonCompletion(course: Course, lessonId: string, completed: boolean, _studentName: string): Promise<void> {
  if (!completed) return;
  await api(`/api/courses/${encodeURIComponent(course.id)}/lessons/${encodeURIComponent(lessonId)}/complete`, { method: "POST" });
  await refreshLearningState(activeUserId, true);
}

export function resetCourseProgress(_course: Course) {
  // Rewatching starts at lesson one; authoritative completion remains intact.
}
