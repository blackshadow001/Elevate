"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";

interface OpenRole {
  id: string;
  title: string;
  department:
    | "Engineering & Platform"
    | "Curriculum & Practice"
    | "Design & Brand"
    | "Learner Success";
  location: string;
  type: string;
  summary: string;
}

const DEPARTMENTS = [
  "All Teams",
  "Engineering & Platform",
  "Curriculum & Practice",
  "Design & Brand",
  "Learner Success",
] as const;

const OPEN_ROLES: OpenRole[] = [
  {
    id: "staff-fullstack-nextjs",
    title: "Senior Full-Stack Engineer (Next.js & Compiler Sandboxes)",
    department: "Engineering & Platform",
    location: "Remote · India / Global",
    type: "Full-Time",
    summary:
      "Own interactive sandbox runtimes for CodeArena, WebForge, and multi-language execution diagnostics at scale.",
  },
  {
    id: "ai-curriculum-architect",
    title: "Staff Curriculum Architect — Applied AI & Python Systems",
    department: "Curriculum & Practice",
    location: "Remote / Chennai Hybrid",
    type: "Full-Time",
    summary:
      "Design structured video pathways, coding interview handbooks, and verifiable capstone assessments with practicing engineers.",
  },
  {
    id: "sql-data-lead",
    title: "Lead Problem Author — SQL & Data Engineering Tracks",
    department: "Curriculum & Practice",
    location: "Remote · Global",
    type: "Full-Time / Contract",
    summary:
      "Author progressive multi-table SQL challenges, indexing labs, and QueryMaster benchmarks mirroring production analytics teams.",
  },
  {
    id: "product-designer-systems",
    title: "Senior Product Designer (Learning & Editorial Systems)",
    department: "Design & Brand",
    location: "Remote / Bengaluru Hybrid",
    type: "Full-Time",
    summary:
      "Craft accessible typography systems, course creation workflows in Instructor Studio, and interactive code-player interfaces.",
  },
  {
    id: "instructor-partner-lead",
    title: "Instructor Partnerships & Quality Lead",
    department: "Learner Success",
    location: "Remote · India",
    type: "Full-Time",
    summary:
      "Coach new subject-matter experts from course syllabus planning through studio production and learner launch readiness.",
  },
];

export function OpenRolesExplorer() {
  const [selectedDept, setSelectedDept] = useState<string>("All Teams");

  const visibleRoles = useMemo(
    () =>
      selectedDept === "All Teams"
        ? OPEN_ROLES
        : OPEN_ROLES.filter((role) => role.department === selectedDept),
    [selectedDept]
  );

  return (
    <div className="space-y-8">
      <div
        role="tablist"
        aria-label="Filter open roles by team"
        className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
      >
        {DEPARTMENTS.map((dept) => {
          const isSelected = selectedDept === dept;
          return (
            <button
              key={dept}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedDept(dept)}
              className={`relative shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] ${
                isSelected
                  ? "bg-[#172033] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#475569] hover:border-[#FF6B35]/50 hover:text-[#172033]"
              }`}
            >
              {dept}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 bottom-0.5 h-0.5 rounded-full bg-[#FF6B35]"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-[#E5E7EB] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-xs">
        {visibleRoles.map((role) => (
          <article
            key={role.id}
            className="group flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between hover:bg-[#FFFDF9] transition-colors"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-md bg-[#FFF3EE] px-2.5 py-0.5 text-[#FF6B35]">
                  {role.department}
                </span>
                <span className="inline-flex items-center gap-1 text-[#64748B]">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {role.location}
                </span>
                <span className="inline-flex items-center gap-1 text-[#64748B]">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {role.type}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                {role.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#64748B] text-pretty">
                {role.summary}
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-bold text-white transition-colors group-hover:bg-[#FF6B35]"
              >
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                <span>Apply Now</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
