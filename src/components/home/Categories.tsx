import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, BriefcaseBusiness, Code2, Heart, Megaphone, Palette, PenTool, TrendingUp, Workflow } from "lucide-react";
import { Course } from "@/types";

const categoryIcons = {
  "AI & Generative AI": BrainCircuit,
  "AI Tools & Automation": Workflow,
  "Technology & Programming": Code2,
  "Digital Marketing": Megaphone,
  "Business & Entrepreneurship": BriefcaseBusiness,
  "Sales & Communication": TrendingUp,
  "Finance & Investment Basics": BookOpen,
  "Mindfulness & Personal Development": Heart,
  "Freelancing & Online Income": PenTool,
  "Design & Content Creation": Palette,
} as const;

const categoryStyles = [
  { icon: "bg-[#FFF0E9] text-[#E45D32]", glow: "bg-[#FFE7DA]", line: "group-hover:bg-[#E45D32]" },
  { icon: "bg-[#EAF3FF] text-[#3D76DD]", glow: "bg-[#E4EFFF]", line: "group-hover:bg-[#3D76DD]" },
  { icon: "bg-[#EEEAFE] text-[#7552D7]", glow: "bg-[#EBE5FF]", line: "group-hover:bg-[#7552D7]" },
  { icon: "bg-[#FFF2E1] text-[#D88423]", glow: "bg-[#FFECD3]", line: "group-hover:bg-[#D88423]" },
  { icon: "bg-[#E9F7F1] text-[#25906D]", glow: "bg-[#DDF3E9]", line: "group-hover:bg-[#25906D]" },
  { icon: "bg-[#FDECF3] text-[#D4568A]", glow: "bg-[#FBE2ED]", line: "group-hover:bg-[#D4568A]" },
  { icon: "bg-[#E9F5F8] text-[#23859A]", glow: "bg-[#E0F1F6]", line: "group-hover:bg-[#23859A]" },
  { icon: "bg-[#F0F4E6] text-[#708B35]", glow: "bg-[#EAF0DB]", line: "group-hover:bg-[#708B35]" },
  { icon: "bg-[#FFF0ED] text-[#CC6850]", glow: "bg-[#FFE6DF]", line: "group-hover:bg-[#CC6850]" },
  { icon: "bg-[#F0EDFA] text-[#7660B6]", glow: "bg-[#EAE5F8]", line: "group-hover:bg-[#7660B6]" },
];

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
        {catalogCategories.map(({ id, name, subcategories }, index) => {
          const count = courseCounts.get(name) ?? 0;
          const Icon = categoryIcons[name as keyof typeof categoryIcons] ?? BookOpen;
          const style = categoryStyles[index % categoryStyles.length];
          return <Link key={id} href={`/courses?category=${encodeURIComponent(name)}`}
            className="group relative flex min-h-52 flex-col overflow-hidden rounded-2xl border border-[#E1E6ED] bg-white p-5 shadow-[0_2px_10px_rgba(23,32,51,0.03)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-[#C6D0DF] hover:shadow-[0_16px_30px_rgba(23,32,51,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D65B28]">
            <span aria-hidden="true" className={`absolute -right-10 -top-16 h-36 w-36 rounded-full opacity-60 blur-2xl transition-transform duration-300 group-hover:scale-125 ${style.glow}`} />
            <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-transparent transition-colors ${style.line}`} />
            <span className="relative flex items-start justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${style.icon}`}><Icon className="h-5 w-5" strokeWidth={1.9} /></span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#9BA8BA] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            <span className="relative mt-5 block flex-1">
              <span className="block text-[15px] font-extrabold leading-snug text-[#172033]">{name}</span>
              <span className="mt-1.5 block min-h-9 text-xs leading-relaxed text-[#69778C]">{subcategories.slice(0, 2).join(" · ") || "Explore courses in this subject"}</span>
            </span>
            <span className="relative mt-4 flex items-center justify-between border-t border-[#EDF0F4] pt-3 text-xs font-semibold text-[#56657B]">
              <span>{count} {count === 1 ? "course" : "courses"}</span>
              <span className="inline-flex items-center gap-1 text-[#D65B28] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Explore <ArrowRight aria-hidden="true" className="h-3 w-3" /></span>
            </span>
          </Link>;
        })}
      </div>
    </div>
  </section>;
}
