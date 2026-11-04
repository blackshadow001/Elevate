"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, UserRound } from "lucide-react";

type Profile = { name: string; email: string; avatar: string | null; headline: string; bio: string };

export default function InstructorSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/instructor/profile", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not load your tutor profile.");
      if (active) { setProfile(body.data); setHeadline(body.data.headline); setBio(body.data.bio); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load your tutor profile."); });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/instructor/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ headline, bio }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not save your profile.");
      setHeadline(body.data.headline); setBio(body.data.bio);
      setMessage("Your public tutor profile has been saved.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save your profile."); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-3xl space-y-7">
    <div><p className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">Instructor Studio</p><h1 className="mt-2 text-3xl font-extrabold text-[#172033]">Public tutor profile</h1><p className="mt-2 text-sm text-[#64748B]">Introduce yourself to learners. Your headline and biography appear with your published courses.</p></div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
    {!profile ? <p role="status" className="text-sm text-[#64748B]">Loading profile…</p> : <form onSubmit={save} className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-5">{profile.avatar ? <img src={profile.avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-[#E85D2A]"><UserRound className="h-8 w-8" /></span>}<div><p className="font-bold text-[#172033]">{profile.name}</p><p className="text-sm text-[#64748B]">{profile.email}</p><Link href="/profile" className="mt-1 inline-block text-xs font-bold text-[#E85D2A]">Change name or photo →</Link></div></div>
      <div><label htmlFor="instructor-headline" className="block text-sm font-bold text-[#172033]">Professional headline</label><p className="mt-1 text-xs text-[#64748B]">A short description of what you teach.</p><input id="instructor-headline" value={headline} onChange={(event) => setHeadline(event.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm" placeholder="For example, Software engineer and practical web tutor" /></div>
      <div><label htmlFor="instructor-bio" className="block text-sm font-bold text-[#172033]">Biography</label><p className="mt-1 text-xs text-[#64748B]">Share your experience, areas of expertise, and teaching approach.</p><textarea id="instructor-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={2000} rows={7} className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-sm" placeholder="Tell learners about your work and why you enjoy teaching…" /></div>
      <div className="flex justify-end border-t border-[#E5E7EB] pt-5"><button disabled={busy} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{busy ? "Saving…" : "Save profile"}</button></div>
    </form>}
  </div>;
}
