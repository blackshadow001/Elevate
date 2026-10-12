"use client";

import React, { useState } from "react";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { Settings, User, CreditCard, Bell, Shield, CheckCircle2 } from "lucide-react";

export default function InstructorSettingsPage() {
  const { notify } = useNotification();

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    headline: "Senior Software Architect & Lead Instructor",
    bio: "Ex-Google architect with 12+ years of engineering experience specializing in distributed systems, React, and cloud scalability.",
    bankAccount: "HDFC0001234 — **** 8912",
    payoutSchedule: "Monthly (1st of each month)",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    notify({
      type: "success",
      title: "Settings Saved",
      message: "Your instructor profile and payout details have been updated.",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Instructor Studio Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Configure your public instructor profile, bio, banking payout channels, and notifications.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#FF6B35]" />
              <span>Public Profile Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Display Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Professional Headline</label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[#172033]">Instructor Biography</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3.5 text-xs text-[#172033] focus:bg-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#16A34A]" />
              <span>Revenue Payout Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Linked Bank Account (NEFT / IMPS)</label>
                <input
                  type="text"
                  value={profile.bankAccount}
                  onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#172033]">Payout Frequency</label>
                <select
                  value={profile.payoutSchedule}
                  onChange={(e) => setProfile({ ...profile, payoutSchedule: e.target.value })}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:bg-white focus:outline-none"
                >
                  <option>Monthly (1st of each month)</option>
                  <option>Bi-weekly</option>
                  <option>Instant (on threshold ₹50,000)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
