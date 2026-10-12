"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveClass } from "@/data/liveClasses";
import { liveService } from "@/services/liveService";
import { InstructorLiveStudio } from "@/components/instructor/live/InstructorLiveStudio";
import { LearnerClassroomClient } from "@/app/live/classes/[id]/LearnerClassroomClient";

export function LiveClassRoute({ id, initialClass, instructor = false }: { id: string; initialClass?: LiveClass; instructor?: boolean }) {
  const [item, setItem] = useState<LiveClass | undefined>(initialClass);
  const [ready, setReady] = useState(Boolean(initialClass));

  useEffect(() => {
    let active = true;
    liveService.getLiveClass(id).then((result) => {
      if (active) {
        setItem(result);
        setReady(true);
      }
    });
    return () => { active = false; };
  }, [id]);

  if (!ready) return <div className="min-h-screen bg-[#F7F8FA] p-8 text-[#64748B]">Loading classroom…</div>;
  if (!item) return (
    <main className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-[#172033]">This live class is no longer available.</h1>
      <Link className="rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white" href={instructor ? "/instructor/live-classes" : "/live"}>View available classes</Link>
    </main>
  );
  return instructor ? <InstructorLiveStudio liveClass={item} /> : <LearnerClassroomClient initialClass={item} />;
}
