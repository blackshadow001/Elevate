"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LiveEvent } from "@/data/events";
import { liveService } from "@/services/liveService";
import { EventCard } from "@/components/live/EventCard";
import { Sparkles, ArrowLeft, Calendar, Users } from "lucide-react";

export default function EventsCatalogPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    liveService.getEvents().then(setEvents);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/live"
                  className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Live Learning</span>
                </Link>
                <span className="text-xs text-[#64748B]">/</span>
                <span className="text-xs text-[#64748B]">Events</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#172033] mt-2">
                Live Community Events & Workshops
              </h1>
              <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
                Free webinars, masterclasses with industry specialists, FAANG career panels, and global hackathons.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
