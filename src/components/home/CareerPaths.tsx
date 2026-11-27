import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CatalogArtwork } from "@/components/courses/CatalogArtwork";
import { LEARNING_ROADMAPS, roadmapSteps, type LearningRoadmap } from "@/lib/learningRoadmaps";
import type { Course } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

export function RoadmapCard({ roadmap, courses }: { roadmap: LearningRoadmap; courses: Course[] }) {
  const steps = roadmapSteps(roadmap, courses);
  const available = steps.filter((step) => step.publishedCourse).length;
  return <Link href={`/career-paths/${roadmap.slug}`}
    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E1E6ED] bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-700 ease-out hover:-translate-y-0.5 hover:border-[#C6D0DF] hover:shadow-[0_16px_30px_rgba(23,32,51,0.10)] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D65B28]">
    <CatalogArtwork categoryId={roadmap.categoryId} className="h-28 w-full" />
    <span className="flex flex-1 flex-col p-6">
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D65B28]">Guided roadmap</span>
      <strong className="mt-2 text-xl font-extrabold text-[#172033]">{roadmap.title}</strong>
      <span className="mt-2 text-sm leading-relaxed text-[#64748B]">{roadmap.description}</span>
      <span className="mt-5 flex flex-wrap gap-2">{steps.slice(0, 3).map((step) => <span key={step.title} className="rounded-full bg-[#F3F5F8] px-2.5 py-1 text-xs font-semibold text-[#475569]">{step.title}</span>)}</span>
      <span className="mt-auto flex items-center justify-between border-t border-[#EDF0F4] pt-5 text-xs font-semibold text-[#64748B]">
        <span>{steps.length} steps · {available} available</span>
        <span className="inline-flex items-center gap-1 text-[#D65B28]">View roadmap <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-700 group-hover:translate-x-1 motion-reduce:transition-none" /></span>
      </span>
    </span>
  </Link>;
}

export function CareerPaths({ courses }: { courses: Course[] }) {
  return <section className="border-y border-[#E5E7EB] bg-[#F7F8FA] py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <Reveal direction="up">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D65B28]">A clear next step</p>
          </Reveal>
          <Reveal variant="mask" delay={0.05}>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Follow a learning roadmap</h2>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-2 text-sm leading-relaxed text-[#64748B] sm:text-base">Follow related topics in order. Each video becomes available after its course is published.</p>
          </Reveal>
        </div>
        <Reveal direction="left" delay={0.08}>
          <Link href="/career-paths" className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-[#D65B28] transition-colors hover:text-[#A9451F]">Explore all roadmaps <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" /></Link>
        </Reveal>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {LEARNING_ROADMAPS.map((roadmap, idx) => (
          <Reveal key={roadmap.slug} direction="up" delay={idx * 0.06} className="h-full">
            <RoadmapCard roadmap={roadmap} courses={courses} />
          </Reveal>
        ))}
      </div>
      <p className="mt-6 inline-flex items-center gap-2 text-xs text-[#64748B]"><CheckCircle2 aria-hidden="true" className="h-4 w-4 text-[#16A34A]" />Roadmaps show the learning order; purchase is only available for published courses.</p>
    </div>
  </section>;
}
