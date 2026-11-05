import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#E5E7EB]/60 bg-gradient-to-b from-[#FFFDF9] via-white to-[#F7F8FA] py-16 lg:py-24">
      <div className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-[#FF6B35]/8 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="text-center lg:col-span-7 lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/60 bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-[#E85D2A] sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Learn with Elevate
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#172033] sm:text-5xl lg:text-[64px]">
            Learn skills. <br />
            Elevate your <span className="text-[#FF6B35]">future.</span>
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
        </div>

        <div className="relative mx-auto w-full max-w-[460px] pb-8 lg:col-span-5 lg:pb-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border-4 border-white bg-slate-100 shadow-2xl sm:aspect-square lg:aspect-[4/5]">
            <Image
              src="/home/students-collaborating.jpg"
              alt="Students collaborating around laptops"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 460px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/45 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-1 left-4 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm sm:left-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35]"><BookOpenCheck className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-semibold text-[#172033]">Your learning starts here</span>
          </div>
        </div>
      </div>
    </section>
  );
}
