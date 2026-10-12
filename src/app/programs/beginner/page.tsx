import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { mockCourses } from "@/data/courses";
import { CourseCard } from "@/components/courses/CourseCard";
import { Sparkles, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";

export const metadata = {
  title: "Beginner Programs — Elevate",
  description: "Start learning from scratch with curated beginner-friendly courses.",
};

export default function BeginnerProgramsPage() {
  const beginnerCourses = mockCourses.filter((c) => c.level === "Beginner");

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF6B35] text-xs font-bold border border-orange-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Prerequisites Required</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
            Start learning from zero.
          </h1>
          <p className="text-base text-[#64748B] leading-relaxed">
            No previous programming or design experience needed. Our beginner tracks are structured step-by-step with patient instructors and hands-on guidance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#172033] font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Step-by-step video lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Bilingual explanations (English, Tamil, Hindi)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Free portfolio projects</span>
            </div>
          </div>
        </div>

        {/* Curated Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-[#172033]">
              Curated Beginner Courses ({beginnerCourses.length})
            </h2>
            <Link href="/courses" className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1">
              <span>View all courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {beginnerCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
