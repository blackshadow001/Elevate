import Link from "next/link";
import { Code2, BarChart4, Layout, ArrowRight, BookOpen, Clock, FolderGit2 } from "lucide-react";
import { mockCareerPaths } from "@/data/careerPaths";

const iconMap: Record<string, React.ElementType> = {
  Code2,
  BarChart4,
  Layout,
};

export function CareerPaths() {
  return (
    <section className="py-20 bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-[#FF6B35] mb-2">
              Structured Roadmap
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              Learn by career path
            </h2>
            <p className="mt-2 text-base text-[#64748B]">
              Structured learning paths to help you achieve your career goals and step into top roles.
            </p>
          </div>
          <Link
            href="/career-paths"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6B35] hover:text-[#E85D2A] transition-colors"
          >
            <span>Explore all roadmaps</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Career Paths Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCareerPaths.map((path) => {
            const Icon = iconMap[path.iconName] || Code2;
            return (
              <div
                key={path.id}
                className="bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 p-8 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B35] mb-6 group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors mb-3">
                    {path.title}
                  </h3>

                  <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                    {path.description}
                  </p>

                  {/* Technology Badges */}
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

                <div>
                  {/* Meta stats */}
                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#F1F5F9] text-center mb-6">
                    <div>
                      <div className="text-xs text-[#64748B]">Courses</div>
                      <div className="text-sm font-bold text-[#172033] mt-0.5">{path.coursesCount} Courses</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">Duration</div>
                      <div className="text-sm font-bold text-[#172033] mt-0.5">{path.durationHours}+ Hours</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">Portfolio</div>
                      <div className="text-sm font-bold text-[#172033] mt-0.5">{path.projectsCount} Projects</div>
                    </div>
                  </div>

                  <Link
                    href={`/career-paths/${path.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#FF6B35] text-white text-sm font-semibold py-3 px-5 rounded-xl transition-colors duration-200"
                  >
                    <span>Explore Path</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
