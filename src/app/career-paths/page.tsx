import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RoadmapCard } from "@/components/home/CareerPaths";
import { LEARNING_ROADMAPS } from "@/lib/learningRoadmaps";
import { courseService } from "@/services/courseService";

export const instant = false;
export const metadata = { title: "Learning Roadmaps — Elevate", description: "Follow ordered topics and see which Elevate courses are ready to learn." };

export default async function CareerPathsPage() {
  const courses = await courseService.getAllCourses();
  return <div className="flex min-h-screen flex-col bg-[#FFFDF9]">
    <Navbar />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D65B28]">Learn one concept at a time</p>
      <h1 className="mt-3 text-4xl font-extrabold text-[#172033]">Learning roadmaps</h1>
      <p className="mt-3 max-w-2xl text-[#64748B]">Choose a path and follow its topics in order. Available courses link to their lessons; planned topics are clearly marked.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{LEARNING_ROADMAPS.map((roadmap) => <RoadmapCard key={roadmap.slug} roadmap={roadmap} courses={courses} />)}</div>
      <p className="mt-10 text-sm text-[#64748B]">Want to browse a single topic? <Link href="/courses" className="font-bold text-[#D65B28] hover:underline">Explore the full catalog</Link>.</p>
    </main>
    <Footer />
  </div>;
}
