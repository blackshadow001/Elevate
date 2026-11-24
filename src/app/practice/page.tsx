import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Code2, 
  Terminal, 
  Database, 
  Bug, 
  Braces, 
  ArrowRight, 
  Zap, 
  Trophy, 
  Play, 
  Flame, 
  ShieldCheck 
} from "lucide-react";
import { PRACTICE_MODULES } from "@/data/practiceData";
import { PracticeHeroBannerCSS } from "@/components/practice/PracticeHeroBannerCSS";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Hub — CodeArena, WebForge, QueryMaster & CloudStudio | Elevate",
  description: "Sharpen your software engineering skills with Elevate Practice. Solve 100 levels of progressive algorithmic coding challenges, build frontend projects, master SQL, and debug real code in our interactive browser IDE.",
  alternates: { canonical: "https://elevate.courses/practice" },
  openGraph: {
    title: "Practice Hub — Interactive Coding & Engineering Sandbox | Elevate",
    description: "100-Level Algorithmic Coding Challenges, SQL runner, web development sandbox, and online compiler on Elevate.",
    url: "https://elevate.courses/practice",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Elevate Practice Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Practice Hub — Elevate",
    description: "100-Level Algorithmic Coding Challenges, SQL runner, web development sandbox, and online compiler on Elevate.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Elevate Practice Platform",
  description: "Interactive browser coding sandbox, algorithm challenges, SQL playground, and cloud IDE.",
  url: "https://elevate.courses/practice",
  hasPart: [
    {
      "@type": "SoftwareApplication",
      name: "CodeArena",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      url: "https://elevate.courses/practice/codearena",
      description: "100-level progressive algorithmic coding challenges in JavaScript, Python, and TypeScript."
    },
    {
      "@type": "SoftwareApplication",
      name: "QueryMaster",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: "https://elevate.courses/practice/querymaster",
      description: "Interactive SQL query terminal and schema explorer for PostgreSQL and SQLite."
    },
    {
      "@type": "SoftwareApplication",
      name: "WebForge",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: "https://elevate.courses/practice/webforge",
      description: "Live responsive HTML, CSS, and React component workspace with live browser preview."
    },
    {
      "@type": "SoftwareApplication",
      name: "BugHunter",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: "https://elevate.courses/practice/bughunter",
      description: "Production code debugging simulator with real-time test verification."
    },
    {
      "@type": "SoftwareApplication",
      name: "CloudStudio",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: "https://elevate.courses/practice/cloudstudio",
      description: "Zero-setup in-browser cloud workspace with live terminal and multi-language compiler."
    }
  ]
};

const moduleIcons = {
  code: Code2,
  terminal: Terminal,
  database: Database,
  bug: Bug,
  braces: Braces,
};

export default function PracticeHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Practice Hero Banner (Full-Bleed Pure CSS/SVG/HTML) */}
        <PracticeHeroBannerCSS />

        {/* Practice Modules Grid */}
        <section id="tracks" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] mb-1">
                Explore Tracks
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
                Five Specialized Practice Environments
              </h2>
            </div>
            <p className="text-sm text-[#64748B] max-w-md">
              Choose an environment below to test your knowledge, prepare for technical interview rounds, or test new ideas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {PRACTICE_MODULES.map((module) => {
              const IconComponent = moduleIcons[module.iconType];
              return (
                <div
                  key={module.id}
                  className="group relative flex flex-col justify-between bg-white rounded-3xl border border-[#E5E7EB] p-7 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#FFFDF9] border border-[#E5E7EB] flex items-center justify-center text-[#172033] shadow-sm group-hover:scale-105 group-hover:border-[#FF6B35]/40 transition-all">
                        <IconComponent className="w-7 h-7 text-[#FF6B35]" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                        {module.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#FF6B35] mt-1">
                        {module.tagline}
                      </p>
                      <p className="text-sm text-[#64748B] leading-relaxed mt-2.5">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#F1F5F9] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8]">
                      {module.stats}
                    </span>
                    <Link
                      href={module.path}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#FF6B35] transition-all group/btn"
                    >
                      <span>Start Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Daily Challenge Card */}
            <div className="relative flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#172033] via-[#1E293B] to-[#0F172A] p-7 text-white shadow-xl border border-slate-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[#FF6B35]">
                    <Flame className="w-6 h-6 fill-current text-orange-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Daily Streak
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Daily Coding Challenge</h3>
                  <p className="text-xs text-orange-300 font-medium mt-1">Earn 50 XP & Practice Badges</p>
                  <p className="text-sm text-slate-300 leading-relaxed mt-2.5">
                    Keep your problem-solving momentum sharp every day. Solve today’s curated challenge in CodeKata or SQLKata.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Day 1 Streak</span>
                <Link
                  href="/practice/codekata"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#E85D2A] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Solve Today's Problem</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 bg-[#F8FAFC] border-t border-b border-[#E5E7EB]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
                Engineered for Practical Developer Mastery
              </h2>
              <p className="text-sm text-[#64748B] mt-2">
                Elevate Practice provides real-time environments designed to take you from syntax recall to confident technical interview performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#172033]">Zero Local Setup</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Run full JavaScript, Python, TypeScript, SQL queries, and Web components right inside the browser. No node_modules, Docker, or environment pain.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#172033]">Comprehensive Test Suites</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Every challenge runs against both sample test cases and hidden edge cases to test for null inputs, off-by-one errors, and large array scale.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#172033]">Interview-Ready Confidence</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Designed based on technical interview questions asked at top product companies. Master core data structures and relational queries step by step.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
