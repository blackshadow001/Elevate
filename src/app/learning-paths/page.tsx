"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpenCheck,
  Code2,
  Database,
  GitBranch,
  Globe,
  Layers,
  Terminal,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";

type Path = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  stepCount: number;
  chapterCount: number;
  moduleCount: number;
};

const PATH_VISUALS: Record<
  string,
  { Icon: typeof Code2; tag: string; accent: string }
> = {
  "web-development": {
    Icon: Globe,
    tag: "Frontend & Web",
    accent: "bg-orange-50 text-[#D65B28] border-orange-200/70",
  },
  "full-stack-development": {
    Icon: Layers,
    tag: "End-to-End Apps",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
  },
  "data-visualization": {
    Icon: BarChart3,
    tag: "Charts & Analytics",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  },
  "python-basics": {
    Icon: Terminal,
    tag: "Core Programming",
    accent: "bg-sky-50 text-sky-700 border-sky-200/70",
  },
  "basics-of-git": {
    Icon: GitBranch,
    tag: "Version Control",
    accent: "bg-rose-50 text-rose-700 border-rose-200/70",
  },
  "relational-database-basics": {
    Icon: Database,
    tag: "SQL & Schemas",
    accent: "bg-amber-50 text-amber-800 border-amber-200/70",
  },
};

function getPathVisual(slug: string) {
  return (
    PATH_VISUALS[slug] || {
      Icon: Code2,
      tag: "Interactive Track",
      accent: "bg-orange-50 text-[#D65B28] border-orange-200/70",
    }
  );
}

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [view, setView] = useState<"current" | "archive">("current");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function switchView(next: "current" | "archive") {
    if (view === next) return;
    setLoading(true);
    setError("");
    setPaths([]);
    setView(next);
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/learning-paths${view === "archive" ? "?view=archive" : ""}`)
      .then((response) => response.json())
      .then((body) => {
        if (!active) return;
        if (body.error) {
          setError(body.error.message);
          setPaths([]);
        } else {
          setError("");
          setPaths(body.data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError("Learning paths could not be loaded.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [view]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF9]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 pb-24 sm:px-6 lg:px-8">
        {/* Compact Header & 3-Step Method Strip so Path Cards sit clearly above the fold */}
        <div className="flex flex-col gap-6 border-b border-[#E5E7EB] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal immediate direction="up" delay={0.02}>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#D65B28]">
                Guided Learning Paths
              </p>
            </Reveal>
            <Reveal immediate variant="mask" delay={0.06}>
              <h1 className="mt-2.5 text-3xl font-black tracking-tight text-[#172033] sm:text-4xl lg:text-[42px]">
                Learn by doing, one step at a time.
              </h1>
            </Reveal>
            <Reveal immediate direction="up" delay={0.12}>
              <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
                Structured theory, worked examples, guided workshops, labs, and assessments leading to a verified Elevate certificate.
              </p>
            </Reveal>
          </div>

          <div
            aria-label="How guided learning works"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:max-w-xl"
          >
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-3 shadow-2xs">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#D65B28]">
                <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-[#172033]">1. Understand</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#64748B]">
                  Core ideas & worked examples
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-3 shadow-2xs">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#D65B28]">
                <Code2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-[#172033]">2. Build</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#64748B]">
                  Workshops & hands-on labs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-3 shadow-2xs">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#D65B28]">
                <Award className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-[#172033]">3. Certify</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#64748B]">
                  Final project & assessment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Filter Tabs + Path Count */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-[#E5E7EB] bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => switchView("current")}
              aria-pressed={view === "current"}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                view === "current"
                  ? "bg-[#172033] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Current paths
            </button>
            <button
              type="button"
              onClick={() => switchView("archive")}
              aria-pressed={view === "archive"}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                view === "archive"
                  ? "bg-[#172033] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Archive
            </button>
          </div>
          {!loading && paths.length > 0 && (
            <p className="text-xs font-semibold text-[#64748B]">
              Showing <strong className="text-[#172033]">{paths.length}</strong>{" "}
              {paths.length === 1 ? "structured path" : "structured paths"}
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}

        {/* Loading Skeleton Grid */}
        {loading && (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="h-64 animate-pulse rounded-3xl border border-[#E5E7EB] bg-white p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="mt-5 h-6 w-2/3 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Organized 3-Column Card Grid with Flex Column + Pinned Footer CTA */}
        {!loading && paths.length > 0 && (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((path, idx) => {
              const { Icon, tag, accent } = getPathVisual(path.slug);
              return (
                <Reveal key={path.id} direction="up" delay={0.04 * (idx % 3)} className="h-full">
                  <Link
                    href={`/learning-paths/${path.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-lg motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-[#E85D2A]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${accent}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="rounded-full bg-[#F7F8FA] px-2.5 py-1 text-[11px] font-bold text-[#475569]">
                        {tag}
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-extrabold tracking-tight text-[#172033] group-hover:text-[#D65B28] transition-colors">
                      {path.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                      {path.summary}
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-4 text-xs">
                        <span className="font-semibold text-[#64748B]">
                          {path.chapterCount} ch · {path.moduleCount} mod · {path.stepCount} steps
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#D65B28]">
                          Open path
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}

        {!loading && !error && paths.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
            <BookOpenCheck className="mx-auto h-7 w-7 text-[#94A3B8]" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-[#475569]">
              {view === "archive"
                ? "No archived learning paths yet."
                : "No published learning paths yet."}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
