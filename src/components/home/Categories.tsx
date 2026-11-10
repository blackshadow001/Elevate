import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Course } from "@/types";
import { MICRO_COURSE_TOPICS } from "@/lib/microCourseTopics";
import { CatalogArtwork } from "@/components/courses/CatalogArtwork";

type CatalogCategory = { id: string; name: string; subcategories: string[] };

export function Categories({ courses, categories: catalogCategories }: { courses: Course[]; categories: CatalogCategory[] }) {
  const courseCounts = new Map<string, number>();
  for (const course of courses) {
    if (course.category) courseCounts.set(course.category, (courseCounts.get(course.category) ?? 0) + 1);
  }

  return <section className="relative overflow-hidden border-y border-[#E8EBF0] bg-[#F7F8FA] py-16 sm:py-20">
    <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-8 h-96 w-96 rounded-full bg-[#E8EDFF]/70 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#FFF0E7]/80 blur-3xl" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#D65B28]">Find your direction</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Explore top categories</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-[#64748B] sm:text-base">Follow your curiosity, one skill at a time.</p>
        </div>
        <Link href="/courses" className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-[#D65B28] hover:text-[#A9451F] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D65B28]">
          Browse all courses <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {catalogCategories.map(({ id, name, subcategories }) => {
          const count = courseCounts.get(name) ?? 0;
          const planned = MICRO_COURSE_TOPICS.filter((topic) => topic.category === name || id === topic.category.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).length;
          return <Link key={id} href={`/courses?category=${encodeURIComponent(name)}`}
            className="group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-[#E1E6ED] bg-white shadow-[0_2px_10px_rgba(23,32,51,0.03)] transition-[transform,box-shadow,border-color] duration-700 ease-out hover:-translate-y-0.5 hover:border-[#C6D0DF] hover:shadow-[0_16px_30px_rgba(23,32,51,0.10)] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D65B28]">
            <CatalogArtwork categoryId={id} className="h-28 w-full" />
            <span className="relative flex flex-1 flex-col p-5">
              <span className="absolute right-5 top-5"><ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#9BA8BA] transition-transform duration-700 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" /></span>
              <span className="block text-[15px] font-extrabold leading-snug text-[#172033]">{name}</span>
              <span className="mt-1.5 block min-h-9 text-xs leading-relaxed text-[#69778C]">{subcategories.slice(0, 2).join(" · ") || "Explore courses in this subject"}</span>
              <span className="relative mt-auto flex items-center justify-between border-t border-[#EDF0F4] pt-3 text-xs font-semibold text-[#56657B]">
                <span>{count} live · {planned} planned</span>
                <span className="inline-flex items-center gap-1 text-[#D65B28] opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">Explore <ArrowRight aria-hidden="true" className="h-3 w-3" /></span>
              </span>
            </span>
          </Link>;
        })}
      </div>
    </div>
  </section>;
}
