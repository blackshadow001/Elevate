import { AlertCircle, ArrowRight, BookOpen, Lightbulb, Target } from "lucide-react";
import type { LearningGuideData, ModuleGuideData } from "@/data/learningGuides";

export function CoursePurpose({ guide }: { guide: LearningGuideData }) {
  return <section className="mt-6 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8" aria-label="About this learning path">
    <p className="text-xs font-extrabold uppercase tracking-widest text-[#D65B28]">Why this path exists</p>
    <p className="mt-3 max-w-4xl text-base leading-8 text-[#334155]">{guide.purpose}</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-[#F7F8FA] p-4"><p className="flex items-center gap-2 text-sm font-extrabold text-[#172033]"><BookOpen className="h-4 w-4 text-[#E85D2A]" /> Starting point</p><p className="mt-2 text-sm leading-6 text-[#475569]">{guide.startingPoint}</p></div>
      <div className="rounded-2xl bg-[#F7F8FA] p-4"><p className="flex items-center gap-2 text-sm font-extrabold text-[#172033]"><Target className="h-4 w-4 text-[#E85D2A]" /> What you will make</p><p className="mt-2 text-sm leading-6 text-[#475569]">{guide.outcome}</p></div>
    </div>
    <h2 className="mt-7 text-sm font-extrabold text-[#172033]">Your learning journey</h2>
    <ol className="mt-3 flex flex-wrap gap-2">{guide.journey.map((item, index) => <li key={item} className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#334155]"><span className="font-extrabold text-[#D65B28]">{index + 1}</span>{item}{index < guide.journey.length - 1 && <ArrowRight className="h-3 w-3 text-[#94A3B8]" />}</li>)}</ol>
    <p className="mt-6 text-xs leading-5 text-[#64748B]">Read the idea, study a worked example, follow a program, then complete a variation and knowledge checks. Run code in your own editor or terminal. Practice reflections record progress; the final project receives administrator review.</p>
    <a href="#current-lesson" className="mt-5 inline-flex rounded-xl bg-[#172033] px-4 py-3 text-sm font-bold text-white hover:bg-[#26334a]">Continue to the current lesson <ArrowRight className="ml-2 h-4 w-4" /></a>
  </section>;
}

export function ModuleExplanation({ guide, phase }: { guide: ModuleGuideData; phase: "concept" | "example" | "workshop" | "lab" }) {
  if (phase === "lab") return <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
    <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#172033]"><AlertCircle className="h-4 w-4 text-amber-700" /> Before you submit</h3>
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#475569]">{guide.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul>
  </div>;
  if (phase === "concept") return <div className="mt-6 space-y-5">
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><h3 className="flex items-center gap-2 text-sm font-extrabold text-[#172033]"><Lightbulb className="h-4 w-4 text-[#E85D2A]" /> Why you are learning this</h3><p className="mt-2 text-sm leading-7 text-[#334155]">{guide.why}</p></div>
    <div><h3 className="text-sm font-extrabold text-[#172033]">Ideas to understand first</h3><dl className="mt-3 grid gap-3 sm:grid-cols-2">{guide.concepts.map(([term, meaning]) => <div key={term} className="rounded-xl border border-[#E5E7EB] p-4"><dt className="text-sm font-bold text-[#172033]">{term}</dt><dd className="mt-2 text-sm leading-6 text-[#475569]">{meaning}</dd></div>)}</dl></div>
    <p className="rounded-xl bg-[#F7F8FA] p-4 text-sm leading-6 text-[#475569]"><strong className="text-[#172033]">How this contributes to your project:</strong> {guide.projectLink}</p>
  </div>;
  return <div className="mt-6 space-y-4">
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-5"><h3 className="text-sm font-extrabold text-[#172033]">{phase === "workshop" ? "Understand the program" : "What is happening in this example"}</h3><ol className="mt-3 space-y-3">{guide.walkthrough.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#334155]"><span className="font-extrabold text-[#D65B28]">{index + 1}.</span>{item}</li>)}</ol></div>
    {phase === "workshop" && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="text-sm font-extrabold text-[#172033]">Common mistakes to avoid</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#475569]">{guide.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></div>}
  </div>;
}
