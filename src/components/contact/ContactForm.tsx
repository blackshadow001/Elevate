"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please fill in your name, email address, and message.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      // Send message or handle submission
      // Simulated response for client inquiry feedback
      await new Promise((r) => setTimeout(r, 800));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong while sending your message. Please email support@elevate.courses directly.");
    }
  };

  if (status === "success") {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-[#172033]">
          Thank you for reaching out!
        </h3>
        <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
          Your message has been received. Our team will review your inquiry and follow up at <strong className="text-[#172033]">{formData.email}</strong> within 24 hours.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              setFormData({ name: "", email: "", category: "general", subject: "", message: "" });
              setStatus("idle");
            }}
            className="px-6 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#172033] hover:bg-slate-50 transition-all cursor-pointer"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-[#172033]">Send a Message</h3>
        <p className="text-sm text-[#64748B]">
          Fill out the details below and we&apos;ll get back to you promptly.
        </p>
      </div>

      {status === "error" && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-[#172033]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            placeholder="e.g. Alex Johnson"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-[#172033]">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-category" className="block text-xs font-bold uppercase tracking-wider text-[#172033]">
            Inquiry Type
          </label>
          <select
            id="contact-category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] bg-white cursor-pointer"
          >
            <option value="general">Learner Support & Questions</option>
            <option value="instructor">Instructor Partnerships</option>
            <option value="enterprise">Enterprise & Team Plans</option>
            <option value="technical">Technical Bug or Issue</option>
            <option value="other">Other Inquiry</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-[#172033]">
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            placeholder="Brief topic of your inquiry"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-[#172033]">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          placeholder="How can we assist you? Please describe your question or issue in detail..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF6B35] text-white font-bold text-sm hover:bg-[#E85D2A] disabled:opacity-50 transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
