import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OpenRolesExplorer } from "@/components/careers/OpenRolesExplorer";
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  HeartHandshake,
  Laptop,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at Elevate — Shape the Future of Technical Education",
  description:
    "Explore open engineering, curriculum, design, and instructor partnership roles at Elevate. Remote-first culture, learning stipends, and high-ownership work.",
  alternates: { canonical: "https://elevate.courses/careers" },
  openGraph: {
    title: "Careers at Elevate — Engineering, Curriculum & Design Roles",
    description:
      "Build interactive coding sandboxes, structured courses, and developer tools used by learners worldwide.",
    url: "https://elevate.courses/careers",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Elevate Careers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at Elevate — Shape Technical Education",
    description:
      "Explore open roles across engineering, curriculum, design, and learner success.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Careers at Elevate",
  description:
    "Open positions, benefits, and culture at Elevate online learning platform.",
  url: "https://elevate.courses/careers",
};

const BENEFITS = [
  {
    icon: Laptop,
    title: "Remote-First Flexibility",
    description:
      "Work asynchronously from anywhere with generous home-office setup allowances and focused deep-work blocks.",
  },
  {
    icon: BookOpen,
    title: "Unlimited Learning Budget",
    description:
      "Annual stipend for conferences, technical books, certifications, and full Elevate course access.",
  },
  {
    icon: HeartHandshake,
    title: "Comprehensive Healthcare",
    description:
      "Medical coverage for you and your family plus paid recharge breaks each quarter.",
  },
  {
    icon: Rocket,
    title: "High Ownership, Low Bureaucracy",
    description:
      "Small senior squads shipping browser sandboxes, curriculum tracks, and developer experiences directly to users.",
  },
];

const HIRING_PROCESS = [
  {
    step: "01",
    title: "Application & Work Sample",
    detail:
      "Share your GitHub, teaching portfolio, or design work—no generic cover letters needed.",
  },
  {
    step: "02",
    title: "Practical Pairing Session",
    detail:
      "Collaborate live with peers on a realistic debugging, architecture, or curriculum design scenario.",
  },
  {
    step: "03",
    title: "Founder & Team Conversation",
    detail:
      "Align on mission, growth expectations, compensation transparency, and your first 90-day impact.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#172033] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.35), transparent 45%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/35 bg-[#FF6B35]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FF8A5B]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Careers at Elevate</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-balance">
                Build the platform that helps engineers master real craft.
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-slate-300 text-pretty">
                We&apos;re a team of engineers, curriculum architects, designers, and educators turning complex technical domains into joyful, hands-on mastery.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#open-roles"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E85A2A]"
                >
                  <span>View Open Positions</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/instructor/apply"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
                >
                  <span>Apply as Independent Instructor</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Culture & Benefits Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
                Life at Elevate
              </span>
              <h2 className="text-3xl font-black tracking-tight text-[#172033]">
                Benefits Built for Sustainable Excellence
              </h2>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#172033] hover:text-[#FF6B35]"
            >
              <Compass className="h-4 w-4 text-[#FF6B35]" aria-hidden="true" />
              <span>Read Our Mission & Principles</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-3"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#172033]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Open Roles Section */}
        <section
          id="open-roles"
          className="border-y border-[#E5E7EB] bg-white py-16 sm:py-20 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
                Join the Team
              </span>
              <h2 className="text-3xl font-black tracking-tight text-[#172033]">
                Current Open Roles
              </h2>
              <p className="max-w-2xl text-sm sm:text-base text-[#64748B]">
                Filter by department to see where your skills fit best. Don&apos;t see an exact match? Reach out anyway—we meet standout builders year-round.
              </p>
            </div>

            <OpenRolesExplorer />
          </div>
        </section>

        {/* Transparent Hiring Process */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
              What To Expect
            </span>
            <h2 className="text-3xl font-black tracking-tight text-[#172033]">
              A Respectful, Practical Hiring Process
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HIRING_PROCESS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-7 space-y-3 shadow-xs"
              >
                <span className="font-mono text-2xl font-black text-[#FF6B35]">
                  {item.step}
                </span>
                <h3 className="text-lg font-extrabold text-[#172033]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#64748B]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Instructor Alternative Banner */}
          <div className="rounded-3xl bg-[#172033] p-8 sm:p-10 text-white flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#FF8A5B]">
                <Award className="h-4 w-4" aria-hidden="true" />
                <span>Looking to Teach Part-Time?</span>
              </div>
              <h3 className="text-2xl font-black">
                Publish Your Own Course on Elevate
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Keep your day job while sharing structured courses and coding challenges with learners globally through Instructor Studio.
              </p>
            </div>
            <Link
              href="/instructor/apply"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#E85A2A]"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>Teach on Elevate</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
