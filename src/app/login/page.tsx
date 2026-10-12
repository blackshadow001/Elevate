"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { PasswordVisibilityToggle } from "@/components/ui/PasswordVisibilityToggle";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Mail, Lock, ArrowRight, Sparkles, GraduationCap, CheckCircle2 } from "lucide-react";

function GoogleFeedback() {
  const params = useSearchParams();
  const error = params.get("google_error");
  const messages: Record<string, string> = {
    configuration: "Google sign-in is not configured. Contact the site administrator.",
    origin: "Google sign-in requires the configured site address. Open this site on localhost or its configured HTTPS domain.",
    cancelled: "Google sign-in was cancelled.",
    state: "Google sign-in expired. Please try again.",
    link_login: "Sign in with your password before connecting Google.",
    link_login_required: "Sign in with your password, then connect Google from this page.",
    email_mismatch: "Choose the Google account with the same email as your Elevate account.",
    google_already_linked: "This Google account is already connected to another login.",
    admin_portal_required: "Administrator accounts must use the dedicated admin portal.",
    account_unavailable: "This account is unavailable. Contact support.",
    failed: "Google sign-in could not be completed. Please try again.",
  };
  if (error) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">{messages[error] || messages.failed}</p>;
  if (params.get("google") === "linked") return <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">Google is now connected to your Elevate account.</p>;
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const { notify } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user) {
      notify({
        type: "success",
        title: `Welcome back, ${res.user.name}!`,
        message: `Signed in as ${res.user.role === "instructor" ? "Instructor" : "Learner"}.`,
      });

      // Role-based routing
      if (res.user.role === "instructor") {
        router.push("/instructor");
      } else {
        router.push("/dashboard");
      }
    } else {
      setErrorMessage(res.error || "Invalid credentials.");
      notify({
        type: "error",
        title: "Sign In Failed",
        message: res.error || "Check your credentials and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Branding & Educational Highlights (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-6">
          <div className="space-y-4">
            <Logo size="large" />
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
                Learn Without Limits
              </span>
              <h2 className="text-3xl font-extrabold text-[#172033] leading-snug">
                Master skills for the modern industry.
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Join thousands of software engineers, data analysts, and product designers accelerating their careers with Elevate.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center gap-3 text-xs font-semibold text-[#172033]">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>Guided courses and practical lessons</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-[#172033]">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Verifiable course completion records</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-[#172033]">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Interactive Live Masterclasses & Mentorship</span>
            </div>
          </div>
        </div>

        {/* Right: Clean Unified Login Form Card */}
        <div className="lg:col-span-7 max-w-md w-full mx-auto">
          <div className="bg-white py-9 px-6 sm:px-10 rounded-3xl border border-[#E5E7EB] shadow-xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="lg:hidden flex justify-center mb-4">
                <Logo size="large" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                Welcome back 👋
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Use your account email to open your learning or teaching workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}
              <Suspense fallback={null}><GoogleFeedback /></Suspense>

              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-xs font-bold text-[#172033] uppercase">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-bold text-[#172033] uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      notify({
                        type: "info",
                        title: "Password recovery unavailable",
                        message: "Email recovery is not configured yet. Contact support for help.",
                      });
                    }}
                    className="text-xs font-medium text-[#FF6B35] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-10 pr-24 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35] focus:bg-white transition-all"
                  />
                  <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword(value => !value)} inputId="login-password" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-[#64748B]"><span className="h-px flex-1 bg-[#E5E7EB]" />or<span className="h-px flex-1 bg-[#E5E7EB]" /></div>
              <GoogleSignInButton />
              {isAuthenticated && user.role !== "admin" && <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] p-3 text-center">
                <p className="text-xs text-[#64748B]">Signed in as {user.email}? Connect Google to this account.</p>
                <GoogleSignInButton intent="link" label="Connect Google account" />
              </div>}
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-2 pt-2 border-t border-[#E5E7EB]/80">
              <p className="text-xs text-[#64748B]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold text-[#FF6B35] hover:underline">
                  Create one
                </Link>
              </p>
              <div>
                <Link
                  href="/login/welcome"
                  className="text-[11px] text-[#64748B] hover:text-[#172033] transition-colors underline"
                >
                  New to Elevate? Choose how you want to start →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
