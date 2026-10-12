"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { GraduationCap, Presentation, ArrowRight } from "lucide-react";

export default function WelcomeOnboardingPage() {
  const router = useRouter();
  const handleSelectLearner = () => {
    router.push("/signup");
  };

  const handleSelectInstructor = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-10">
        <div className="flex justify-center">
          <Logo size="large" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            Welcome to Elevate
          </h1>
          <p className="text-base text-[#64748B]">
            How are you learning today?
          </p>
        </div>

        {/* 2 Roles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Card 1: Learner */}
          <div className="bg-white rounded-3xl border-2 border-[#E5E7EB] hover:border-[#FF6B35] p-8 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                  I&apos;m here to learn
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Browse industry courses, practice hands-on projects, attend live classes, and build verifiable skills.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSelectLearner}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-sm font-bold py-3 px-5 rounded-xl shadow-xs transition-all active:scale-97 cursor-pointer"
            >
              <span>Create Learner Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Instructor */}
          <div className="bg-white rounded-3xl border-2 border-[#E5E7EB] hover:border-[#172033] p-8 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#172033] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Presentation className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#172033]">
                  I&apos;m here to teach
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Design curriculum, publish video courses, host live interactive classes, and mentor ambitious students worldwide.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSelectInstructor}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#26344D] text-white text-sm font-bold py-3 px-5 rounded-xl shadow-xs transition-all active:scale-97 cursor-pointer"
            >
              <span>Instructor Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-[#64748B]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#FF6B35] hover:underline">
            Sign in directly
          </Link>
        </p>
      </div>
    </div>
  );
}
