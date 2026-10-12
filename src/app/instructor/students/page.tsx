"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, CheckCircle2, Clock } from "lucide-react";

type Student = { enrollmentId: string; status: string; progressPercent: number; enrolledAt: string;
  student: { id: string; name: string; email: string }; course: { id: string; title: string } };

export default function InstructorStudentsPage() {
  const { user, isAuthenticated } = useAuth();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Completed">("All");

  useEffect(() => {
    if (!isAuthenticated || (user.role !== "instructor" && user.role !== "admin")) return;
    let active = true;
    fetch("/api/instructor/students", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Unable to load students."); return body.data as Student[]; })
      .then((items) => { if (active) { setAllStudents(items); setLoading(false); } })
      .catch((cause) => { if (active) { setError(cause instanceof Error ? cause.message : "Unable to load students."); setLoading(false); } });
    return () => { active = false; };
  }, [isAuthenticated, user.id, user.role]);

  const filtered = allStudents.filter((s) => {
    const matchesFilter = statusFilter === "All" || s.status === statusFilter.toLowerCase();
    const matchesSearch =
      s.student.name.toLowerCase().includes(search.toLowerCase()) ||
      s.course.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Student Management
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Monitor enrolled learners, curriculum completion milestones, and recent study activity.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {(["All", "Active", "Completed"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#172033] text-white"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#F7F8FA]"
              }`}
            >
              {st} (
              {st === "All"
                ? allStudents.length
                : allStudents.filter((s) => s.status === st.toLowerCase()).length}
              )
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or course..."
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35] focus:bg-white"
          />
        </div>
      </div>

      {/* Student Table (Requirement 34) */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[#64748B] uppercase font-bold text-[11px]">
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Enrolled Course</th>
                <th className="py-4 px-6">Curriculum Progress</th>
                <th className="py-4 px-6">Enrolled</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F8FA] text-[#172033] font-medium">
              {filtered.map((s) => (
                <tr key={s.enrollmentId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-[#FF6B35] flex items-center justify-center font-bold" aria-hidden="true">{s.student.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-xs text-[#172033]">{s.student.name}</div>
                        <div className="text-[10px] text-[#64748B]">{s.student.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="max-w-[220px] font-semibold truncate text-[#172033]">
                      {s.course.title}
                    </div>
                    <div className="text-[10px] text-[#64748B]">Course enrollment</div>
                  </td>

                  <td className="py-4 px-6 min-w-[160px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#FF6B35]">{s.progressPercent}%</span>
                        <span className="text-[#64748B] text-[10px]">{s.progressPercent === 100 ? "Certified" : "In Progress"}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            s.progressPercent === 100 ? "bg-[#16A34A]" : "bg-[#FF6B35]"
                          }`}
                          style={{ width: `${s.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(s.enrolledAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.status === "completed"
                          ? "bg-emerald-50 text-[#16A34A] border border-emerald-200"
                          : s.status === "active"
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {s.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                      <span className="capitalize">{s.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-8 text-center text-sm text-[#64748B]" role="status">Loading enrolled learners…</p>}
          {!loading && !error && filtered.length === 0 && <p className="p-8 text-center text-sm text-[#64748B]">No enrolled learners match these filters. Publish and share a course to invite learners.</p>}
          {error && <p className="p-8 text-center text-sm text-red-600" role="alert">{error} Refresh the page to retry.</p>}
        </div>
      </div>
    </div>
  );
}
