"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Layers,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  GuidedAssessmentPanel,
  type GuidedAssessment,
} from "@/components/learning/GuidedAssessmentPanel";
import {
  PracticeProgram,
  type PracticeProgramData,
} from "@/components/learning/PracticeProgram";
import {
  CoursePurpose,
  ModuleExplanation,
} from "@/components/learning/CourseGuide";
import type { LearningGuideData } from "@/data/learningGuides";

type Step = {
  id: string;
  position: number;
  kind: "reading" | "fill_blank" | "code" | "project";
  title: string;
  body: string;
  starter_code: string;
  chapter_title: string;
  module_title: string;
  block_type: string;
  practice?: PracticeProgramData;
};

type Path = {
  slug: string;
  title: string;
  summary: string;
  steps: Step[];
  completedIds: string[];
  completion: { id: string; issued_at: string } | null;
  project: { title: string; brief: string; requirements: string[] } | null;
  assessment: GuidedAssessment | null;
  guide: LearningGuideData | null;
};

type ChapterGroup = {
  title: string;
  modules: {
    key: string;
    title: string;
    items: { step: Step; index: number }[];
  }[];
};

function moduleKey(chapterTitle: string, moduleTitle: string): string {
  return `${chapterTitle}::${moduleTitle}`;
}

function getStepLabel(step: Step): string {
  if (step.block_type === "lecture") {
    return step.title.startsWith("Worked example:")
      ? "Worked example"
      : "Theory & concepts";
  }
  if (step.block_type === "workshop") return "Guided workshop";
  if (step.block_type === "lab") return "Independent lab";
  if (step.block_type === "review") return "Module review";
  if (step.block_type === "quiz") return "Knowledge check";
  if (step.kind === "project") return "Practice activity";
  return "Read & learn";
}

function getStepTag(step: Step): string {
  if (step.block_type === "lecture") {
    return step.title.startsWith("Worked example:") ? "Example" : "Theory";
  }
  if (step.block_type === "workshop") return "Workshop";
  if (step.block_type === "lab") return "Lab";
  if (step.block_type === "review") return "Review";
  if (step.block_type === "quiz") return "Quiz";
  if (step.kind === "project") return "Project";
  return "Read";
}

export function GuidedPathPlayer({ slug }: { slug: string }) {
  const [path, setPath] = useState<Path | null>(null);
  const [selected, setSelected] = useState(0);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    fetch(`/api/learning-paths/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((body) => {
        if (!active) return;
        if (body.error) {
          setError(body.error.message);
          return;
        }
        const result = body.data as Path;
        setPath(result);
        document.title = `${result.title} — Guided Learning Path | Elevate`;

        const firstOpen = result.steps.findIndex(
          (item) => !result.completedIds.includes(item.id)
        );
        const firstIndex = firstOpen < 0 ? result.steps.length - 1 : firstOpen;
        setSelected(firstIndex);
        setResponse(result.steps[firstIndex]?.starter_code || "");

        const activeStep = result.steps[firstIndex];
        if (activeStep) {
          setOpenModules({
            [moduleKey(activeStep.chapter_title, activeStep.module_title)]:
              true,
          });
        }
      })
      .catch(() => {
        if (active) setError("This path could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const curriculum = useMemo<ChapterGroup[]>(() => {
    if (!path) return [];
    const chapters: ChapterGroup[] = [];
    const chapterMap = new Map<string, ChapterGroup>();

    path.steps.forEach((item, index) => {
      let chapter = chapterMap.get(item.chapter_title);
      if (!chapter) {
        chapter = { title: item.chapter_title, modules: [] };
        chapterMap.set(item.chapter_title, chapter);
        chapters.push(chapter);
      }

      const key = moduleKey(item.chapter_title, item.module_title);
      let mod = chapter.modules.find((m) => m.key === key);
      if (!mod) {
        mod = { key, title: item.module_title, items: [] };
        chapter.modules.push(mod);
      }
      mod.items.push({ step: item, index });
    });

    return chapters;
  }, [path]);

  const allModuleKeys = useMemo(
    () => curriculum.flatMap((c) => c.modules.map((m) => m.key)),
    [curriculum]
  );

  const moduleTitles = useMemo(
    () =>
      path
        ? [...new Set(path.steps.map((item) => item.module_title))]
        : [],
    [path]
  );

  const step = path?.steps[selected];
  const moduleGuide =
    path?.guide && step
      ? path.guide.modules[moduleTitles.indexOf(step.module_title)]
      : null;

  function selectStep(index: number) {
    if (!path) return;
    const target = path.steps[index];
    if (!target) return;

    setSelected(index);
    setResponse(target.starter_code || "");
    setMessage("");
    setMissing([]);
    setError("");
    setOpenModules((prev) => ({
      ...prev,
      [moduleKey(target.chapter_title, target.module_title)]: true,
    }));
  }

  function toggleModule(key: string) {
    setOpenModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const allExpanded =
    allModuleKeys.length > 0 && allModuleKeys.every((k) => openModules[k]);

  function toggleAllModules() {
    const nextState = !allExpanded;
    const updated: Record<string, boolean> = {};
    for (const key of allModuleKeys) {
      updated[key] = nextState;
    }
    setOpenModules(updated);
  }

  async function submit() {
    if (!path || !step) return;
    setBusy(true);
    setError("");
    setMessage("");
    setMissing([]);
    try {
      const res = await fetch(
        `/api/learning-paths/${encodeURIComponent(slug)}/steps/${encodeURIComponent(step.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            response: step.kind === "reading" ? "read" : response,
          }),
        }
      );
      const body = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Sign in to save your progress across devices.");
          return;
        }
        setError(body.error?.message || "Your answer could not be checked.");
        return;
      }
      const outcome = body.data as {
        passed: boolean;
        missing: string[];
        completion: Path["completion"];
      };
      if (outcome.passed) {
        const nextCompletedIds = [...new Set([...path.completedIds, step.id])];
        setPath({
          ...path,
          completedIds: nextCompletedIds,
          completion: outcome.completion,
        });
        setMessage(
          outcome.completion
            ? "Path completed! Your completion record is saved."
            : path.project && nextCompletedIds.length === path.steps.length
              ? "Coursework complete. The final project and assessment are unlocked below."
              : "Well done. Your progress is saved."
        );
      } else {
        setMissing(outcome.missing);
        setMessage(
          step.kind === "fill_blank"
            ? "Try again. Read the explanation and check the spelling."
            : "Your response needs a few more required elements."
        );
      }
    } catch {
      setError("Connection lost. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const completed = path?.completedIds.length || 0;
  const totalSteps = path?.steps.length || 0;
  const progressPercent = totalSteps
    ? Math.round((completed / totalSteps) * 100)
    : 0;
  const completedSet = new Set(path?.completedIds || []);
  const selectedLocked =
    !!path && selected > 0 && !completedSet.has(path.steps[selected - 1].id);
  const currentDone = !!step && completedSet.has(step.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/learning-paths"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#E85D2A]"
          >
            <ArrowLeft className="h-4 w-4" />
            All learning paths
          </Link>
          {path?.project && (
            <a
              href="#guided-assessment"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#475569] shadow-xs transition-colors hover:border-[#FF6B35]/40 hover:text-[#D65B28]"
            >
              <Trophy className="h-3.5 w-3.5 text-[#E85D2A]" />
              Final project & assessment
            </a>
          )}
        </div>

        {!path && error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}{" "}
            {error.startsWith("Sign in") && (
              <Link className="font-bold underline" href="/login">
                Sign in
              </Link>
            )}
          </p>
        )}

        {!path && !error && (
          <div className="mt-6 space-y-6" aria-label="Loading guided path">
            <div className="h-52 animate-pulse rounded-3xl bg-slate-200" />
            <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
              <div className="h-96 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
              <div className="h-96 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
            </div>
          </div>
        )}

        {path && (
          <>
            <section className="mt-6 rounded-3xl bg-[#172033] p-6 text-white shadow-sm sm:p-8 lg:p-9">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-bold uppercase tracking-widest text-[#FFB18F]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Interactive path
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      {curriculum.length} chapters
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      {moduleTitles.length} modules
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">{totalSteps} steps</span>
                  </div>

                  <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">
                    {path.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    {path.summary}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xs">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Path progress
                    </span>
                    <span className="text-2xl font-black text-white">
                      {progressPercent}%
                    </span>
                  </div>
                  <progress
                    value={completed}
                    max={Math.max(totalSteps, 1)}
                    aria-label="Path completion progress"
                    className="mt-3 block h-2.5 w-full appearance-none overflow-hidden rounded-full bg-white/20 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[#FF6B35] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white/20 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[#FF6B35]"
                  />
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-300">
                    <span>
                      {completed} of {totalSteps} steps complete
                    </span>
                    {step && (
                      <a
                        href="#current-lesson"
                        className="font-bold text-[#FFB18F] hover:text-white"
                      >
                        Step {selected + 1} ↓
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {path.guide && <CoursePurpose guide={path.guide} />}

            <div className="mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
              <nav
                aria-label="Path chapters and steps"
                className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white shadow-xs lg:sticky lg:top-24 lg:max-h-[calc(100vh-7.5rem)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] px-4 py-3.5">
                  <div>
                    <h2 className="text-sm font-extrabold text-[#172033]">
                      Curriculum
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#64748B]">
                      {completed}/{totalSteps} steps completed
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleAllModules}
                    className="rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#475569] transition-colors hover:bg-slate-50 hover:text-[#172033]"
                  >
                    {allExpanded ? "Collapse all" : "Expand all"}
                  </button>
                </div>

                <div className="overflow-y-auto p-3">
                  <p className="px-2 pb-2 text-[11px] leading-4 text-[#64748B]">
                    Browse any module freely; submit steps in sequence to record
                    progress.
                  </p>

                  <div className="space-y-4">
                    {curriculum.map((chapter) => (
                      <div key={chapter.title}>
                        <p className="px-2 pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                          {chapter.title}
                        </p>

                        <div className="space-y-1.5">
                          {chapter.modules.map((mod) => {
                            const isOpen = !!openModules[mod.key];
                            const modDone = mod.items.filter(({ step: s }) =>
                              completedSet.has(s.id)
                            ).length;
                            const modComplete =
                              mod.items.length > 0 &&
                              modDone === mod.items.length;
                            const hasCurrent = mod.items.some(
                              ({ index }) => index === selected
                            );

                            return (
                              <div
                                key={mod.key}
                                className={`rounded-xl border transition-colors ${
                                  hasCurrent
                                    ? "border-orange-200 bg-orange-50/30"
                                    : "border-[#E5E7EB]/80 bg-[#F8FAFC]/60"
                                }`}
                              >
                                <button
                                  type="button"
                                  aria-expanded={isOpen}
                                  onClick={() => toggleModule(mod.key)}
                                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    {isOpen ? (
                                      <ChevronDown className="h-4 w-4 shrink-0 text-[#64748B]" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B]" />
                                    )}
                                    <span className="truncate text-xs font-bold text-[#172033]">
                                      {mod.title}
                                    </span>
                                  </span>
                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                      modComplete
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-white text-[#64748B] ring-1 ring-[#E5E7EB]"
                                    }`}
                                  >
                                    {modDone}/{mod.items.length}
                                  </span>
                                </button>

                                {isOpen && (
                                  <ol className="space-y-1 border-t border-[#E5E7EB]/70 bg-white p-1.5 rounded-b-xl">
                                    {mod.items.map(({ step: item, index }) => {
                                      const done = completedSet.has(item.id);
                                      const locked =
                                        index > 0 &&
                                        !completedSet.has(
                                          path.steps[index - 1].id
                                        );
                                      const isSelected = selected === index;

                                      return (
                                        <li key={item.id}>
                                          <button
                                            type="button"
                                            onClick={() => selectStep(index)}
                                            aria-current={
                                              isSelected ? "step" : undefined
                                            }
                                            className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                                              isSelected
                                                ? "bg-orange-50 font-bold text-[#D65B28] ring-1 ring-orange-200"
                                                : locked
                                                  ? "font-medium text-[#94A3B8] hover:bg-slate-50 hover:text-[#475569]"
                                                  : "font-semibold text-[#334155] hover:bg-slate-50"
                                            }`}
                                          >
                                            <span className="flex min-w-0 items-start gap-2">
                                              {done ? (
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                              ) : locked ? (
                                                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
                                              ) : (
                                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#CBD5E1]" />
                                              )}
                                              <span className="leading-snug">
                                                {item.position}. {item.title}
                                              </span>
                                            </span>
                                            <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B]">
                                              {getStepTag(item)}
                                            </span>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ol>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {path.project && (
                  <div className="border-t border-[#E5E7EB] px-4 py-3">
                    <a
                      href="#guided-assessment"
                      className="flex items-center justify-between gap-2 text-xs font-bold text-[#172033] hover:text-[#D65B28]"
                    >
                      <span className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-[#E85D2A]" />
                        Capstone & Final Assessment
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </nav>

              {step && (
                <section
                  id="current-lesson"
                  className="min-w-0 scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs sm:p-8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D65B28]">
                        {getStepLabel(step)}
                      </span>
                      {currentDone && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B] ring-1 ring-[#E5E7EB]">
                      Step {selected + 1} of {totalSteps}
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#64748B]">
                    {step.chapter_title} › {step.module_title}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172033] sm:text-3xl">
                    {step.title}
                  </h2>

                  <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-7 text-[#475569]">
                    {step.body}
                  </p>

                  {moduleGuide &&
                    ["lecture", "workshop", "lab"].includes(
                      step.block_type
                    ) && (
                      <ModuleExplanation
                        guide={moduleGuide}
                        phase={
                          step.block_type === "lab"
                            ? "lab"
                            : step.block_type === "workshop"
                              ? "workshop"
                              : step.title.startsWith("Worked example:")
                                ? "example"
                                : "concept"
                        }
                      />
                    )}

                  {step.practice && (
                    <PracticeProgram
                      data={step.practice}
                      isLab={step.block_type === "lab"}
                    />
                  )}

                  {step.kind === "fill_blank" && (
                    <label className="mt-6 block text-sm font-bold text-[#172033]">
                      Your answer
                      <input
                        value={response}
                        onChange={(event) => setResponse(event.target.value)}
                        className="mt-2 block w-full max-w-md rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 font-normal text-[#172033] focus:border-[#E85D2A] focus-visible:ring-2 focus-visible:ring-[#FF6B35]/25"
                        autoComplete="off"
                      />
                    </label>
                  )}

                  {(step.kind === "code" || step.kind === "project") && (
                    <div className="mt-6 space-y-5">
                      <label className="block text-sm font-bold text-[#172033]">
                        {step.starter_code
                          ? "Your HTML"
                          : "Your plan or solution"}
                        <textarea
                          value={response}
                          onChange={(event) => setResponse(event.target.value)}
                          spellCheck={false}
                          rows={12}
                          className="mt-2 block w-full rounded-xl border border-[#CBD5E1] bg-[#172033] p-4 font-mono text-sm font-normal text-white focus:border-[#E85D2A] focus-visible:ring-2 focus-visible:ring-[#FF6B35]/30"
                        />
                      </label>
                      {step.starter_code ? (
                        <div>
                          <p className="mb-2 text-sm font-bold text-[#172033]">
                            Live preview
                          </p>
                          <iframe
                            title="Your HTML preview"
                            sandbox=""
                            srcDoc={`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">${response}`}
                            className="h-56 w-full rounded-xl border border-[#CBD5E1] bg-white"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-[#64748B]">
                          This practice response is self-reported. Code is not
                          executed here; the final project receives
                          administrator review.
                        </p>
                      )}
                    </div>
                  )}

                  {missing.length > 0 && (
                    <p
                      role="status"
                      className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                    >
                      Include these required concepts or elements:{" "}
                      <strong>{missing.join(", ")}</strong>.
                    </p>
                  )}

                  {selectedLocked && (
                    <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#475569]">
                      You can read this module now. Complete the earlier steps
                      to submit this activity and record progress.
                    </p>
                  )}

                  {error && (
                    <p
                      role="alert"
                      className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}{" "}
                      {error.startsWith("Sign in") && (
                        <Link className="font-bold underline" href="/login">
                          Sign in
                        </Link>
                      )}
                    </p>
                  )}

                  {message && (
                    <p
                      role="status"
                      className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-[#166534]"
                    >
                      {message}
                    </p>
                  )}

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-6">
                    <button
                      type="button"
                      onClick={() => selectStep(selected - 1)}
                      disabled={selected === 0}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-bold text-[#334155] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous step
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void submit()}
                        disabled={
                          busy ||
                          selectedLocked ||
                          (step.kind !== "reading" && !response.trim())
                        }
                        className="rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#E85D2A] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy
                          ? "Checking…"
                          : step.kind === "reading"
                            ? currentDone
                              ? "Completed ✓"
                              : "I've completed this"
                            : step.kind === "project"
                              ? "Check lab response"
                              : "Check answer"}
                      </button>

                      {selected < totalSteps - 1 && (
                        <button
                          type="button"
                          onClick={() => selectStep(selected + 1)}
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                            currentDone
                              ? "bg-[#172033] text-white hover:bg-[#0F172A]"
                              : "border border-[#CBD5E1] bg-white text-[#172033] hover:bg-slate-50"
                          }`}
                        >
                          Next step
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {path.completion && (
                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                      <div>
                        <strong className="text-sm text-emerald-900">
                          Path completed
                        </strong>
                        <p className="mt-1 text-xs text-emerald-800">
                          Your progress is saved to your account.
                        </p>
                        <Link
                          href={`/learning-paths/verify/${path.completion.id}`}
                          className="mt-2 inline-block text-xs font-bold text-emerald-900 underline"
                        >
                          View verifiable completion record
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            {path.project && (
              <div id="guided-assessment" className="scroll-mt-24">
                <GuidedAssessmentPanel
                  slug={path.slug}
                  project={path.project}
                  ready={completed === path.steps.length && !!path.assessment}
                  initial={path.assessment}
                />
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
