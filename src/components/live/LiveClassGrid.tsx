"use client";

import React from "react";
import { LiveClass } from "@/data/liveClasses";
import { LiveClassCard } from "./LiveClassCard";

interface LiveClassGridProps {
  classes: LiveClass[];
  className?: string;
}

export function LiveClassGrid({ classes, className = "" }: LiveClassGridProps) {
  if (classes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-[#E5E7EB] p-8">
        <p className="text-sm font-semibold text-[#64748B]">No live classes match your selection.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {classes.map((item) => (
        <LiveClassCard key={item.id} liveClass={item} />
      ))}
    </div>
  );
}
