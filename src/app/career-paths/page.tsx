import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { courseService } from "@/services/courseService";
import { listCatalogCategories } from "@/server/catalogCategories";

export const instant = false;
export const metadata = { title: "Learning Paths — Elevate" };

export default async function CareerPathsPage() {
  const courses = await courseService.getAllCourses();
  const paths = listCatalogCategories().flatMap(({ name, subcategories }) => subcategories.map((subcategory) => ({
    category: name, subcategory,
    courses: courses.filter((course) => course.category === name && course.subcategory === subcategory),
  }))).filter((path) => path.courses.length > 0);

  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="mx-auto w-full max-w-7xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
    <p className="text-xs font-extrabold uppercase tracking-widest text-[#D65B28]">Learn one concept at a time</p>
    <h1 className="mt-3 text-4xl font-extrabold text-[#172033]">Learning paths</h1>
    <p className="mt-3 max-w-2xl text-[#64748B]">Follow a subject through related courses. Choose and buy individual videos at your own pace.</p>
    {paths.length ? <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{paths.map((path) => <Link key={`${path.category}:${path.subcategory}`}
      href={`/courses?category=${encodeURIComponent(path.category)}&subcategory=${encodeURIComponent(path.subcategory)}`}
      className="group rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#FFB799] hover:shadow-lg">
      <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF0E8] text-[#D65B28]"><BookOpen className="h-5 w-5" /></span><ArrowUpRight className="h-5 w-5 text-[#94A3B8] group-hover:text-[#D65B28]" /></div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#D65B28]">{path.category}</p>
      <h2 className="mt-2 text-xl font-extrabold text-[#172033]">{path.subcategory}</h2>
      <p className="mt-2 text-sm text-[#64748B]">{path.courses.length} {path.courses.length === 1 ? "course" : "courses"}</p>
      <p className="mt-4 border-t border-[#F1F2F4] pt-4 text-sm text-[#475569]">{path.courses.slice(0, 3).map((course) => course.title).join(" · ")}</p>
    </Link>)}</div> : <div className="mt-10 rounded-3xl border border-[#E5E7EB] bg-white p-8"><h2 className="text-lg font-bold text-[#172033]">Learning paths are growing</h2><p className="mt-2 text-sm text-[#64748B]">Published courses will appear here once they are organized into subcategories.</p><Link href="/courses" className="mt-5 inline-block font-bold text-[#D65B28]">Browse available courses</Link></div>}
  </main><Footer /></div>;
}
