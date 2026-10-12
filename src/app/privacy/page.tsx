import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Elevate",
  description: "Elevate data protection and privacy policy practices.",
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
          <p className="text-xs text-[#64748B] mt-2">Prototype data-use summary · October 9, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm text-[#172033] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">1. Information We Collect</h2>
            <p className="text-[#64748B]">
              This prototype stores account names, email addresses, salted password hashes, enrollments, lesson progress, wishlists, certificates, registrations and classroom chat in its SQLite database. Payments and survey collection are not connected.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">2. How We Use Information</h2>
            <p className="text-[#64748B]">
              Account records support sign-in, free learning progress, certificates, registrations and instructor management. Streaks and personalized recommendations are not calculated from server activity yet.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">3. Cookie & Local Storage Policies</h2>
            <p className="text-[#64748B]">
              An HttpOnly session cookie keeps you signed in. Enrollments, lesson completion and wishlist preferences are stored with your account. Classroom preview controls and lesson notes are local interface state.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">4. Data Security & Storage</h2>
            <p className="text-[#64748B]">
              Passwords are stored as salted scrypt hashes. Local development uses HTTP; a production deployment must use HTTPS. This prototype does not collect payment card details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">5. User Rights & Contact</h2>
            <p className="text-[#64748B]">
              Account export and erasure workflows are not implemented in this prototype. A production privacy contact and reviewed policy must be configured before launch.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
