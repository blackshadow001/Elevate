import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, PlayCircle, Sparkles, Star, Zap } from "lucide-react";
import type { Course } from "@/types";

export function Hero({ courses }: { courses: Course[] }) {
  const featured = courses.slice(0, 2);

  return (
    <section className="relative overflow-hidden border-b border-[#E5E7EB]/60 bg-gradient-to-b from-[#FFFDF9] via-white to-[#F7F8FA] py-16 lg:py-24">
      <div className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-[#FF6B35]/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-[#FF6B35]/5 blur-2xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="text-center lg:col-span-7 lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/60 bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-[#E85D2A] sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Learn with Elevate
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#172033] sm:text-5xl lg:text-[64px]">
            Learn skills. <br />
            Elevate your <span className="relative inline-block text-[#FF6B35]">future.<svg className="absolute -bottom-2 left-0 h-3 w-full text-[#FF6B35]/35" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /></svg></span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#64748B] sm:text-lg lg:mx-0">
            Explore available courses, learn from instructors, and build skills at your own pace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Link href="/courses" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-8 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-[#E85D2A] sm:w-auto">
              Explore Courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/career-paths" className="inline-flex w-full items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-7 py-3.5 font-semibold text-[#172033] shadow-sm hover:bg-[#F7F8FA] sm:w-auto">
              View Career Paths
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#64748B] lg:justify-start">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />Learn at your pace</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />Track your progress</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />Build practical skills</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] px-3 pb-10 pt-6 sm:px-5 lg:col-span-5 lg:pb-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border-4 border-white bg-slate-100 shadow-2xl sm:aspect-square lg:aspect-[4/5]">
            <Image
              src="/home/students-collaborating.jpg"
              alt="Students collaborating around laptops"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 460px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/60 via-transparent to-transparent" />
          </div>

          <Link href={featured[0] ? `/courses/${featured[0].slug}` : "/courses"} className="absolute left-0 top-0 flex max-w-[220px] items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/95 p-3.5 shadow-xl backdrop-blur-md motion-safe:transition-transform motion-safe:hover:-translate-y-1 sm:-left-4" aria-label={featured[0] ? `View ${featured[0].title}` : "Browse courses"}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35]"><Zap className="h-5 w-5" aria-hidden="true" /></span>
            <span className="min-w-0 text-left"><strong className="block truncate text-xs text-[#172033]">{featured[0]?.title || "Explore courses"}</strong><span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#64748B]">{featured[0]?.ratingCount ? <><Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />{featured[0].rating.toFixed(1)} · </> : null}{featured[0] ? `${featured[0].totalLessons} ${featured[0].totalLessons === 1 ? "lesson" : "lessons"}` : "Find your next skill"}</span></span>
          </Link>

          <Link href={featured[1] ? `/courses/${featured[1].slug}` : "/courses"} className="absolute bottom-32 right-0 flex max-w-[220px] items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/95 p-3.5 shadow-xl backdrop-blur-md motion-safe:transition-transform motion-safe:hover:-translate-y-1 sm:-right-3" aria-label={featured[1] ? `View ${featured[1].title}` : "Explore learning options"}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><PlayCircle className="h-5 w-5" aria-hidden="true" /></span>
            <span className="min-w-0 text-left"><strong className="block truncate text-xs text-[#172033]">{featured[1]?.title || "Flexible learning"}</strong><span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#64748B]">{featured[1]?.ratingCount ? <><Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />{featured[1].rating.toFixed(1)} · </> : null}{featured[1] ? `${featured[1].totalLessons} ${featured[1].totalLessons === 1 ? "lesson" : "lessons"}` : "Learn at your pace"}</span></span>
          </Link>

          <div className="absolute bottom-0 left-5 w-[260px] rounded-2xl border border-[#E5E7EB] bg-white/95 p-4 shadow-xl backdrop-blur-md sm:-bottom-6 sm:left-2">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#172033]"><span>Your learning journey</span><BookOpenCheck className="h-4 w-4 text-[#FF6B35]" aria-hidden="true" /></div>
            <div className="mt-3 flex gap-1" aria-hidden="true"><span className="h-2 flex-1 rounded-full bg-[#FF6B35]" /><span className="h-2 flex-1 rounded-full bg-[#FF8D66]" /><span className="h-2 flex-1 rounded-full bg-orange-100" /></div>
            <p className="mt-2 text-[11px] text-[#64748B]">{courses.length ? `${courses.length} published ${courses.length === 1 ? "course" : "courses"} to explore` : "Find a course to get started"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
