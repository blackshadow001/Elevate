import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { Categories } from "@/components/home/Categories";
import { PopularCourses } from "@/components/home/PopularCourses";
import { CTA } from "@/components/home/CTA";
import { courseService } from "@/services/courseService";

export const instant = false;

export default async function HomePage() {
  const courses = await courseService.getAllCourses();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats courseCount={courses.length} />
        <Categories courses={courses} />
        <PopularCourses courses={courses} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
