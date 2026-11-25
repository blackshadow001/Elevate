import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Clock,
  Globe2,
  HelpCircle,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — Support, Partnerships & Enterprise Teams | Elevate",
  description:
    "Contact Elevate for learner support, verified certificate assistance, enterprise upskilling plans, and instructor partnerships. Average response under 24 business hours.",
  alternates: { canonical: "https://elevate.courses/contact" },
  openGraph: {
    title: "Contact Elevate — Learner Support & Enterprise Partnerships",
    description:
      "Reach the right Elevate specialist for account help, instructor onboarding, or organization subscriptions.",
    url: "https://elevate.courses/contact",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Contact Elevate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Elevate — Support & Partnerships",
    description:
      "Get in touch with Elevate for learner support, instructor onboarding, or team plans.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Elevate",
  description:
    "Get in touch with Elevate for support, instructor partnerships, and enterprise inquiries.",
  url: "https://elevate.courses/contact",
  mainEntity: {
    "@type": "EducationalOrganization",
    name: "Elevate",
    url: "https://elevate.courses",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@elevate.courses",
        availableLanguage: ["English", "Tamil", "Hindi"],
        hoursAvailable: "Mo-Fr 09:00-18:00",
      },
      {
        "@type": "ContactPoint",
        contactType: "Instructor Partnerships",
        email: "instructors@elevate.courses",
        availableLanguage: ["English", "Tamil", "Hindi"],
      },
      {
        "@type": "ContactPoint",
        contactType: "Enterprise Sales",
        email: "enterprise@elevate.courses",
        availableLanguage: ["English"],
      },
    ],
  },
};

const CONTACT_FAQS = [
  {
    q: "How long does learner support take to reply?",
    a: "Billing, enrollment, and certificate inquiries sent Monday–Friday receive a specialist response within 24 business hours.",
  },
  {
    q: "Where do I submit a proposal to teach on Elevate?",
    a: "Use our dedicated Teach on Elevate application workflow so your curriculum proposal attaches directly to your account for faster admin review.",
  },
  {
    q: "Can engineering teams request invoice billing for multiple seats?",
    a: "Yes. Message our Enterprise channel with your team size and desired skill tracks to receive volume licensing options.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Editorial Hero Header */}
        <section className="relative overflow-hidden bg-[#172033] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 30%, rgba(255, 107, 53, 0.35), transparent 45%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-3xl space-y-4">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#FF8A5B]">
                Contact & Partnerships
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-balance">
                We&apos;re here to help you move faster.
              </h1>
              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 text-pretty">
                Whether you need help with an enrollment, verified certificate troubleshooting, team licensing, or teaching partnerships—our specialists respond promptly.
              </p>
            </div>
          </div>
        </section>

        {/* Department Channel Cards + Interactive Form */}
        <section className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Direct Channels & Regional Presence */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#172033]">
                  Direct Specialist Desks
                </h2>
                <p className="text-sm leading-relaxed text-[#64748B]">
                  Choose the channel matching your question for the fastest turnaround.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-[#FF6B35]/50 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-orange-50 text-[#FF6B35] shrink-0">
                    <Mail className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#172033]">
                      Learner Support
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Account access, payments, course progress, and verification IDs
                    </p>
                    <a
                      href="mailto:support@elevate.courses"
                      className="text-sm font-bold text-[#FF6B35] hover:underline inline-block pt-1"
                    >
                      support@elevate.courses
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-[#FF6B35]/50 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#172033]">
                      Instructor Partnerships
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Syllabus reviews, studio onboarding, and creator collaboration
                    </p>
                    <a
                      href="mailto:instructors@elevate.courses"
                      className="text-sm font-bold text-sky-700 hover:underline inline-block pt-1"
                    >
                      instructors@elevate.courses
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-[#FF6B35]/50 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#172033]">
                      Enterprise & Teams
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Bulk engineering licenses, custom cohorts, and GST/invoice billing
                    </p>
                    <a
                      href="mailto:enterprise@elevate.courses"
                      className="text-sm font-bold text-purple-700 hover:underline inline-block pt-1"
                    >
                      enterprise@elevate.courses
                    </a>
                  </div>
                </div>
              </div>

              {/* SLA & Hubs Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#172033]">
                    <Clock className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>24h SLA</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#64748B]">
                    Mon–Fri replies within 24 business hours.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#172033]">
                    <Building2 className="w-4 h-4 text-[#FF6B35]" aria-hidden="true" />
                    <span>Operating Hubs</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#64748B]">
                    Chennai · Bengaluru · Remote Global
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1 text-sm font-bold">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 text-[#FF6B35] hover:underline"
                >
                  <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Browse Full FAQ</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-1.5 text-[#172033] hover:text-[#FF6B35]"
                >
                  <Globe2 className="w-4 h-4" aria-hidden="true" />
                  <span>Help Center</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-10 shadow-xs">
              <ContactForm />
            </div>
          </div>

          {/* Pre-Contact FAQ Accordion */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 sm:p-10 space-y-6 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
                Quick Answers
              </span>
              <h2 className="text-2xl font-black text-[#172033]">
                Common Questions Before Writing In
              </h2>
            </div>
            <div className="space-y-3">
              {CONTACT_FAQS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-[#E5E7EB] bg-[#FFFDF9] px-5 py-4 open:border-[#FF6B35]/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm sm:text-base font-bold text-[#172033] marker:hidden">
                    <span>{item.q}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200 group-open:rotate-180 group-open:text-[#FF6B35]"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 border-t border-[#E5E7EB] pt-3 text-sm leading-relaxed text-[#475569]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
