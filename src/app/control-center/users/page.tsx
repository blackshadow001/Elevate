"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  AlertCircle,
  RefreshCw,
  UserX,
  UserCheck,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { useActionDialog } from "@/components/ui/ActionDialogProvider";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "learner" | "instructor" | "admin";
  status: "active" | "disabled";
  avatar: string | null;
  createdAt: string;
}
interface UserDetail {
  user: UserRow;
  courses: Array<{ id: string; title: string; review_status: string }>;
  enrollments: Array<{ id: string; course_title: string; progress_percent: number }>;
  certificates: Array<{ id: string; course_title: string; verification_status: string }>;
}

export default function AdminUsersPage() {
  const { confirm, prompt } = useActionDialog();
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get("role") || "";

  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creatingTutor, setCreatingTutor] = useState(false);
  const [tutorName, setTutorName] = useState("");
  const [tutorEmail, setTutorEmail] = useState("");
  const [tutorReason, setTutorReason] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [oneTimePassword, setOneTimePassword] = useState<{ email: string; value: string } | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ search, role: roleFilter, status: statusFilter, page: String(page), pageSize: "25" });
      const res = await fetch(`/api/admin/users?${query}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load users");
      setUsers(json.data.items || []);
      setTotal(json.data.total || 0);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadUsers);
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    if (initialRole) queueMicrotask(() => setRoleFilter(initialRole));
  }, [initialRole]);

  const handleToggleStatus = async (user: UserRow) => {
    const nextStatus = user.status === "active" ? "disabled" : "active";
    const confirmMsg = `Are you sure you want to ${nextStatus === "disabled" ? "disable" : "activate"} user ${user.name}?`;
    if (!await confirm(confirmMsg, { title: `${nextStatus === "disabled" ? "Deactivate" : "Activate"} account`,
      confirmLabel: nextStatus === "disabled" ? "Deactivate" : "Activate", danger: nextStatus === "disabled" })) return;
    const reason = await prompt("Why is this account status changing? This reason is saved in the audit history.");
    if (!reason || reason.trim().length < 3) return;

    setBusyId(user.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reason: reason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update status");

      setSuccess(`User status updated to ${nextStatus}.`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (user: UserRow, newRole: string) => {
    const reason = await prompt(`Why should ${user.name}'s role change to ${newRole}? This reason is saved in the audit history.`,
      { title: "Change account role", confirmLabel: "Continue", danger: newRole === "admin" });
    if (!reason || reason.trim().length < 3) return;
    setBusyId(user.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, reason: reason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update role");

      setSuccess(`User role changed to ${newRole}.`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role change failed");
    } finally {
      setBusyId(null);
    }
  };

  async function inspectUser(userId: string) {
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { credentials: "same-origin" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Unable to load user details.");
      setSelected(result.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load user details."); }
  }

  async function handleCreateTutor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!await confirm(`Create a tutor account for ${tutorEmail}? A temporary password will be shown once.`,
      { title: "Create tutor account", confirmLabel: "Create account" })) return;
    setCreatingTutor(true); setError(""); setSuccess(""); setOneTimePassword(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tutorName, email: tutorEmail, reason: tutorReason, currentPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Unable to create tutor account.");
      setOneTimePassword({ email: result.data.user.email, value: result.data.temporaryPassword });
      setSuccess("Tutor account created. Share the one-time password securely.");
      setTutorName(""); setTutorEmail(""); setTutorReason("");
      await loadUsers();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create tutor account."); }
    finally { setCurrentPassword(""); setCreatingTutor(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="People & User Directory"
        subtitle="Manage learner profiles, tutor accreditations, system operators, and account access permissions."
        breadcrumbs={[{ label: "People" }, { label: "User Directory" }]}
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {oneTimePassword && <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-[#172033]">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">Temporary password for {oneTimePassword.email}</h2>
          <p className="mt-1 text-xs text-[#64748B]">This password is shown only once. Share it securely and dismiss it when done.</p></div>
          <button type="button" onClick={() => setOneTimePassword(null)} className="text-xs font-bold text-amber-800">Dismiss</button></div>
        <code className="mt-3 block break-all rounded-lg bg-white p-3 font-mono text-sm">{oneTimePassword.value}</code>
      </section>}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[#172033]">Create tutor login</h2>
        <p className="mt-1 text-xs text-[#64748B]">Only the super admin can create tutor accounts. Public signup creates learner accounts. Tutors use the main login and can switch to Learner View.</p>
        <form onSubmit={handleCreateTutor} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold text-[#172033]">Full name<input className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#FF6B35] focus:outline-none" value={tutorName} onChange={event => setTutorName(event.target.value)} minLength={2} maxLength={160} required /></label>
          <label className="block text-xs font-bold text-[#172033]">Email<input className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#FF6B35] focus:outline-none" type="email" value={tutorEmail} onChange={event => setTutorEmail(event.target.value)} maxLength={254} required /></label>
          <label className="block text-xs font-bold text-[#172033]">Reason for access<input className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#FF6B35] focus:outline-none" value={tutorReason} onChange={event => setTutorReason(event.target.value)} minLength={3} maxLength={500} required /></label>
          <label className="block text-xs font-bold text-[#172033]">Your current password<input className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#FF6B35] focus:outline-none" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></label>
          <button className="rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#26344D] disabled:opacity-50 sm:col-span-2 sm:justify-self-start" disabled={creatingTutor}>{creatingTutor ? "Creating…" : "Create tutor account"}</button>
        </form>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID…"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] pl-10 pr-4 py-2 text-xs text-[#172033] placeholder-[#94A3B8] focus:border-[#FF6B35] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => { setPage(1); setRoleFilter(e.target.value); }}
            className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#172033] focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="learner">Learners</option>
            <option value="instructor">Instructors / Tutors</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#172033] focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>

          <button
            onClick={loadUsers}
            className="rounded-xl border border-[#E5E7EB] p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]"
            title="Refresh directory"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        {loading && users.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading user directory…</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B]">No users found matching filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">User</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Role</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Account Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Joined Date</th>
                  <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {users.map((u) => {
                  const isBusy = busyId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#172033] text-white font-bold text-xs uppercase">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-[#172033]">{u.name}</p>
                            <p className="text-[11px] text-[#94A3B8]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          disabled={isBusy || u.role === "admin"}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-bold text-[#172033] focus:outline-none disabled:opacity-60"
                        >
                          <option value="learner">Learner</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-[#94A3B8]">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                            u.status === "active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {isBusy ? "Updating…" : u.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" onClick={() => void inspectUser(u.id)} className="ml-2 rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-bold text-[#172033] hover:bg-[#F8FAFC]">Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-[#64748B]"><span>{total} accounts · page {page} of {Math.max(1, Math.ceil(total / 25))}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Previous</button><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Next</button></div></div>
      {selected && <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-xs text-[#475569]"><div className="flex justify-between"><h2 className="text-base font-bold text-[#172033]">{selected.user.name}</h2><button onClick={() => setSelected(null)} aria-label="Close user details">Close</button></div><p>{selected.user.email} · {selected.user.role} · {selected.user.status}</p><div className="mt-4 grid gap-4 md:grid-cols-3"><div><h3 className="font-bold">Courses ({selected.courses.length})</h3>{selected.courses.map((course) => <p key={course.id}>{course.title} · {course.review_status}</p>)}</div><div><h3 className="font-bold">Enrollments ({selected.enrollments.length})</h3>{selected.enrollments.map((enrollment) => <p key={enrollment.id}>{enrollment.course_title} · {enrollment.progress_percent}%</p>)}</div><div><h3 className="font-bold">Certificates ({selected.certificates.length})</h3>{selected.certificates.map((certificate) => <p key={certificate.id}>{certificate.course_title} · {certificate.verification_status}</p>)}</div></div></section>}
    </div>
  );
}
