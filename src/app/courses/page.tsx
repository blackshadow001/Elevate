import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CoursesExplorer } from "@/components/courses/CoursesExplorer";
import { courseService } from "@/services/courseService";

export const instant = false;

export const metadata = {
  title: "All Courses — Elevate",
  description: "Browse courses currently published on Elevate.",
};

export default async function CoursesPage() {
  const courses = await courseService.getAllCourses();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Suspense fallback={<div className="py-20 text-center font-medium text-[#64748B]">Loading courses...</div>}>
          <CoursesExplorer initialCourses={courses} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
