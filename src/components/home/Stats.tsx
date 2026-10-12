"use client";

import { Users, GraduationCap, BookOpenCheck, Star } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { mockCourses } from "@/data/courses";
import { mockInstructors } from "@/data/instructors";
import { mockCareerPaths } from "@/data/careerPaths";

export function Stats() {
  return (
    <section className="bg-white py-12 border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Stat 1 */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B35] mb-2">
              <Users className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              <AnimatedNumber value={mockCourses.length} duration={900} />
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#64748B]">
              Courses in Demo
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B35] mb-2">
              <GraduationCap className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              <AnimatedNumber value={mockInstructors.length} duration={900} />
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#64748B]">
              Expert Instructors
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B35] mb-2">
              <BookOpenCheck className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              <AnimatedNumber value={mockCareerPaths.length} duration={900} />
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#64748B]">
              Guided Career Paths
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B35] mb-2">
              <Star className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              <AnimatedNumber value={mockCourses.reduce((total, course) => total + course.rating, 0) / mockCourses.length} decimals={1} suffix="/5" duration={900} />
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#64748B]">
              Sample Course Rating
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
