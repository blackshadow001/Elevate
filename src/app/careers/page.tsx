"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { mockJobs, JobPosting } from "@/data/supportData";
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const { notify } = useNotification();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    notify({
      type: "success",
      title: "Application Received ✓",
      message: `Thank you ${applicantName}, our recruiting team will review your submission for ${selectedJob?.title}.`,
    });
    setSelectedJob(null);
    setApplicantName("");
    setApplicantEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#172033] text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              We Are Hiring
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Build the future of learning with us.
            </h1>
            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
              Join a passionate team of engineers, educators, and designers crafting world-class education tools for modern developers.
            </p>
          </div>
        </section>

        {/* Job Openings */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-[#172033]">Open Positions ({mockJobs.length})</h2>
            <span className="text-xs text-[#64748B]">Full-time & Remote friendly</span>
          </div>

          <div className="space-y-4">
            {mockJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#FF6B35]/50 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-[#FF6B35] tracking-wide">
                      {job.department}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-[#64748B]">{job.type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#172033]">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.experience}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#172033] hover:bg-[#FF6B35] text-white text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Application Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setSelectedJob(null)}
            />
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E5E7EB] z-10 animate-in zoom-in-95 space-y-5">
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-5 right-5 p-1 text-slate-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B35]">
                  Applying for
                </span>
                <h3 className="text-xl font-bold text-[#172033]">{selectedJob.title}</h3>
                <p className="text-xs text-[#64748B] mt-1">{selectedJob.description}</p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase mb-1">
                    LinkedIn / Portfolio URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
                >
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
