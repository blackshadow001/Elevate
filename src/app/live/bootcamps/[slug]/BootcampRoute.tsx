"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bootcamp } from "@/data/bootcamps";
import { liveService } from "@/services/liveService";
import { BootcampDetailClient } from "./BootcampDetailClient";

export function BootcampRoute({ slug, initialBootcamp }: { slug: string; initialBootcamp?: Bootcamp }) {
  const [bootcamp, setBootcamp] = useState(initialBootcamp);
  const [ready, setReady] = useState(Boolean(initialBootcamp));

  useEffect(() => {
    let active = true;
    liveService.getBootcamp(slug).then((item) => {
      if (active) {
        setBootcamp(item);
        setReady(true);
      }
    });
    return () => { active = false; };
  }, [slug]);

  if (!ready) return <main className="min-h-screen bg-[#FFFDF9] p-8 text-[#64748B]">Loading bootcamp…</main>;
  if (!bootcamp) return <main className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="text-2xl font-bold text-[#172033]">Bootcamp not found.</h1><Link href="/live/bootcamps" className="rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white">View bootcamps</Link></main>;
  return <BootcampDetailClient bootcamp={bootcamp} />;
}
