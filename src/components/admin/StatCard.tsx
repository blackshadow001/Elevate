import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon: LucideIcon;
  variant?: "default" | "orange" | "navy" | "warning";
}

export default function StatCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const iconColor =
    variant === "orange"
      ? "text-[#FF6B35] bg-[#FFF0EB]"
      : variant === "navy"
      ? "text-[#172033] bg-[#F1F5F9]"
      : variant === "warning"
      ? "text-amber-600 bg-amber-50"
      : "text-[#172033] bg-[#F8FAFC]";

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          {label}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-[#172033]">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-medium text-[#94A3B8]">
            {subValue}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
          {trend.isPositive ? (
            <span className="flex items-center gap-0.5 text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {trend.value}
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-rose-500">
              <TrendingDown className="h-3.5 w-3.5" />
              {trend.value}
            </span>
          )}
          {trend.label && <span className="text-[#94A3B8] font-normal">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
