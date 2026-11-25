import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { courseService } from "@/services/courseService";
import { CourseCard } from "@/components/courses/CourseCard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beginner Programs & Foundational Courses — Elevate",
  description: "Start learning from scratch with Elevate's curated beginner-friendly courses in AI, programming, web development, and business.",
  alternates: { canonical: "https://elevate.courses/programs/beginner" },
  openGraph: {
    title: "Beginner Programs — Elevate",
    description: "Start learning from scratch with Elevate's curated beginner-friendly courses.",
    url: "https://elevate.courses/programs/beginner",
    siteName: "Elevate",
    type: "website",
  },
};
export const instant = false;
export default async function BeginnerProgramsPage() {
  const beginnerCourses = (await courseService.getAllCourses()).filter((course) => course.level === "Beginner");
  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="flex-1 max-w-7xl w-full mx-auto px-4 py-16"><h1 className="text-4xl font-bold text-[#172033]">Beginner courses</h1>{beginnerCourses.length ? <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{beginnerCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <p className="mt-8 text-[#64748B]">No beginner courses have been published yet. <Link href="/courses" className="text-[#FF6B35]">Browse all courses</Link>.</p>}</main><Footer /></div>;
}
