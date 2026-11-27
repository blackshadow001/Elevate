import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  HelpCircle, 
  BookOpen, 
  Award, 
  CreditCard, 
  Code2, 
  ChevronRight, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) — Elevate Learning Platform",
  description: "Find instant answers to common questions about Elevate online courses, interactive coding practice tracks, certificates, pricing, and subscriptions.",
  alternates: { canonical: "https://elevate.courses/faq" },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) — Elevate",
    description: "Find instant answers to common questions about Elevate online courses, interactive coding practice tracks, certificates, and subscriptions.",
    url: "https://elevate.courses/faq",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Elevate FAQ & Help",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions (FAQ) — Elevate",
    description: "Find instant answers to common questions about Elevate online courses, interactive coding practice tracks, and certificates.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const FAQ_SECTIONS = [
  {
    category: "Courses & Learning",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    questions: [
      {
        q: "What is Elevate and how does the learning platform work?",
        a: "Elevate is an advanced online learning platform providing practical, project-based courses, interactive coding practice sandboxes, and career paths in AI, technology, and business. All curriculum is crafted by experienced industry practitioners with zero setup required."
      },
      {
        q: "Are the courses self-paced or do they follow a schedule?",
        a: "All video courses on Elevate are 100% self-paced with lifetime on-demand access upon enrollment. You can learn whenever your schedule allows, re-watch lessons, and track your progress across devices."
      },
      {
        q: "In what languages are Elevate courses offered?",
        a: "Elevate offers curriculum in English, Tamil, and Hindi to ensure deep technical and business concepts are accessible without linguistic barriers."
      },
      {
        q: "What prerequisites do I need before taking a course?",
        a: "Every course clearly labels its level: Beginner, Intermediate, or Advanced. Beginner courses start from absolute fundamentals with zero prior experience required, while Advanced courses assume familiarity with core engineering principles."
      }
    ]
  },
  {
    category: "Elevate Practice Hub",
    icon: Code2,
    color: "text-orange-600 bg-orange-50 border-orange-100",
    questions: [
      {
        q: "What is the Elevate Practice Hub?",
        a: "Elevate Practice is our in-browser interactive engineering environment. It includes CodeArena (100 levels of algorithmic challenges), QueryMaster (SQL sandbox with real database schemas), WebForge (live HTML/CSS/React component builder), BugHunter (debugging simulator), and CloudStudio (multi-language cloud IDE)."
      },
      {
        q: "Do I need to install any local software or compilers to practice?",
        a: "No! All code compilation, SQL queries, and component previews execute instantaneously directly in your browser with zero local installation or environment configuration required."
      },
      {
        q: "How does QueryMaster help me learn SQL?",
        a: "QueryMaster allows you to select real relational schema tables (employees, departments, orders), inspect live sample datasets, write SQL queries in a syntax-highlighted terminal, and verify the resulting table output in real time."
      }
    ]
  },
  {
    category: "Certificates & Verification",
    icon: Award,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    questions: [
      {
        q: "Do I receive a certificate upon completing a course?",
        a: "Yes! Completing all lessons, exercises, and assessments in any course automatically awards a verified Elevate Certificate of Completion featuring a unique serial number and cryptographic verification QR code."
      },
      {
        q: "How can employers or universities verify my certificate?",
        a: "Anyone can verify the authenticity of an Elevate credential at https://elevate.courses/certificates/verify by entering the unique certificate ID or scanning the certificate's QR code."
      }
    ]
  },
  {
    category: "Pricing & Subscriptions",
    icon: CreditCard,
    color: "text-purple-600 bg-purple-50 border-purple-100",
    questions: [
      {
        q: "What is the Elevate Personal Plan?",
        a: "The Elevate Personal Plan is a flexible subscription providing unlimited access to our curated catalog of practical tech and business courses, practice tracks, and career roadmaps with simple monthly or annual billing."
      },
      {
        q: "What payment methods are supported?",
        a: "We support all major payment methods powered securely by Razorpay: UPI (Google Pay, PhonePe, Paytm), credit and debit cards (Visa, MasterCard, RuPay), and net banking across major banks."
      },
      {
        q: "Can I purchase individual courses without a subscription?",
        a: "Yes! You can enroll in individual courses with a one-time payment for lifetime access, or choose the Personal Plan subscription for broad catalog access."
      }
    ]
  }
];

export default function FAQPage() {
  const allQuestions = FAQ_SECTIONS.flatMap(s => s.questions);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions.map(item => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="bg-[#172033] text-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Help Center & FAQ</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Everything you need to know about learning on Elevate, interactive practice tracks, verified certificates, and enrollment.
            </p>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {FAQ_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.category} className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-[#E5E7EB]">
                  <div className={`p-2 rounded-xl border ${section.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#172033]">
                    {section.category}
                  </h2>
                </div>

                <div className="grid gap-4">
                  {section.questions.map((item, idx) => (
                    <article
                      key={idx}
                      className="min-w-0 space-y-2 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-[#FF6B35]/30 sm:p-6"
                    >
                      <h3 className="text-base sm:text-lg font-bold text-[#172033] flex items-start gap-2.5">
                        <span className="text-[#FF6B35] font-extrabold shrink-0 mt-0.5">Q.</span>
                        <span className="min-w-0 [overflow-wrap:anywhere]">{item.q}</span>
                      </h3>
                      <p className="pl-6 text-sm leading-relaxed text-[#64748B] [overflow-wrap:anywhere] sm:text-base">
                        {item.a}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Still Have Questions CTA */}
          <div className="bg-gradient-to-br from-[#172033] to-[#1E293B] rounded-3xl p-8 sm:p-10 text-white text-center space-y-4">
            <h3 className="text-2xl font-black">Still have questions?</h3>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Our support team is happy to assist with any questions about courses, enterprise teams, or learning roadmaps.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-bold text-sm hover:bg-[#E85D2A] transition-all shadow-md"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Support</span>
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
