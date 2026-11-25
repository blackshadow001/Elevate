import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Platform Rules & Enrollment Terms | Elevate",
  description: "Terms and conditions governing enrollment, Personal Plan subscriptions, verified certificates, and acceptable use of Elevate.",
  alternates: { canonical: "https://elevate.courses/terms" },
  openGraph: {
    title: "Terms of Service — Elevate",
    description: "Terms and conditions governing the use of the Elevate online learning platform.",
    url: "https://elevate.courses/terms",
    siteName: "Elevate",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-14 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-8">
        <div className="border-b border-[#E5E7EB] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B35] text-xs font-bold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033]">Terms of Service</h1>
          <p className="text-xs text-[#64748B] mt-2">Effective Date · November 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm text-[#172033] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">1. Acceptance of Terms</h2>
            <p className="text-[#64748B]">
              By accessing or using Elevate (<span className="font-mono">elevate.courses</span>), including our video courses, interactive coding practice environments, live classes, and career roadmaps, you agree to comply with these Terms of Service and our{" "}
              <Link href="/privacy" className="text-[#FF6B35] font-semibold hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">2. Course Enrollments &amp; Subscriptions</h2>
            <p className="text-[#64748B]">
              When you enroll in an individual course or subscribe to an Elevate Personal Plan, you receive a personal, non-transferable license to view lessons, complete exercises, and earn certificates of completion. Sharing account credentials across multiple individuals is not permitted.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">3. Intellectual Property Rights</h2>
            <p className="text-[#64748B]">
              All video instruction, written curriculum, coding test suites, brand marks, and downloadable resources belong to Elevate or the respective course instructors. Redistributing or reselling course materials without written permission is prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">4. Payments &amp; Billing</h2>
            <p className="text-[#64748B]">
              Paid enrollments and Personal Plan subscriptions are processed securely in INR via Razorpay. Access to paid courses or subscription tracks is activated upon verified payment confirmation. For billing inquiries, reach out to{" "}
              <a href="mailto:support@elevate.courses" className="text-[#FF6B35] font-semibold hover:underline">
                support@elevate.courses
              </a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">5. Acceptable Use &amp; Code of Conduct</h2>
            <p className="text-[#64748B]">
              Learners and instructors must uphold respectful conduct across live sessions, discussions, and community channels. Automated scraping, abusing execution sandboxes, or bypassing access controls may result in immediate account suspension.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
