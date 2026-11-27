import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RoadmapCard } from "@/components/home/CareerPaths";
import { LEARNING_ROADMAPS } from "@/lib/learningRoadmaps";
import { courseService } from "@/services/courseService";
import { Reveal } from "@/components/ui/Reveal";

import type { Metadata } from "next";

export const instant = false;
export const metadata: Metadata = {
  title: "Learning Roadmaps — Elevate",
  description: "Follow ordered career roadmaps and see which Elevate courses in AI, technology, and business are ready to learn.",
  alternates: { canonical: "https://elevate.courses/career-paths" },
  openGraph: {
    title: "Learning Roadmaps — Elevate",
    description: "Follow ordered career roadmaps and see which Elevate courses in AI, technology, and business are ready to learn.",
    url: "https://elevate.courses/career-paths",
  },
};

export default async function CareerPathsPage() {
  const courses = await courseService.getAllCourses();
  return <div className="flex min-h-screen flex-col bg-[#FFFDF9]">
    <Navbar />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <Reveal immediate direction="up">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D65B28]">Learn one concept at a time</p>
      </Reveal>
      <Reveal immediate variant="mask" delay={0.05}>
        <h1 className="mt-3 text-4xl font-extrabold text-[#172033]">Learning roadmaps</h1>
      </Reveal>
      <Reveal immediate direction="up" delay={0.1}>
        <p className="mt-3 max-w-2xl text-[#64748B]">Choose a path and follow its topics in order. Available courses link to their lessons; planned topics are clearly marked.</p>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{LEARNING_ROADMAPS.map((roadmap, idx) => <Reveal key={roadmap.slug} direction="up" delay={idx * 0.06} className="h-full"><RoadmapCard roadmap={roadmap} courses={courses} /></Reveal>)}</div>
      <p className="mt-10 text-sm text-[#64748B]">Want to browse a single topic? <Link href="/courses" className="font-bold text-[#D65B28] hover:underline">Explore the full catalog</Link>.</p>
    </main>
    <Footer />
  </div>;
}
