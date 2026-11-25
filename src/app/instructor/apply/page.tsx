import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InstructorApplicationCard } from "@/components/instructor/InstructorApplicationCard";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  ChevronDown,
  CircleCheck,
  Clapperboard,
  Code2,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Teach on Elevate — Share Your Expertise & Inspire Builders Worldwide",
  description:
    "Apply to become an Elevate instructor. Plan structured engineering curricula, record lessons in Instructor Studio, and reach motivated global learners.",
  alternates: { canonical: "https://elevate.courses/instructor/apply" },
  openGraph: {
    title: "Teach on Elevate — Instructor Application & Studio Workflow",
    description:
      "Turn real industry experience into high-impact courses backed by Elevate's interactive labs and editorial support.",
    url: "https://elevate.courses/instructor/apply",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Teach on Elevate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teach on Elevate — Become an Instructor",
    description:
      "Share technical craft through structured courses and hands-on practice challenges.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Teach on Elevate",
  description:
    "Instructor onboarding, studio workflow, and tutor application for Elevate.",
  url: "https://elevate.courses/instructor/apply",
};

const STUDIO_STEPS = [
  {
    number: "01",
    icon: BookOpen,
    title: "Design a Clear Curriculum",
    description:
      "Outline module milestones, target skill level, and measurable coding or portfolio outcomes learners gain.",
  },
  {
    number: "02",
    icon: Clapperboard,
    title: "Record & Structure in Studio",
    description:
      "Upload HD lessons, attach companion code notes, and link exercises inside Instructor Studio effortlessly.",
  },
  {
    number: "03",
    icon: Code2,
    title: "Pair With Practice Labs",
    description:
      "Connect chapters with Elevate's CodeArena, QueryMaster, and WebForge tracks so students retain every concept.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Quality Review & Launch",
    description:
      "Our curriculum reviewers give actionable feedback on audio, pacing, and accuracy before publishing to the catalog.",
  },
];

const EDUCATOR_BENEFITS = [
  {
    icon: Globe2,
    title: "Global Learner Distribution",
    body: "Reach engineers, students, and technical teams searching actively for job-ready skills.",
  },
  {
    icon: BarChart3,
    title: "Studio Analytics & Feedback",
    body: "Track lesson completion drop-offs, enrollment growth, and verified learner reviews in real time.",
  },
  {
    icon: Award,
    title: "Verified Certificates Included",
    body: "Graduates earn uniquely verifiable Elevate credentials sharing your instructor attribution.",
  },
];

const INSTRUCTOR_FAQS = [
  {
    q: "Do I need prior formal university teaching experience?",
    a: "No. Real-world engineering, architecture, or product craft plus clarity in explaining trade-offs matters far more than academic credentials.",
  },
  {
    q: "What happens after I submit my application?",
    a: "A curriculum administrator reviews your subject, experience summary, and course idea within 3–5 business days. Once approved, your account unlocks Instructor Studio immediately.",
  },
  {
    q: "Will I lose my existing learner courses if I become an instructor?",
    a: "Never. Upgrading to instructor permissions preserves all your existing course enrollments, practice streaks, and certificates.",
  },
];

export default function InstructorApplyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Editorial Hero */}
        <section className="relative overflow-hidden bg-[#172033] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 25%, rgba(255, 107, 53, 0.35), transparent 45%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/35 bg-[#FF6B35]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FF8A5B]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Teach on Elevate</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] tracking-tight text-balance">
                  Turn hard-won engineering craft into learning that scales.
                </h1>
                <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 text-pretty">
                  Teach developers worldwide using Instructor Studio, interactive sandbox pairings, and dedicated editorial review—keeping your full learner history intact.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="#apply"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#E85A2A]"
                  >
                    <span>Start Instructor Application</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
                  >
                    <span>See Existing Catalog</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {EDUCATOR_BENEFITS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs"
                    >
                      <div className="rounded-xl bg-[#FF6B35]/20 p-2.5 text-[#FF8A5B] shrink-0">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-sm font-bold text-white">
                          {item.title}
                        </h2>
                        <p className="text-xs leading-relaxed text-slate-300">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Studio Workflow */}
        <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
              How Teaching Works
            </span>
            <h2 className="text-3xl font-black tracking-tight text-[#172033]">
              From Course Outline to Published Catalog in Four Steps
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STUDIO_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-lg font-black text-[#CBD5E1]">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#172033]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Application Section */}
        <section
          id="apply"
          className="border-y border-[#E5E7EB] bg-white scroll-mt-20"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
                  Instructor Application
                </span>
                <h2 className="text-3xl font-black tracking-tight text-[#172033]">
                  Tell us what you want to teach
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-[#64748B]">
                  Share your engineering or design experience alongside a clear syllabus concept. Our curriculum administrators review every submission individually and send actionable feedback.
                </p>
              </div>

              <div className="rounded-2xl border border-[#FF6B35]/20 bg-[#FFF8F2] p-5 text-sm text-[#172033] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#FF6B35]">
                  <CircleCheck className="h-5 w-5" aria-hidden="true" />
                  <span>Transparent Review Policy</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[#475569]">
                  Submitting an application does not automatically publish content. Approved educators receive instant access to Instructor Studio while keeping enrolled learner courses intact.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#172033]">
                  <Layers className="h-4 w-4 text-[#FF6B35]" aria-hidden="true" />
                  <span>In-Demand Topic Areas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python & FastAPI",
                    "Production RAG & AI Agents",
                    "PostgreSQL & Query Tuning",
                    "System Design",
                    "Next.js & TypeScript",
                    "Cloud & Kubernetes",
                  ].map((topic) => (
                    <span
                      key={topic}
                      className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#334155]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <InstructorApplicationCard />
            </div>
          </div>
        </section>

        {/* Instructor FAQs */}
        <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
              Instructor FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#172033]">
              Frequently Asked Questions for Creators
            </h2>
          </div>

          <div className="space-y-3">
            {INSTRUCTOR_FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-xs open:border-[#FF6B35]/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm sm:text-base font-bold text-[#172033] marker:hidden">
                  <span>{faq.q}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200 group-open:rotate-180 group-open:text-[#FF6B35]"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 border-t border-[#F1F5F9] pt-3 text-sm leading-relaxed text-[#475569]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
