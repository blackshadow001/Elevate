"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GraduationCap, Users, DollarSign, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

export default function InstructorApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [bio, setBio] = useState("");
  const { notify } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    notify({
      type: "info",
      title: "Demo application complete",
      message: "This preview does not send an application or create a tutor login. Only an administrator can create tutor access.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#172033] text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Instructor Partnership
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Teach what you know. Empower thousands.
            </h1>
            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
              Explore the teaching workflow. Tutor logins are created by an administrator after approval.
            </p>
          </div>
        </section>

        {/* Benefits & Application Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
            {/* Why Teach */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-2xl font-bold text-[#172033]">Why teach on Elevate?</h2>

              <div className="space-y-4 text-xs text-[#64748B]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-[#172033] block">Showcase your expertise</strong>
                    Outline practical lessons and present your teaching approach.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-[#172033] block">Plan your course pricing</strong>
                    Preview free and paid course options in the studio.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-[#172033] block">Build structured learning</strong>
                    Organize sections, lessons, and live classes in one workspace.
                  </div>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs">
                {submitted ? (
                  <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#172033]">Demo application complete</h3>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                      Thank you {name}. Your interest in teaching {topic} is visible in this browser session only. No application was sent to {email}, and no tutor login was created. Contact the platform administrator for tutor access.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-[#172033] mb-4">Instructor Application</h3>
                    <p className="text-xs text-[#64748B]">This is a local preview. It does not submit an application or create a tutor account.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="apply-name" className="block text-xs font-bold uppercase text-[#172033] mb-1">
                          Full Name
                        </label>
                        <input
                          id="apply-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. Rajesh Raman"
                          className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>

                      <div>
                        <label htmlFor="apply-email" className="block text-xs font-bold uppercase text-[#172033] mb-1">
                          Email Address
                        </label>
                        <input
                          id="apply-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rajesh@example.com"
                          className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="apply-topic" className="block text-xs font-bold uppercase text-[#172033] mb-1">
                        Course Topic You Wish to Teach
                      </label>
                      <input
                        id="apply-topic"
                        type="text"
                        required
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Distributed Systems in Go, Flutter Mobile Apps"
                        className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>

                    <div>
                      <label htmlFor="apply-bio" className="block text-xs font-bold uppercase text-[#172033] mb-1">
                        Teaching Experience & Professional Background
                      </label>
                      <textarea
                        id="apply-bio"
                        rows={4}
                        required
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Share your technical background, industry experience, and any prior video teaching work..."
                        className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
                    >
                      Preview Instructor Application →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
