"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Camera, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { SessionUser } from "@/server/auth";

type Profile = SessionUser & { createdAt: string; googleConnected: boolean };

export default function AccountProfile({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState(profile.name);
  const [savedName, setSavedName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const role = profile.isSuperAdmin ? "Super administrator" : profile.role === "admin" ? "Administrator" : profile.role === "instructor" ? "Instructor" : "Learner";
  const joined = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—";

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage("");
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000 || file.size === 0) {
      setError("Choose a JPG, PNG or WebP photo no larger than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const response = await fetch("/api/auth/me/avatar", { method: "POST", credentials: "same-origin", headers: { "Content-Type": file.type }, body: file });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not upload your photo.");
      setAvatar(body.data.avatar);
      setMessage("Profile photo updated.");
      await refresh();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload your photo.");
    } finally { setUploading(false); }
  }

  async function removePhoto() {
    setMessage("");
    setError("");
    setUploading(true);
    try {
      const response = await fetch("/api/auth/me/avatar", { method: "DELETE", credentials: "same-origin" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not remove your photo.");
      setAvatar(null);
      setMessage("Profile photo removed.");
      await refresh();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove your photo.");
    } finally { setUploading(false); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    if (newPassword.length < 8 || newPassword.length > 128) {
      setPasswordError("Use a password of 8–128 characters.");
      return;
    }
    setChangingPassword(true);
    try {
      const response = await fetch("/api/auth/me/password", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not change your password.");
      setCurrentPassword("");
      setNewPassword("");
      await refresh();
      router.replace(profile.role === "admin" ? "/control-center/login" : "/login");
      router.refresh();
    } catch (cause) {
      setPasswordError(cause instanceof Error ? cause.message : "Could not change your password.");
    } finally { setChangingPassword(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const nextName = name.trim();
    if (nextName.length < 2 || nextName.length > 160) {
      setError("Your name must be between 2 and 160 characters.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not save your profile.");
      setName(nextName);
      setSavedName(nextName);
      setMessage("Profile updated.");
      await refresh();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 sm:py-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">Account</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#172033]">My profile</h1>
        <p className="mt-2 text-sm text-[#64748B]">View your account details and choose the name shown across Elevate.</p>
      </div>

      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-6">
          {avatar ? <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> :
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0EB] text-xl font-extrabold text-[#E85D2A]" aria-hidden="true">{savedName.trim().slice(0, 2).toUpperCase()}</span>}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-[#172033]">{savedName}</p>
            <p className="truncate text-sm text-[#64748B]">{profile.email}</p>
            <span className="mt-2 inline-block rounded-full bg-[#FFF0EB] px-2.5 py-1 text-xs font-bold text-[#E85D2A]">{role}</span>
          </div>
        </div>

        <div className="space-y-2 border-b border-[#E5E7EB] py-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#172033]"><Camera className="h-4 w-4" /> Profile photo</p>
          <div className="flex flex-wrap items-center gap-3">
            <label className={`cursor-pointer rounded-xl border border-[#FF6B35] px-4 py-2 text-xs font-bold text-[#E85D2A] hover:bg-[#FFF0EB] ${uploading ? "pointer-events-none opacity-50" : ""}`}>
              {uploading ? "Uploading…" : avatar ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={uploading} className="sr-only" aria-label="Choose profile photo" />
            </label>
            {avatar && <button type="button" onClick={removePhoto} disabled={uploading} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">Remove photo</button>}
          </div>
          <p className="text-xs text-[#64748B]">JPG, PNG or WebP, up to 5 MB. Your photo is visible with your public activity.</p>
        </div>

        <form onSubmit={save} className="mt-6 space-y-5">
          <div>
            <label htmlFor="profile-name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#172033]"><UserRound className="h-4 w-4" /> Display name</label>
            <input id="profile-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={160} required className="w-full rounded-xl border border-[#D6DAE1] bg-white px-4 py-3 text-sm text-[#172033] outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#172033]"><Mail className="h-4 w-4" /> Sign-in email</label>
            <p className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm text-[#475569]">{profile.email}</p>
            <p className="mt-1.5 text-xs text-[#64748B]">Contact an administrator if this email needs to change.</p>
          </div>
          <div className="grid gap-4 border-t border-[#E5E7EB] pt-5 sm:grid-cols-2">
            <p className="flex items-center gap-2 text-sm text-[#475569]"><ShieldCheck className="h-4 w-4 text-[#FF6B35]" /> {role} account</p>
            <p className="flex items-center gap-2 text-sm text-[#475569]"><CalendarDays className="h-4 w-4 text-[#FF6B35]" /> Joined {joined}</p>
          </div>
          {message && <p role="status" className="text-sm font-medium text-green-700">{message}</p>}
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={saving || name.trim() === savedName} className="rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white hover:bg-[#E85D2A] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
        </form>
      </section>

      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#172033]"><LockKeyhole className="h-5 w-5 text-[#FF6B35]" /> Sign-in and security</h2>
        <p className="mt-2 text-sm text-[#64748B]">{profile.googleConnected ? "Google sign-in is connected to this account." : "Your account uses an Elevate password."}</p>
        <form onSubmit={changePassword} className="mt-5 space-y-4">
          <p className="text-sm font-semibold text-[#172033]">Change password</p>
          {profile.googleConnected && <p className="text-xs text-[#64748B]">If you created your account with Google, continue signing in with Google. A password change requires an existing Elevate password.</p>}
          <div>
            <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-[#172033]">Current password</label>
            <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required className="w-full rounded-xl border border-[#D6DAE1] px-4 py-3 text-sm outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#172033]">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={128} required className="w-full rounded-xl border border-[#D6DAE1] px-4 py-3 text-sm outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" />
            <p className="mt-1.5 text-xs text-[#64748B]">Use at least 8 characters{profile.role === "admin" ? " with upper and lower case letters, a number, and a symbol" : ""}. You’ll sign in again after changing it.</p>
          </div>
          {passwordError && <p role="alert" className="text-sm font-medium text-red-600">{passwordError}</p>}
          <button type="submit" disabled={changingPassword} className="rounded-xl border border-[#172033] px-5 py-3 text-sm font-bold text-[#172033] hover:bg-[#F7F8FA] disabled:opacity-50">{changingPassword ? "Updating…" : "Update password"}</button>
        </form>
      </section>
    </div>
  );
}
