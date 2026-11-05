"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Recording = { classId: string; title: string; courseTitle: string | null; instructorName: string;
  scheduledAt: string; recordingTitle: string; assetId: string };

export default function ClassRecordingsPage() {
  const [items, setItems] = useState<Recording[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/live/recordings", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message || "Unable to load recordings.");
        return body.data as Recording[];
      })
      .then((recordings) => { if (active) setItems(recordings); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load recordings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <div className="min-h-screen bg-[#FFFDF9] flex flex-col"><Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
      <Link href="/live" className="text-sm font-semibold text-[#FF6B35]">← Live learning</Link>
      <h1 className="mt-5 text-3xl font-black text-[#172033]">Class recordings</h1>
      <p className="mt-2 text-sm text-[#64748B]">Catch up on completed classes available to your account.</p>
      {loading && <p className="mt-8 text-sm">Loading recordings…</p>}
      {error && <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error} <Link href="/login" className="font-bold underline">Sign in</Link></div>}
      {!loading && !error && items.length === 0 && <p className="mt-8 rounded-2xl border bg-white p-6 text-sm text-[#64748B]">No class recordings are available yet. Tutors can upload a recording after their class ends.</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map((item) => <article key={item.classId} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <video controls preload="metadata" className="aspect-video w-full bg-black" src={`/api/media/${encodeURIComponent(item.assetId)}/stream`} aria-label={`Recording: ${item.recordingTitle}`} />
          <div className="space-y-2 p-5"><h2 className="font-bold text-[#172033]">{item.recordingTitle}</h2>
            <p className="text-xs text-[#64748B]">{item.courseTitle || "Open class"} · {item.instructorName}</p>
            <p className="text-xs text-[#64748B]">{new Date(item.scheduledAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
          </div>
        </article>)}
      </div>
    </main><Footer /></div>;
}
