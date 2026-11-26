"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LiveEvent } from "@/data/events";
import { Calendar, Clock, Users, ArrowRight, CheckCircle2, BadgeCheck, Tag } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { liveService } from "@/services/liveService";

interface EventCardProps {
  event: LiveEvent;
}

export function EventCard({ event }: EventCardProps) {
  const { notify } = useNotification();
  const [isRegistered, setIsRegistered] = useState(!!event.isRegistered);
  const [registeredCount, setRegisteredCount] = useState(event.registeredCount);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    liveService.getEvent(event.slug).then((value) => {
      if (active && value) { setIsRegistered(Boolean(value.isRegistered)); setRegisteredCount(value.registeredCount); }
    });
    return () => { active = false; };
  }, [event.slug]);

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
    const registered = await liveService.toggleEventRegistration(event.slug);
    setIsRegistered(registered);
    setRegisteredCount((prev) => (registered ? prev + 1 : Math.max(0, prev - 1)));

    if (registered) {
      notify({
        type: "success",
        title: "Registration saved",
        message: `"${event.title}" is saved to your account. No email was sent.`,
      });
    } else {
      notify({
        type: "info",
        title: "Registration Cancelled",
        message: `You unregistered from "${event.title}".`,
      });
    }
    } catch (error) {
      notify({ type: "error", title: "Registration unavailable", message: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 p-6 sm:p-7 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Top bar: Category, Free/Paid badge, and Date */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md bg-[#F7F8FA] text-[#64748B] border border-[#E5E7EB]">
            {event.category}
          </span>

          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              event.isPaid
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {event.isPaid ? `₹${event.price}` : "Free Event"}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6B35]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{event.date} · {event.time}</span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <Link href={`/live/events/${event.slug}`}>
            <h3 className="font-extrabold text-lg text-[#172033] group-hover:text-[#FF6B35] transition-colors leading-snug line-clamp-2">
              {event.title}
            </h3>
          </Link>
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed pt-1">
            {event.description}
          </p>
        </div>

        {/* Speaker Info */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#F1F5F9]">
          <img
            src={event.speakerAvatar}
            alt={event.speaker}
            className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#172033] truncate">{event.speaker}</div>
            <div className="text-[10px] text-[#64748B] truncate">{event.speakerRole}</div>
          </div>
        </div>
      </div>

      {/* Footer stats & Register CTA */}
      <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Users className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span>{registeredCount.toLocaleString()} registered</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegister}
            disabled={busy || (event.isPaid && !isRegistered)}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegistered
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-[#FF6B35] hover:bg-[#E85D2A] text-white shadow-xs"
            }`}
          >
            {isRegistered ? "✓ Registered" : event.isPaid ? "Checkout pending" : "Register Now"}
          </button>

          <Link
            href={`/live/events/${event.slug}`}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F7F8FA] transition-colors"
            title="View Event Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
