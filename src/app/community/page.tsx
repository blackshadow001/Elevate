import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MessageSquare, Users, Sparkles, ArrowRight, ShieldCheck, Code2 } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community & Developer Network — Elevate",
  description: "Connect with thousands of engineers, learners, and mentors in the Elevate community. Join peer study groups, participate in hackathons, and collaborate.",
  alternates: { canonical: "https://elevate.courses/community" },
  openGraph: {
    title: "Community & Developer Network — Elevate",
    description: "Connect with thousands of engineers, learners, and mentors in the Elevate community.",
    url: "https://elevate.courses/community",
    siteName: "Elevate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community & Developer Network — Elevate",
    description: "Connect with thousands of engineers, learners, and mentors in the Elevate community.",
  },
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-[#172033] text-white py-16 lg:py-24 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#5865F2] flex items-center justify-center mx-auto shadow-xl text-white mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Developer Network
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Join the Elevate Community
            </h1>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              Connect with fellow learners, get unblocked on tricky bug investigations, share portfolio demos, and receive career referrals.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
              >
                <span>Join Discord Server</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#26344D] hover:bg-slate-700 text-white font-semibold text-sm transition-all"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>

        {/* Channels Highlight */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              What happens inside our server?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Structured channels designed for constructive collaboration and feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#172033]">#code-help & Bug Triage</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Stuck on a Next.js hydration error or a SQL join edge-case? Mentors and peers assist within minutes.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#172033]">#project-showcase</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Ship live full-stack capstones and receive constructive feedback on UX, accessibility, and code cleanliness.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#172033]">#jobs & Referrals</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Alumni working at top product companies and startups regularly post exclusive engineering referrals.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
