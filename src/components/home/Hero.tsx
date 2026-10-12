import Link from "next/link";
import { ArrowRight, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { mockCourses } from "@/data/courses";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-white to-[#F7F8FA] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E5E7EB]/60">
      {/* Subtle Orange Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6B35]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-72 h-72 bg-[#FF6B35]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B35] text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-[#FF6B35]" />
              <span>Next-Gen Online Learning Experience</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight text-[#172033] leading-[1.12]">
              Learn skills. <br />
              Elevate your <span className="text-[#FF6B35] relative inline-block">
                future.
                <svg className="absolute -bottom-2 left-0 w-full h-2.5 text-[#FF6B35]/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Explore world-class courses, learn from industry experts and build in-demand skills for a better tomorrow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 group text-base"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/career-paths"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F7F8FA] text-[#172033] font-semibold px-7 py-3.5 rounded-full border border-[#E5E7EB] hover:border-[#CBD5E1] transition-all text-base shadow-xs"
              >
                View Career Paths
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#64748B] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Demo Completion Certificates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Bilingual Instruction (English & Tamil)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Hands-on Project Portfolio</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image & Floating Interactive Cards */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                alt="Students collaborating and learning online"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/60 via-transparent to-transparent" />
            </div>

            {/* Floating Card 1: Full Stack Development */}
            <div className="absolute -top-4 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E5E7EB] flex items-center gap-3 animate-in fade-in duration-300 max-w-[210px]">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B35] flex items-center justify-center font-bold text-sm shrink-0">
                ⚡
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#172033] truncate">Full Stack Dev</h4>
                <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500" /> 4.8
                  </span>
                  <span>· {mockCourses[0].totalLessons} Lessons</span>
                </div>
              </div>
            </div>

            {/* Floating Card 2: Python Masterclass */}
            <div className="absolute bottom-28 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E5E7EB] flex items-center gap-3 animate-in fade-in duration-300 max-w-[220px]">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#3B82F6] flex items-center justify-center font-bold text-sm shrink-0">
                🐍
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#172033] truncate">Python Masterclass</h4>
                <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500" /> 4.9
                  </span>
                    <span>· {mockCourses[1].totalLessons} {mockCourses[1].totalLessons === 1 ? "Lesson" : "Lessons"}</span>
                </div>
              </div>
            </div>

            {/* Floating Card 3: Learning Progress */}
            <div className="absolute -bottom-6 left-6 right-6 sm:left-4 sm:right-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#E5E7EB] sm:min-w-[260px]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#172033] mb-1.5">
                <span>Your Learning Progress</span>
                <span className="text-[#FF6B35]">82%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF6B35] to-[#FFA07A] h-full rounded-full transition-all duration-500"
                  style={{ width: "82%" }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-[#64748B]">
                <span>21 of 25 Modules</span>
                <span className="text-[#16A34A] font-medium">On Track</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
