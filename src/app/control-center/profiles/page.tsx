"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useActionDialog } from "@/components/ui/ActionDialogProvider";

type AdminProfile = { id: string; name: string; email: string; status: string; isSuperAdmin: boolean;
  createdAt: string; lastSessionAt: string | null };
type OneTimePassword = { email: string; value: string };

export default function AdminProfilesPage() {
  const { confirm } = useActionDialog();
  const router = useRouter();
  const { refresh } = useAuth();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [oneTime, setOneTime] = useState<OneTimePassword | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createCurrentPassword, setCreateCurrentPassword] = useState("");
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetCurrentPassword, setResetCurrentPassword] = useState("");
  const [ownCurrentPassword, setOwnCurrentPassword] = useState("");
  const [ownNewPassword, setOwnNewPassword] = useState("");
  const [ownConfirmPassword, setOwnConfirmPassword] = useState("");

  async function loadProfiles() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/profiles", { credentials: "same-origin", cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Unable to load administrator profiles.");
      setProfiles(result.data.items); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load administrator profiles."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void Promise.resolve().then(loadProfiles); }, []);

  async function createProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!await confirm(`Create a sub admin account for ${email}? A temporary password will be shown once.`,
      { title: "Create sub admin", confirmLabel: "Create account" })) return;
    setBusy(true); setError(""); setNotice(""); setOneTime(null);
    try {
      const response = await fetch("/api/admin/profiles", { method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, currentPassword: createCurrentPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Unable to create sub admin.");
      setOneTime({ email: result.data.profile.email, value: result.data.temporaryPassword });
      setNotice("Sub admin created. The temporary password is shown once below.");
      setName(""); setEmail(""); await loadProfiles();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create sub admin."); }
    finally { setCreateCurrentPassword(""); setBusy(false); }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetTarget || !await confirm("Reset this sub admin's password and sign out all their sessions?",
      { title: "Reset password", confirmLabel: "Reset password", danger: true })) return;
    setBusy(true); setError(""); setNotice(""); setOneTime(null);
    try {
      const response = await fetch(`/api/admin/profiles/${resetTarget}/reset-password`, { method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: resetCurrentPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Unable to reset password.");
      setOneTime({ email: result.data.profile.email, value: result.data.temporaryPassword });
      setNotice("Password reset. Previous sessions were revoked; share the one-time password securely.");
      setResetTarget(null); await loadProfiles();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reset password."); }
    finally { setResetCurrentPassword(""); setBusy(false); }
  }

  async function changeOwnPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ownNewPassword !== ownConfirmPassword) { setError("New passwords do not match."); return; }
    if (!await confirm("Change your super admin password and sign out all sessions?",
      { title: "Change password", confirmLabel: "Change password", danger: true })) return;
    setBusy(true); setError(""); setNotice(""); setOneTime(null);
    try {
      const response = await fetch("/api/admin/profiles/me/password", { method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: ownCurrentPassword, newPassword: ownNewPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Unable to change password.");
      setOwnCurrentPassword(""); setOwnNewPassword(""); setOwnConfirmPassword("");
      await refresh();
      router.replace("/control-center/login"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to change password."); }
    finally { setBusy(false); }
  }

  const inputClass = "mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#172033] focus:border-[#FF6B35] focus:outline-none";
  const buttonClass = "rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#26344D] disabled:opacity-50";

  return <div className="space-y-6">
    <PageHeader title="Administrator Profiles" subtitle="Super admin controls for administrator accounts and password resets. Passwords are never readable after creation." breadcrumbs={[{ label: "People" }, { label: "Administrator Profiles" }]} />
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
    {oneTime && <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-[#172033]"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">One-time password for {oneTime.email}</h2><p className="mt-1 text-xs text-[#64748B]">This password will not be shown again. Share it through a secure channel, then dismiss it.</p></div><button onClick={() => setOneTime(null)} className="text-xs font-bold text-amber-800">Dismiss</button></div><code className="mt-3 block break-all rounded-lg bg-white p-3 font-mono text-sm">{oneTime.value}</code></section>}

    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs"><h2 className="text-base font-extrabold text-[#172033]">Create sub admin</h2><p className="mt-1 text-xs text-[#64748B]">A new account receives a generated temporary password. It has admin operations access and cannot manage user profiles or passwords.</p><form onSubmit={createProfile} className="mt-5 space-y-3"><label className="block text-xs font-bold">Full name<input className={inputClass} value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={160} required /></label><label className="block text-xs font-bold">Email<input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} required /></label><label className="block text-xs font-bold">Your current password<input className={inputClass} type="password" autoComplete="current-password" value={createCurrentPassword} onChange={e => setCreateCurrentPassword(e.target.value)} required /></label><button className={buttonClass} disabled={busy}>Create sub admin</button></form></section>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs"><h2 className="text-base font-extrabold text-[#172033]">Change your password</h2><p className="mt-1 text-xs text-[#64748B]">Use at least 8 characters with upper and lower case letters, a number, and a symbol. All your sessions will be signed out.</p><form onSubmit={changeOwnPassword} className="mt-5 space-y-3"><label className="block text-xs font-bold">Current password<input className={inputClass} type="password" autoComplete="current-password" value={ownCurrentPassword} onChange={e => setOwnCurrentPassword(e.target.value)} required /></label><label className="block text-xs font-bold">New password<input className={inputClass} type="password" autoComplete="new-password" value={ownNewPassword} onChange={e => setOwnNewPassword(e.target.value)} minLength={8} maxLength={128} required /></label><label className="block text-xs font-bold">Confirm new password<input className={inputClass} type="password" autoComplete="new-password" value={ownConfirmPassword} onChange={e => setOwnConfirmPassword(e.target.value)} required /></label><button className={buttonClass} disabled={busy}>Change password</button></form></section>
    </div>

    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-base font-extrabold text-[#172033]">Administrator accounts</h2><p className="mt-1 text-xs text-[#64748B]">Only the super admin can view these profiles and reset sub admin passwords.</p></div><Link href="/control-center/users?role=admin" className="text-xs font-bold text-[#FF6B35]">Open user directory →</Link></div>{loading ? <p className="mt-5 text-sm text-[#64748B]">Loading profiles…</p> : profiles.length === 0 ? <p className="mt-5 text-sm text-[#64748B]">No administrator profiles found.</p> : <div className="mt-4 space-y-3">{profiles.map(profile => <div key={profile.id} className="rounded-xl border border-[#E5E7EB] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#172033]">{profile.name} <span className="ml-2 text-xs font-medium text-[#64748B]">{profile.isSuperAdmin ? "Super admin" : "Sub admin"}</span></p><p className="text-xs text-[#64748B]">{profile.email} · {profile.status} · Created {new Date(profile.createdAt).toLocaleDateString("en-IN")}</p></div>{!profile.isSuperAdmin && <button onClick={() => { setResetTarget(profile.id); setResetCurrentPassword(""); setOneTime(null); }} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#172033]">Reset password</button>}</div>{resetTarget === profile.id && <form onSubmit={resetPassword} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2"><label className="block text-xs font-bold">Your current password<input className={inputClass} type="password" autoComplete="current-password" value={resetCurrentPassword} onChange={e => setResetCurrentPassword(e.target.value)} required /></label><div className="flex gap-3 sm:col-span-2"><button className={buttonClass} disabled={busy}>Confirm reset</button><button type="button" onClick={() => setResetTarget(null)} className="text-xs font-bold text-[#64748B]">Cancel</button></div></form>}</div>)}</div>}</section>
  </div>;
}
