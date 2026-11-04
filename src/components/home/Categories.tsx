import Link from "next/link";
import { ArrowUpRight, BookOpen, BrainCircuit, Cloud, Code2, Database, Palette, ShieldCheck } from "lucide-react";
import { Course } from "@/types";

const categoryIcons = {
  Development: Code2,
  "Data Science": Database,
  Cybersecurity: ShieldCheck,
  Design: Palette,
  "AI & ML": BrainCircuit,
  "Cloud & DevOps": Cloud,
} as const;

export function Categories({ courses }: { courses: Course[] }) {
  const categories = new Map<string, { count: number; example: string }>();
  for (const course of courses) {
    if (!course.category) continue;
    const current = categories.get(course.category);
    categories.set(course.category, {
      count: (current?.count ?? 0) + 1,
      example: current?.example ?? course.title,
    });
  }
  if (!categories.size) return null;

  return <section className="relative overflow-hidden border-y border-[#E7E8ED] bg-[#F8F7F4] py-16 sm:py-20">
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-56 h-96 w-96 rounded-full bg-[#FF6B35]/10 blur-3xl" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#C75A2D]">Explore the catalog</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Find your next subject</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">Choose a field to see its published courses, lessons, and instructors.</p>
        </div>
        <div className="flex w-fit items-center gap-3 rounded-full border border-[#F2D7C9] bg-white px-4 py-2.5 shadow-sm">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#FF6B35]" />
          <span className="text-sm font-bold text-[#172033]">{courses.length} {courses.length === 1 ? "course" : "courses"} available</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...categories].map(([name, { count, example }]) => {
          const Icon = categoryIcons[name as keyof typeof categoryIcons] ?? BookOpen;
          return <Link key={name} href={`/courses?category=${encodeURIComponent(name)}`}
            className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#FFB799] hover:shadow-xl hover:shadow-orange-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85D2A]">
            <span aria-hidden="true" className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FFF3EC] transition-transform duration-300 group-hover:scale-125" />
            <span className="relative flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFF0E8] text-[#D85F2B]"><Icon className="h-6 w-6" /></span>
              <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-[#94A3B8] transition-colors group-hover:text-[#E85D2A]" />
            </span>
            <span className="relative mt-6 block">
              <span className="block text-lg font-extrabold text-[#172033] group-hover:text-[#D65B28]">{name}</span>
              <span className="mt-1 block text-xs font-semibold text-[#64748B]">{count} {count === 1 ? "course" : "courses"}</span>
              <span className="mt-3 block truncate border-t border-[#F1F2F4] pt-3 text-xs text-[#64748B]" title={example}>Includes {example}</span>
            </span>
          </Link>;
        })}
      </div>
      <Link href="/courses" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#D65B28] hover:underline">Browse all courses <ArrowUpRight className="h-4 w-4" /></Link>
    </div>
  </section>;
}
