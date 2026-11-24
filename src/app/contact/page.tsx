import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import { 
  Mail, 
  Clock, 
  MapPin, 
  MessageSquare, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — Support, Partnerships & Inquiries | Elevate",
  description: "Get in touch with Elevate for learner support, enterprise team plans, instructor applications, and course partnerships. We typically reply within 24 hours.",
  alternates: { canonical: "https://elevate.courses/contact" },
  openGraph: {
    title: "Contact Elevate — Online Learning Platform",
    description: "Get in touch with Elevate for learner support, enterprise team plans, and course partnerships.",
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
    title: "Contact Elevate — Online Learning Platform",
    description: "Get in touch with Elevate for support, instructor partnerships, and course inquiries.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Elevate",
  description: "Get in touch with Elevate for support, instructor partnerships, and inquiries.",
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
        hoursAvailable: "Mo-Fr 09:00-18:00"
      },
      {
        "@type": "ContactPoint",
        contactType: "Instructor Partnerships",
        email: "instructors@elevate.courses",
        availableLanguage: ["English", "Tamil", "Hindi"]
      }
    ]
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="bg-[#172033] text-white py-16 sm:py-20 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              We&apos;re here to help you succeed.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Have questions about courses, verified certificates, enterprise teams, or teaching on Elevate? Send us a message or reach out directly.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Direct Channels & Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-[#172033]">
                  Contact Channels
                </h2>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Choose the channel that best fits your inquiry so our team can connect you with the right specialist.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs hover:border-[#FF6B35]/40 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-orange-50 text-[#FF6B35] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#172033]">Learner Support</h3>
                    <p className="text-xs text-[#64748B]">Account access, payments, enrollment, and certificates</p>
                    <a href="mailto:support@elevate.courses" className="text-sm font-bold text-[#FF6B35] hover:underline inline-block pt-1">
                      support@elevate.courses
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs hover:border-[#FF6B35]/40 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#172033]">Instructor Partnerships</h3>
                    <p className="text-xs text-[#64748B]">Curriculum proposals, teaching applications, and content licensing</p>
                    <a href="mailto:instructors@elevate.courses" className="text-sm font-bold text-blue-600 hover:underline inline-block pt-1">
                      instructors@elevate.courses
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs hover:border-[#FF6B35]/40 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#172033]">Enterprise & Teams</h3>
                    <p className="text-xs text-[#64748B]">Bulk subscriptions, custom learning tracks, and invoice billing</p>
                    <a href="mailto:enterprise@elevate.courses" className="text-sm font-bold text-purple-600 hover:underline inline-block pt-1">
                      enterprise@elevate.courses
                    </a>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#172033]">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Response Time Guarantee</span>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  We review every message promptly. General student support requests are answered within <strong className="text-[#172033]">24 business hours</strong>.
                </p>
              </div>

              {/* Quick FAQ link */}
              <div className="pt-2">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6B35] hover:underline"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Looking for quick answers? Check our FAQ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-10 shadow-xs">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
