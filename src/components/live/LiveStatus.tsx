import React from "react";

interface LiveStatusProps {
  status: "scheduled" | "live" | "completed" | "cancelled";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LiveStatus({ status, size = "md", className = "" }: LiveStatusProps) {
  switch (status) {
    case "live":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-red-50 text-red-600 border border-red-200/60 ${
            size === "sm"
              ? "px-2 py-0.5 text-[10px]"
              : size === "lg"
              ? "px-3.5 py-1 text-xs"
              : "px-2.5 py-0.5 text-[11px]"
          } ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span>Live Now</span>
        </span>
      );

    case "scheduled":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-100 text-[#64748B] border border-slate-200 ${
            size === "sm"
              ? "px-2 py-0.5 text-[10px]"
              : size === "lg"
              ? "px-3 py-1 text-xs"
              : "px-2.5 py-0.5 text-[11px]"
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Scheduled</span>
        </span>
      );

    case "completed":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 ${
            size === "sm"
              ? "px-2 py-0.5 text-[10px]"
              : size === "lg"
              ? "px-3 py-1 text-xs"
              : "px-2.5 py-0.5 text-[11px]"
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Completed</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-200 ${
            size === "sm"
              ? "px-2 py-0.5 text-[10px]"
              : size === "lg"
              ? "px-3 py-1 text-xs"
              : "px-2.5 py-0.5 text-[11px]"
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>Cancelled</span>
        </span>
      );
  }
}
