"use client";

import React, { useEffect, useState } from "react";
import {
  Radio,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<Array<{ id: string; title: string; status: string; scheduled_at: string; instructor_name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/live-classes", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.items) {
          setClasses(json.data.items);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Learning Operations"
        subtitle="Review stored live class schedules and attendance. Streaming requires an external provider."
        breadcrumbs={[{ label: "Operations" }, { label: "Live Classes" }]}
      />

      {loading ? (
        <div className="py-20 text-center text-xs text-[#64748B]">Loading sessions…</div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-xs text-[#64748B]">
          No live sessions currently scheduled in database.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] text-[#94A3B8]">{c.id}</span>
                <StatusBadge status={c.status} size="sm" />
              </div>
              <h3 className="mt-2 text-sm font-black text-[#172033] line-clamp-1">{c.title}</h3>
              <p className="mt-1 text-xs text-[#64748B]">Instructor: {c.instructor_name || "Instructor"}</p>

              <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">
                  {c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString("en-IN") : "Scheduled"}
                </span>
                <a
                  href={`/live/classes/${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#FF6B35] hover:text-[#E85D2A]"
                >
                  <span>Classroom</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
