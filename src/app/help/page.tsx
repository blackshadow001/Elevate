import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  HelpCircle, 
  BookOpen, 
  Award, 
  MessageSquare, 
  CreditCard, 
  Code2, 
  ArrowRight,
  ShieldCheck,
  Mail
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center & Knowledge Base — Elevate",
  description: "Get answers to your questions, explore guides on courses and interactive practice tracks, verify credentials, and reach our support team.",
  alternates: { canonical: "https://elevate.courses/help" },
  openGraph: {
    title: "Help Center & Knowledge Base — Elevate",
    description: "Get answers to your questions, explore guides on courses and interactive practice tracks, verify credentials, and reach our support team.",
    url: "https://elevate.courses/help",
    siteName: "Elevate",
    type: "website",
  },
};

const HELP_TOPICS = [
  {
    title: "Frequently Asked Questions",
    description: "Browse curated answers covering enrollment, bilingual instruction, course completion, and system requirements.",
    icon: HelpCircle,
    href: "/faq",
    color: "bg-orange-50 text-[#FF6B35] border-orange-100",
  },
  {
    title: "Certificate Verification",
    description: "Look up and verify authentic Elevate certificates of completion using unique credential IDs.",
    icon: Award,
    href: "/certificates/verify",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    title: "Elevate Practice Hub",
    description: "Guides and documentation for in-browser coding: CodeArena algorithms, QueryMaster SQL, and WebForge sandboxes.",
    icon: Code2,
    href: "/practice",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    title: "Personal Plan & Billing",
    description: "Learn how the monthly and annual Personal Plan subscriptions work, billing cycles, and payment methods.",
    icon: CreditCard,
    href: "/personal-plan",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    title: "Teach on Elevate",
    description: "Interested in becoming an instructor? Review our curriculum standards and submit an instructor application.",
    icon: BookOpen,
    href: "/careers",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    title: "Community & Mentorship",
    description: "Join the Elevate developer network on Discord to discuss projects, seek feedback, and connect with peers.",
    icon: MessageSquare,
    href: "/community",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#172033] text-white py-16 sm:py-20 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
              Help & Resources
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              How can we help you today?
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Find quick answers, explore student and instructor guides, or get in touch with our team.
            </p>
          </div>
        </section>

        {/* Topic Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HELP_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.title}
                  href={topic.href}
                  className="group bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs hover:border-[#FF6B35]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${topic.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                      {topic.title}
                    </h2>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] pt-2">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Contact Support Banner */}
        <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFF8F2] border border-[#FFE2D1] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-[#172033]">
                Need direct assistance?
              </h3>
              <p className="text-sm text-[#64748B] max-w-xl">
                Can&apos;t find what you are looking for? Our student and customer support team responds within 24 hours.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF6B35] text-white font-bold text-sm hover:bg-[#E85D2A] transition-all shadow-md shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
