"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LiveEvent } from "@/data/events";
import { 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Share2, 
  Award,
  Video
} from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { liveService } from "@/services/liveService";

interface EventDetailClientProps {
  event: LiveEvent;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const { notify } = useNotification();
  const [isRegistered, setIsRegistered] = useState(!!event.isRegistered);
  const [registeredCount, setRegisteredCount] = useState(event.registeredCount);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    liveService.getEvent(event.slug).then((saved) => {
      if (active && saved) { setIsRegistered(Boolean(saved.isRegistered)); setRegisteredCount(saved.registeredCount); }
    });
    return () => { active = false; };
  }, [event.slug]);

  const handleToggleRegister = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await liveService.toggleEventRegistration(event.slug);
      setIsRegistered(next);
      setRegisteredCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    if (next) {
      notify({
        type: "success",
        title: "Registration saved",
        message: `"${event.title}" is saved to your account. No email was sent.`,
      });
    } else {
      notify({
        type: "info",
        title: "Registration Removed",
        message: `You have unregistered from "${event.title}".`,
      });
    }
    } catch (error) {
      notify({ type: "error", title: "Registration unavailable", message: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(false); }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      notify({
        type: "success",
        title: "Link Copied",
        message: "Event URL copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <Link href="/live" className="text-[#FF6B35] font-bold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Live Learning</span>
            </Link>
            <span className="text-[#64748B]">/</span>
            <Link href="/live/events" className="text-[#64748B] hover:text-[#172033]">
              Events
            </Link>
            <span className="text-[#64748B]">/</span>
            <span className="text-[#172033] font-semibold truncate">{event.title}</span>
          </div>

          {/* Event Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 8 cols: Event Information */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                    {event.category}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      event.isPaid
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {event.isPaid ? `₹${event.price}` : "Free Admission"}
                  </span>
                  <span className="text-xs text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{event.duration} minutes</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#172033] leading-tight">
                  {event.title}
                </h1>

                <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Speaker Card */}
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
                <img
                  src={event.speakerAvatar}
                  alt={event.speaker}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#FF6B35]/30"
                />
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-[#FF6B35]">
                    Keynote Speaker
                  </div>
                  <h3 className="text-lg font-black text-[#172033]">{event.speaker}</h3>
                  <p className="text-xs text-[#64748B]">
                    {event.speakerRole} · {event.speakerCompany}
                  </p>
                </div>
              </div>

              {/* Detailed Agenda */}
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 space-y-4 shadow-sm">
                <h3 className="text-lg font-black text-[#172033]">Session Agenda & Key Takeaways</h3>
                <div className="space-y-3">
                  {event.detailedAgenda.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-[#172033]">
                      <div className="w-6 h-6 rounded-lg bg-orange-50 text-[#FF6B35] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 cols: Sticky Registration Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-7 space-y-6 shadow-xl sticky top-24">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Registration Status
                  </span>
                  <span className="text-xs font-black text-[#FF6B35] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{registeredCount.toLocaleString()} Signed Up</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#172033] font-bold">
                    <Calendar className="w-4 h-4 text-[#FF6B35]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Video className="w-4 h-4" />
                    <span>Online event · streaming provider pending</span>
                  </div>
                </div>
              </div>

              {/* Register Action */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleToggleRegister}
                  disabled={busy || (event.isPaid && !isRegistered)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isRegistered
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#FF6B35] hover:bg-[#E85D2A] text-white"
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registered (Click to Cancel)</span>
                    </>
                  ) : (
                    <span>{event.isPaid ? "Paid registration unavailable" : "Register for free admission"}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#172033] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Event With Friends</span>
                </button>
              </div>

              <div className="text-[11px] text-[#64748B] text-center">
                {event.isPaid ? "Paid registration opens when checkout is configured." : "Free registration is saved to your account."}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
