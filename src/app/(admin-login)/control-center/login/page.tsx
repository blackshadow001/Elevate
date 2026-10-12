"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordVisibilityToggle } from "@/components/ui/PasswordVisibilityToggle";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error?.message || "Unable to sign in."); return; }
      window.location.replace("/control-center");
    } catch { setError("Unable to connect. Please try again."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#101827] flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-2xl">
      <div className="flex items-center gap-3 text-[#172033]"><Logo href="/control-center" size="large" /><span className="text-xl font-extrabold">Admin</span></div>
      <h1 className="mt-9 text-3xl font-extrabold text-[#172033]">Administrator sign in</h1>
      <p className="mt-2 text-sm text-[#64748B]">Review courses, manage pricing, and control publication.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div><label htmlFor="admin-email" className="block text-sm font-bold text-[#172033]">Admin email</label><input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-[#172033] focus:border-[#FF6B35] focus:outline-none" /></div>
        <div><label htmlFor="admin-password" className="block text-sm font-bold text-[#172033]">Password</label><div className="relative mt-2"><input id="admin-password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#E5E7EB] py-3 pl-4 pr-24 text-[#172033] focus:border-[#FF6B35] focus:outline-none" /><PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword(value => !value)} inputId="admin-password" /></div></div>
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#FF6B35] px-5 py-3 font-bold text-white hover:bg-[#E85D2A] disabled:opacity-60">{loading ? "Signing in…" : "Open admin portal"}</button>
      </form>
      <Link href="/login" className="mt-7 block text-center text-sm text-[#64748B] hover:text-[#FF6B35]">Learner or tutor? Use the main login</Link>
    </div>
  </main>;
}
