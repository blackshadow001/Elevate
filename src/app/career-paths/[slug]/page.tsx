import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CatalogArtwork } from "@/components/courses/CatalogArtwork";
import { LEARNING_ROADMAPS, roadmapSteps } from "@/lib/learningRoadmaps";
import { courseService } from "@/services/courseService";
import type { Metadata } from "next";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = LEARNING_ROADMAPS.find((item) => item.slug === slug);
  if (!roadmap) return { title: "Roadmap not found — Elevate", robots: { index: false } };
  return {
    title: `${roadmap.title} Roadmap — Elevate`,
    description: roadmap.description,
    alternates: { canonical: `https://elevate.courses/career-paths/${encodeURIComponent(roadmap.slug)}` },
    openGraph: {
      title: `${roadmap.title} Roadmap — Elevate`,
      description: roadmap.description,
      url: `https://elevate.courses/career-paths/${encodeURIComponent(roadmap.slug)}`,
    },
  };
}

export async function generateStaticParams() {
  return LEARNING_ROADMAPS.map((item) => ({
    slug: item.slug,
  }));
}

export default async function CareerPathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const roadmap = LEARNING_ROADMAPS.find((item) => item.slug === slug);
  if (!roadmap) notFound();
  const courses = await courseService.getAllCourses();
  const steps = roadmapSteps(roadmap, courses);
  const available = steps.filter((step) => step.publishedCourse).length;

  return <div className="flex min-h-screen flex-col bg-[#FFFDF9]">
    <Navbar />
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/career-paths" className="inline-flex items-center gap-2 text-sm font-bold text-[#D65B28] hover:underline"><ArrowLeft aria-hidden="true" className="h-4 w-4" />All roadmaps</Link>
      <div className="mt-7 overflow-hidden rounded-3xl border border-[#E1E6ED] bg-white shadow-sm">
        <CatalogArtwork categoryId={roadmap.categoryId} className="h-36 w-full" />
        <div className="p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D65B28]">Guided learning roadmap</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#172033] sm:text-4xl">{roadmap.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#64748B] sm:text-base">{roadmap.description}</p>
          <p className="mt-5 text-sm font-semibold text-[#475569]">{steps.length} steps · {available} available now · {steps.length - available} coming soon</p>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-2xl font-extrabold text-[#172033]">Your learning steps</h2>
        {steps.map((step, index) => <article key={step.title} className="flex gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:gap-6 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FFF0E9] text-sm font-black text-[#C55327]">{String(index + 1).padStart(2, "0")}</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-[#172033] sm:text-lg">{step.title}</h3>
            <p className="mt-1 text-xs text-[#64748B]">{step.category} · {step.subcategory} · Tamil</p>
            {step.publishedCourse ? <Link href={`/courses/${step.publishedCourse.slug}`} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#D65B28] hover:underline"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />View available course <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              : <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#64748B]"><Clock3 aria-hidden="true" className="h-4 w-4" />Coming soon · suggested ₹{step.suggestedPrice}</p>}
          </div>
        </article>)}
      </div>
    </main>
    <Footer />
  </div>;
}
