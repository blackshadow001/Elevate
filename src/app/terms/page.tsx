import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Elevate",
  description: "Terms and conditions governing the use of the Elevate education platform.",
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
          <p className="text-xs text-[#64748B] mt-2">Prototype notice · October 9, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm text-[#172033] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">1. Acceptance of Terms</h2>
            <p className="text-[#64748B]">
              Elevate is currently a frontend and local backend prototype. These pages describe planned behavior and are not a finalized production agreement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">2. Student Enrollment & Lifetime Access</h2>
            <p className="text-[#64748B]">
              Free course enrollment is available in this prototype. Paid checkout and private lesson media are not yet available, so no paid access or download entitlement is offered here.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">3. Intellectual Property Rights</h2>
            <p className="text-[#64748B]">
              Course content and sample certificates are included to demonstrate the learning experience. Content rights and distribution terms require review before a production launch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">4. Payments and Refunds</h2>
            <p className="text-[#64748B]">
              Payments are not configured. Pricing, refund eligibility and support processes must be defined before paid courses are offered.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#172033]">5. Termination & Code of Conduct</h2>
            <p className="text-[#64748B]">
              Production conduct, moderation and account appeal rules still need review. Classroom chat is stored locally for the prototype; real-time moderation is not connected.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
