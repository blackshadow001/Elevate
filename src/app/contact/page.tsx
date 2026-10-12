"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { notify } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    notify({
      type: "info",
      title: "Demo form completed",
      message: "This preview does not send messages. Support delivery requires a backend.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            Contact Support & Admissions
          </h1>
          <p className="text-sm text-[#64748B]">
            Have a question about courses or platform features? Preview the contact form below; message delivery will be enabled during backend integration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
          {/* Support Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-[#172033]">Contact Channels</h2>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#64748B]">Email Support</h3>
                  <p className="text-sm font-semibold text-[#172033]">Email support pending setup</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">The demo form does not deliver messages yet.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#64748B]">Community</h3>
                  <a href="/community" className="text-sm font-semibold text-[#172033] hover:text-[#FF6B35]">
                    Explore the community
                  </a>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Explore learner discussion spaces.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#64748B]">Location</h3>
                  <p className="text-sm font-semibold text-[#172033]">
                    Elevate demo platform · India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs">
              {submitted ? (
                <div className="text-center py-12 space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#172033]">Demo form complete</h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Thank you {name}. Your inquiry about &ldquo;{subject}&rdquo; was not sent. Message delivery requires backend integration.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] hover:bg-slate-50"
                  >
                    Write Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold uppercase text-[#172033] mb-1.5">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold uppercase text-[#172033] mb-1.5">
                        Your Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-bold uppercase text-[#172033] mb-1.5">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Question about curriculum or corporate access"
                      className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold uppercase text-[#172033] mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message here..."
                      className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all"
                  >
                    <span>Preview Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
