import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Users, Trophy, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us — Elevate",
  description: "Learn about Elevate's mission, educational philosophy, and commitment to practical career skills in AI, technology, and business.",
  alternates: { canonical: "https://elevate.courses/about" },
  openGraph: {
    title: "About Us — Elevate",
    description: "Learn about Elevate's mission, educational philosophy, and commitment to practical career skills in AI, technology, and business.",
    url: "https://elevate.courses/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#172033] text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Our Purpose & Story
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              We believe learning should be practical, accessible, and life-changing.
            </h1>
            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
              Our mission is to empower developers, designers, and tech leaders worldwide with rigorous, project-backed curriculum taught by seasoned industry practitioners.
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Pragmatic Pedagogy</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                No rote memorization or trivial toy examples. Every lecture is grounded in production realities, automated testing, and scalable architecture.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3B82F6] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Bilingual & Accessible</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Deep tech knowledge should not be limited by language barriers. We deliver world-class curriculum in English, Tamil, and Hindi.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Proof of Competence</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Graduates complete production-ready capstones with verifiable cryptographic certificates recognized by engineering teams worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-[#F7F8FA] py-16 border-t border-[#E5E7EB] text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl font-extrabold text-[#172033]">Ready to start learning?</h2>
            <p className="text-sm text-[#64748B]">Explore our guided course paths and build your future in software engineering today.</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-md shadow-orange-500/20"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
