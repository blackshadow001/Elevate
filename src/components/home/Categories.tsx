import Link from "next/link";
import { Course } from "@/types";

export function Categories({ courses }: { courses: Course[] }) {
  const counts = new Map<string, number>();
  for (const course of courses) if (course.category) counts.set(course.category, (counts.get(course.category) ?? 0) + 1);
  if (!counts.size) return null;
  return <section className="bg-[#FFFDF9] py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h2 className="mb-6 text-3xl font-bold text-[#172033]">Browse by category</h2><div className="flex flex-wrap gap-3">{[...counts].map(([name, count]) => <Link key={name} href={`/courses?category=${encodeURIComponent(name)}`} className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 text-[#172033]">{name} <span className="ml-2 text-[#64748B]">{count}</span></Link>)}</div></div></section>;
}
