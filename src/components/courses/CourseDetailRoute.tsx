"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseDetailClient } from "@/components/courses/CourseDetailClient";
import { Course } from "@/types";

export function CourseDetailRoute({ slug, initialCourse, relatedCourses = [] }: { slug: string; initialCourse?: Course; relatedCourses?: Course[] }) {
  const course = initialCourse;
  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="flex-1">{course ? <CourseDetailClient course={course} relatedCourses={relatedCourses} /> : <div className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-2xl font-bold text-[#172033]">Course unavailable</h1><p className="mt-3 text-[#64748B]">Unable to load course information.</p><Link className="mt-6 inline-block rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white" href="/courses">Back to Courses</Link></div>}</main><Footer /></div>;
}
