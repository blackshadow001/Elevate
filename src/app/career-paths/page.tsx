import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { mockCareerPaths } from "@/data/careerPaths";
import { Code2, BarChart4, Layout, ArrowRight, CheckCircle2, Briefcase, Clock, Layers } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Code2,
  BarChart4,
  Layout,
};

export const metadata = {
  title: "Career Paths — Elevate",
  description: "End-to-end curriculum roadmaps designed to help you land high-paying tech jobs.",
};

export default function CareerPathsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-wider uppercase text-[#FF6B35]">
              Goal-Driven Learning
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight mt-2">
              Career Paths
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
              Don&apos;t just learn isolated topics. Follow guided industry roadmaps from fundamental concepts to production mastery and placement preparation.
            </p>
          </div>

          {/* Paths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockCareerPaths.map((path) => {
              const Icon = iconMap[path.iconName] || Code2;
              return (
                <div
                  key={path.id}
                  className="bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/50 p-8 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B35] mb-6">
                      <Icon className="w-7 h-7" />
                    </div>

                    <h2 className="text-2xl font-bold text-[#172033] mb-2">{path.title}</h2>
                    <p className="text-xs font-semibold text-[#16A34A] mb-4">
                      Avg. Salary: {path.salaryRange}
                    </p>

                    <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                      {path.description}
                    </p>

                    {/* Stats summary */}
                    <div className="space-y-3 py-4 border-y border-[#F1F5F9] text-xs text-[#172033] mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#FF6B35]" /> Courses
                        </span>
                        <span className="font-bold">{path.coursesCount} Programs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#FF6B35]" /> Estimated Time
                        </span>
                        <span className="font-bold">{path.durationHours}+ Hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-[#FF6B35]" /> Capstone Projects
                        </span>
                        <span className="font-bold">{path.projectsCount} Portfolio Projects</span>
                      </div>
                    </div>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-8">
                      {path.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="bg-[#F7F8FA] border border-[#E5E7EB] text-[#172033] text-xs font-medium px-2.5 py-1 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/career-paths/${path.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-sm font-semibold py-3.5 px-5 rounded-xl shadow-md shadow-orange-500/20 transition-all"
                  >
                    <span>View Curriculum</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
