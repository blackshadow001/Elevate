"use client";

import Link from "next/link";
import { CourseBuilder } from "@/app/instructor/courses/create/CourseBuilder";
import { useAuth } from "@/context/AuthContext";
import { useInstructorCourses, instructorCoursesLoaded } from "@/lib/instructorCourses";

export function EditCourseClient({ id }: { id: string }) {
  const localCourses = useInstructorCourses();
  const { user, isReady } = useAuth();
  const course = localCourses.find((item) => item.id === id);
  if (!isReady || !instructorCoursesLoaded(user.id)) return <main className="p-8 text-center text-sm text-[#64748B]">Loading course…</main>;
  if (!course) return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Course unavailable</h1><Link href="/instructor/courses" className="text-[#FF6B35]">Back to My Courses</Link></main>;
  return <CourseBuilder key={course.id} initialCourse={course} />;
}
