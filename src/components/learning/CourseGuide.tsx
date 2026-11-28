"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Lightbulb,
  Target,
} from "lucide-react";
import type { LearningGuideData, ModuleGuideData } from "@/data/learningGuides";

export function CoursePurpose({ guide }: { guide: LearningGuideData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className="mt-5 rounded-2xl border border-orange-200/80 bg-white shadow-2xs"
      aria-label="About this learning path"
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#D65B28]">
            Path overview
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#334155]">
            {guide.purpose}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#172033] hover:border-[#D65B28] hover:text-[#D65B28]"
          >
            <span>{expanded ? "Hide roadmap details" : "View roadmap & outcomes"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          <a
            href="#current-lesson"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#172033] px-4 py-2 text-xs font-bold text-white hover:bg-[#26334a]"
          >
            <span>Jump to lesson</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#F1F5F9] px-5 pb-6 pt-5 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#172033]">
                <BookOpen className="h-4 w-4 text-[#E85D2A]" aria-hidden="true" />
                Starting point
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                {guide.startingPoint}
              </p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#172033]">
                <Target className="h-4 w-4 text-[#E85D2A]" aria-hidden="true" />
                What you will make
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                {guide.outcome}
              </p>
            </div>
          </div>

          <h2 className="mt-5 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
            5-Stage Learning Journey
          </h2>
          <ol className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {guide.journey.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-3 text-xs font-semibold leading-snug text-[#334155]"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-extrabold text-[#D65B28]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

export function ModuleExplanation({
  guide,
  phase,
}: {
  guide: ModuleGuideData;
  phase: "concept" | "example" | "workshop" | "lab";
}) {
  if (phase === "lab") {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#172033]">
          <AlertCircle className="h-4 w-4 text-amber-700" aria-hidden="true" />
          Before you submit
        </h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#475569]">
          {guide.pitfalls.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (phase === "concept") {
    return (
      <div className="mt-6 space-y-5">
        <div className="rounded-2xl border border-orange-200/80 bg-orange-50/70 p-5">
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D65B28]">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            Why you are learning this
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#334155]">{guide.why}</p>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
            Core concepts to understand first
          </h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guide.concepts.map(([term, meaning]) => (
              <div
                key={term}
                className="flex flex-col rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-4"
              >
                <dt className="text-sm font-bold text-[#172033]">{term}</dt>
                <dd className="mt-1.5 text-xs leading-relaxed text-[#475569]">
                  {meaning}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 text-sm leading-relaxed text-[#475569]">
          <strong className="text-[#172033]">How this connects to your project:</strong>{" "}
          {guide.projectLink}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
          {phase === "workshop"
            ? "How the program works"
            : "What is happening in this example"}
        </h3>
        <ol className="mt-3 space-y-2.5">
          {guide.walkthrough.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm leading-relaxed text-[#334155]"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-[#D65B28] border border-[#E5E7EB]">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
      {phase === "workshop" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-700" aria-hidden="true" />
            Common mistakes to avoid
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#475569]">
            {guide.pitfalls.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
