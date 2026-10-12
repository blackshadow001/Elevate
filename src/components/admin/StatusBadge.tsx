import React from "react";

export type StatusType =
  | "published"
  | "draft"
  | "pending_approval"
  | "rejected"
  | "approved"
  | "active"
  | "disabled"
  | "paid"
  | "pending"
  | "refunded"
  | "completed"
  | "upcoming"
  | "live"
  | "cancelled";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  published: { label: "Published", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  active: { label: "Active", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  paid: { label: "Paid", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  approved: { label: "Approved", bg: "bg-teal-50 border-teal-200", text: "text-teal-700", dot: "bg-teal-500" },
  completed: { label: "Completed", bg: "bg-slate-50 border-slate-200", text: "text-slate-700", dot: "bg-slate-400" },

  pending_approval: { label: "Pending Approval", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  pending: { label: "Pending", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  upcoming: { label: "Upcoming", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },

  draft: { label: "Draft", bg: "bg-slate-100 border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
  live: { label: "Live Now", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500 animate-pulse" },

  rejected: { label: "Rejected", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  disabled: { label: "Disabled", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  refunded: { label: "Refunded", bg: "bg-purple-50 border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  cancelled: { label: "Cancelled", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
};

export default function StatusBadge({
  status,
  size = "md",
  customLabel,
}: {
  status: string;
  size?: "sm" | "md";
  customLabel?: string;
}) {
  const norm = status?.toLowerCase() || "draft";
  const config = STATUS_CONFIG[norm] || {
    label: status || "Unknown",
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-700",
    dot: "bg-slate-400",
  };

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold capitalize tracking-tight ${
        config.bg
      } ${config.text} ${isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{customLabel || config.label}</span>
    </span>
  );
}
