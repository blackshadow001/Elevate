"use client";

import React from "react";
import {
  Settings,
  Database,
  Shield,
  CreditCard,
  Video,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform & System Settings"
        subtitle="Review the current backend and integration boundaries. Set course prices in Pricing Rules."
        breadcrumbs={[{ label: "Platform" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Marketplace Parameters Form */}
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-[#172033] border-b border-[#E5E7EB] pb-3">
              Marketplace Economics
            </h3>

            <p className="text-xs text-[#64748B]">Official base prices and tutor margin limits are stored per course. Use <a className="font-bold text-[#FF6B35]" href="/control-center/pricing">Pricing Rules</a> to edit them. A platform fee, settlement currency switch, and instructor payout engine have not been implemented.</p>
          </section>

          {/* External Integrations Status */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#172033] border-b border-[#E5E7EB] pb-3">
              Infrastructure & External Services Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#172033]">SQLite Production Database</p>
                    <p className="text-[10px] text-[#94A3B8]">SQLite persistence (node:sqlite)</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#64748B]">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#172033]">Payment Gateway (Razorpay/Stripe)</p>
                    <p className="text-[10px] text-[#94A3B8]">Order quotes only; no payment capture or settlement</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  Planned Gateway
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#64748B]">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#172033]">Live Broadcast Room Server (WebRTC)</p>
                    <p className="text-[10px] text-[#94A3B8]">Stored schedules and chat; no streaming provider</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  Provider required
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
              Environment Diagnostics
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Next.js Runtime:</span>
                <span className="font-mono font-bold text-[#172033]">App Router v16</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Engine:</span>
                <span className="font-mono font-bold text-[#172033]">Server runtime</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Authority:</span>
                <span className="font-bold text-[#FF6B35]">Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
