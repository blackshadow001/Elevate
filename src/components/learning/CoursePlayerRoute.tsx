"use client";

import Link from "next/link";
import { Course } from "@/types";
import { CoursePlayer } from "@/components/learning/CoursePlayer";

export function CoursePlayerRoute({ slug, lessonId, initialCourse }: { slug: string; lessonId: string; initialCourse?: Course }) {
  const course = initialCourse;
  const lessonExists = course?.sections.some((section) => section.lessons.some((lesson) => lesson.id === lessonId));
  if (!course || !lessonExists) return <main className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="text-2xl font-bold text-[#172033]">Lesson unavailable</h1><Link href="/courses" className="rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white">Back to Courses</Link></main>;
  return <CoursePlayer key={`${slug}-${lessonId}`} course={course} initialLessonId={lessonId} />;
}
