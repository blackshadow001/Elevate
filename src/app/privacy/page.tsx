import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Data Protection & Learner Security | Elevate",
  description: "Learn how Elevate collects, encrypts, and safeguards account records, course progress, certificates, and payment verification.",
  alternates: { canonical: "https://elevate.courses/privacy" },
  openGraph: {
    title: "Privacy Policy — Elevate",
    description: "Elevate data protection, encryption, and learner privacy practices.",
    url: "https://elevate.courses/privacy",
    siteName: "Elevate",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-14 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-8">
        <div className="border-b border-[#E5E7EB] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B35] text-xs font-bold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Protection Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033]">Privacy Policy</h1>
          <p className="text-xs text-[#64748B] mt-2">Last Updated · November 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm text-[#172033] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">1. Information We Collect</h2>
            <p className="text-[#64748B]">
              Elevate collects account profile details (name and email address), salted password hashes, optional Google OAuth identifiers, course enrollments, lesson progress, coding sandbox submissions stored locally in your browser, verified certificates, and order metadata processed through Razorpay.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">2. How We Use Information</h2>
            <p className="text-[#64748B]">
              Account records authenticate your sessions, preserve course completion status and earned certificates, support live class participation, and enable instructor and administrative course management. We never sell learner data to third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">3. Cookies &amp; Local Storage</h2>
            <p className="text-[#64748B]">
              An HttpOnly secure session cookie keeps your authenticated account signed in over HTTPS. Coding challenge ratings, defect progress, and editor preferences in Elevate Practice are persisted locally in your browser via `localStorage`.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">4. Payment Processing &amp; Data Security</h2>
            <p className="text-[#64748B]">
              All web traffic is encrypted in transit via TLS/HTTPS. Passwords are stored using salted scrypt hashing. Online payments are handled securely through Razorpay; Elevate does not directly store raw credit or debit card numbers on its servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">5. Your Rights &amp; Contact</h2>
            <p className="text-[#64748B]">
              For questions regarding your account data, privacy rights, or deletion requests, please contact our support team at{" "}
              <a href="mailto:support@elevate.courses" className="text-[#FF6B35] font-semibold hover:underline">
                support@elevate.courses
              </a>{" "}
              or visit our <Link href="/contact" className="text-[#FF6B35] font-semibold hover:underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
