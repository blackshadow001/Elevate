"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Course } from "@/types";
import { CourseCard } from "@/components/courses/CourseCard";
import { Reveal } from "@/components/ui/Reveal";

interface PopularCoursesProps {
  courses: Course[];
}

export function PopularCourses({ courses }: PopularCoursesProps) {
  const [activeTab, setActiveTab] = useState("All");
  const filterTabs = ["All", ...new Set(courses.map((course) => course.category).filter(Boolean))];

  const filteredCourses = courses.filter((c) => {
    if (activeTab === "All") return true;
    return c.category.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <Reveal variant="mask">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
                Available courses
              </h2>
            </Reveal>
            <Reveal direction="up" delay={0.08}>
              <p className="mt-2 text-base text-[#64748B]">
                Browse courses currently published on Elevate.
              </p>
            </Reveal>
          </div>
          <Reveal direction="left" delay={0.1}>
            <Link
              href="/courses"
              className="group mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6B35] hover:text-[#E85D2A] transition-colors"
            >
              <span>View all courses</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        {/* Category Filter Tabs */}
        <Reveal direction="up" delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 active:scale-95 ${
                    isActive
                      ? "bg-[#172033] text-white shadow-sm"
                      : "bg-[#F7F8FA] text-[#64748B] hover:text-[#172033] hover:bg-slate-200/60"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Responsive Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.slice(0, 8).map((course, idx) => (
            <Reveal key={course.id} direction="up" delay={0.05 * (idx % 4)}>
              <CourseCard course={course} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
