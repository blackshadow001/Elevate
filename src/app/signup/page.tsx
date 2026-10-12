"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { PasswordVisibilityToggle } from "@/components/ui/PasswordVisibilityToggle";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ArrowRight, Lock, Mail, User } from "lucide-react";


export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { notify } = useNotification();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);
    if (!result.success) { setError(result.error || "Account creation failed."); return; }
    notify({ type: "success", title: "Account created", message: "Your learner account is ready." });
    router.push("/dashboard");
  };
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo className="justify-center" size="large" />
        <h1 className="mt-6 text-3xl font-extrabold text-[#172033] tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#FF6B35] hover:text-[#E85D2A]">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E5E7EB] sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-label="Full name"
                  placeholder="Alex Morgan"
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-label="Email address"
                  placeholder="alex@example.com"
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-label="Password"
                  placeholder="Create a password (min 8 chars)"
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-10 pr-24 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35] focus:bg-white transition-all"
                />
                <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword(value => !value)} inputId="signup-password" />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold text-[#172033] uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-4 pr-24 py-2.5 text-sm focus:outline-none focus:border-[#FF6B35]" />
                <PasswordVisibilityToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(value => !value)} inputId="confirm-password" label="confirmation password" />
              </div>
            </div>

            <div className="text-xs text-[#64748B] leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline text-[#172033]">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="underline text-[#172033]">Privacy Policy</Link>.
            </div>

            <p className="text-xs text-[#64748B]">Your account is stored on this development server. Payments and live streaming remain unavailable until providers are configured.</p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#E85D2A] transition-all"
            >
              <span>{submitting ? "Creating account…" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 text-xs text-[#64748B]"><span className="h-px flex-1 bg-[#E5E7EB]" />or<span className="h-px flex-1 bg-[#E5E7EB]" /></div>
            <GoogleSignInButton label="Sign up with Google" />
            <p className="text-center text-xs text-[#64748B]">Google sign-up creates a learner account. Tutor accounts are created by an administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
