import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  Award,
  BookOpen,
  Code2,
  Compass,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Transforming Technical Mastery Worldwide | Elevate",
  description:
    "Discover Elevate's mission, impact metrics, hands-on engineering pedagogy, and global community of builders, instructors, and technical hiring teams.",
  alternates: { canonical: "https://elevate.courses/about" },
  openGraph: {
    title: "About Elevate — Online Learning & Interactive Coding Labs",
    description:
      "Learn how Elevate connects structured video courses, live browser sandboxes, and practitioner mentorship into measurable career outcomes.",
    url: "https://elevate.courses/about",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "About Elevate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Elevate — Online Learning & Interactive Coding Labs",
    description:
      "Connect structured video curriculum with live browser execution and career verification.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Elevate",
  description:
    "Elevate empowers learners worldwide with practical video courses, interactive practice sandboxes, and verified technical mastery.",
  url: "https://elevate.courses/about",
  mainEntity: {
    "@type": "EducationalOrganization",
    name: "Elevate",
    url: "https://elevate.courses",
    logo: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
    description:
      "Curated courses, verified practice labs, and career-oriented skill pathways built with industry practitioners.",
  },
};

const IMPACT_METRICS = [
  { value: "100K+", label: "Active Global Learners" },
  { value: "5", label: "Live Practice Environments" },
  { value: "1,150+", label: "Coding & SQL Challenges" },
  { value: "94%", label: "Learner Completion Confidence" },
];

const OPERATING_PRINCIPLES = [
  {
    number: "01",
    title: "Practice Before Passive Watching",
    description:
      "Every engineering concept is paired immediately with browser execution in CodeArena, QueryMaster, WebForge, BugHunter, or CloudStudio.",
  },
  {
    number: "02",
    title: "Practitioner-Curated Syllabi",
    description:
      "Instructors are active engineers, architects, and design leads—reviewed personally before courses enter the catalog.",
  },
  {
    number: "03",
    title: "Proof Over Vanity Badges",
    description:
      "Verifiable certificates reflect real completed modules, passing test suites, and documented technical problem solving.",
  },
  {
    number: "04",
    title: "Accessible Global Mobility",
    description:
      "Clean, responsive web architecture ensures learners from Chennai to San Francisco can practice seamlessly on any laptop.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Editorial Asymmetric Hero */}
        <section className="relative overflow-hidden bg-[#172033] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 25%, rgba(255, 107, 53, 0.4), transparent 45%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/35 bg-[#FF6B35]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FF8A5B]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>About Elevate</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-balance">
                  Skills are changing faster than traditional education. We bridge the gap.
                </h1>
                <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 text-pretty">
                  Elevate unites practitioner-taught video courses, five live in-browser coding sandboxes, and structured career handbooks into one focused platform built for modern builders.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E85A2A]"
                  >
                    <span>Explore Courses</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
                  >
                    <span>Join Our Team</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                    alt="Engineers and curriculum creators collaborating at Elevate"
                    fill
                    priority
                    className="object-cover scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-100 motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-[#172033]/90 p-4 backdrop-blur-sm">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#FF8A5B]">
                      Built for Real Outcomes
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Where structured curriculum meets zero-setup code compilation and SQL execution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Strip */}
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {IMPACT_METRICS.map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight text-[#172033]">
                    {item.value}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Elevate Works — Three Interconnected Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
              Our Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#172033] text-balance">
              One continuous loop from concept to verified proof.
            </h2>
            <p className="text-base leading-relaxed text-[#64748B] text-pretty">
              Watching tutorials alone fades in 48 hours. Elevate integrates guided instruction, interactive labs, and editorial depth so knowledge sticks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-3xl border border-[#E5E7EB] bg-white p-7 shadow-xs">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35]">
                  <BookOpen className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-extrabold text-[#172033]">
                  Curated Video Courses
                </h3>
                <p className="text-sm leading-relaxed text-[#64748B]">
                  Step-by-step modules authored by vetted practitioners, complete with structured lesson notes, architecture diagrams, and lifetime progress tracking.
                </p>
              </div>
              <Link
                href="/courses"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B35] hover:underline"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-[#E5E7EB] bg-white p-7 shadow-xs">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Code2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-extrabold text-[#172033]">
                  Five Interactive Practice Labs
                </h3>
                <p className="text-sm leading-relaxed text-[#64748B]">
                  Execute algorithms in CodeArena, query multi-table databases in QueryMaster, triage production bugs in BugHunter, and test frontends in WebForge.
                </p>
              </div>
              <Link
                href="/practice"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#172033] hover:text-[#FF6B35]"
              >
                <span>Enter Practice Hub</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-[#E5E7EB] bg-white p-7 shadow-xs">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Award className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-extrabold text-[#172033]">
                  Verifiable Certificates & Mentors
                </h3>
                <p className="text-sm leading-relaxed text-[#64748B]">
                  Every completed pathway awards a unique verification credential employers can inspect online, backed by dedicated Instructor Studio creators.
                </p>
              </div>
              <Link
                href="/instructor/apply"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#172033] hover:text-[#FF6B35]"
              >
                <span>Teach on Elevate</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Operating Principles Numbered Editorial Grid */}
        <section className="border-y border-[#E5E7EB] bg-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
                  How We Think
                </span>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-[#172033]">
                  Four Principles Guiding Every Release
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B35] hover:underline"
              >
                <span>Read Our Engineering Blog</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {OPERATING_PRINCIPLES.map((p) => (
                <div
                  key={p.number}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#FFFDF9] p-7 space-y-3"
                >
                  <span className="font-mono text-2xl font-black text-[#FF6B35]">
                    {p.number}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#172033]">
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#475569] text-pretty">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience Pathways: Learners, Instructors, Teams */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="rounded-3xl bg-[#172033] p-8 sm:p-12 text-white">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#FF8A5B]">
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                  <span>Built for Individuals & Growing Teams</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-balance">
                  Ready to sharpen your craft or empower your engineering organization?
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                  Start practicing for free in our interactive environments or reach out to build tailored upskilling tracks for your team.
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#E85A2A]"
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span>Create Free Account</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Partner With Us</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
