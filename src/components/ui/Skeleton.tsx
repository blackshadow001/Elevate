"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/50",
        className
      )}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-0 overflow-hidden shadow-xs flex flex-col h-full animate-pulse">
      <div className="aspect-video w-full bg-slate-200" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-24 mt-2" />
        </div>
        <div className="pt-4 border-t border-[#E5E7EB] flex justify-between items-center">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
