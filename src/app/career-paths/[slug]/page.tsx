import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { courseService } from "@/services/courseService";
import { CheckCircle2, ArrowRight, Award, Briefcase, Clock, Layers } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const paths = await courseService.getCareerPaths();
  return paths.map((path) => ({
    slug: path.slug,
  }));
}

export default async function CareerPathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const path = await courseService.getCareerPathBySlug(slug);

  if (!path) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Navy Header */}
        <section className="bg-[#172033] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
                Career Track
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {path.title}
              </h1>
              <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                {path.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm text-[#94A3B8]">
                <div>⏱️ {path.durationHours}+ hours total</div>
                <div>📚 {path.coursesCount} sequential courses</div>
                <div>🚀 {path.projectsCount} portfolio projects</div>
                <div className="text-emerald-400 font-semibold">💰 {path.salaryRange}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xs">
                <h2 className="text-xl font-bold text-[#172033] mb-4">
                  Technologies You Will Master
                </h2>
                <div className="flex flex-wrap gap-2">
                  {path.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 bg-[#F7F8FA] border border-[#E5E7EB] text-[#172033] rounded-lg text-sm font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xs">
                <h2 className="text-xl font-bold text-[#172033] mb-6">
                  Path Roadmap Modules
                </h2>
                <div className="space-y-4">
                  {path.coursesIncluded?.map((cName, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl border border-[#E5E7EB] hover:border-[#FF6B35] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6B35] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        0{idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-[#172033]">{cName}</h3>
                        <p className="text-xs text-[#64748B] mt-1">
                          Comprehensive deep dive with hands-on coding challenges and quizzes.
                        </p>
                      </div>
                      <Link
                        href="/courses"
                        className="text-xs font-semibold text-[#FF6B35] hover:underline"
                      >
                        Explore →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xl sticky top-24 space-y-6">
                <h3 className="text-lg font-bold text-[#172033]">Ready to start this path?</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Enroll in the full track to unlock structured milestone tracking, mentorship office hours, and placement assistance.
                </p>
                <Link
                  href="/courses"
                  className="w-full inline-flex items-center justify-center font-bold text-white bg-[#FF6B35] hover:bg-[#E85D2A] py-3.5 px-6 rounded-xl transition-all text-sm"
                >
                  Start This Career Track
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
