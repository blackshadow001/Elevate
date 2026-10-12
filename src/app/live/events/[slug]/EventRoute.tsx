"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveEvent } from "@/data/events";
import { liveService } from "@/services/liveService";
import { EventDetailClient } from "./EventDetailClient";

export function EventRoute({ slug }: { slug: string }) {
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    liveService.getEvent(slug).then((value) => {
      if (active) { setEvent(value || null); setReady(true); }
    });
    return () => { active = false; };
  }, [slug]);
  if (!ready) return <main className="min-h-screen p-8 text-[#64748B]">Loading event…</main>;
  if (!event) return <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-2xl font-bold text-[#172033]">Event not found.</h1>
    <Link href="/live/events" className="rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white">View events</Link>
  </main>;
  return <EventDetailClient event={event} />;
}
