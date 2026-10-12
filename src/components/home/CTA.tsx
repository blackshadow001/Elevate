import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#172033] py-20 lg:py-24">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#FF6B35]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#26344D] text-[#FF6B35] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Start Your Transformative Journey</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Start learning something new today.
        </h2>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of learners and build skills that move your career forward. Get unlimited access to top-rated courses and industry mentors.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 group text-base"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#26344D] hover:bg-[#324566] text-white font-semibold px-8 py-4 rounded-full border border-white/10 transition-all text-base"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}
