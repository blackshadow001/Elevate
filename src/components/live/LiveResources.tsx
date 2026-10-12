"use client";

import React from "react";
import { LiveResource } from "@/data/liveResources";
import { FileText, FolderGit2, BookOpen, Archive, ExternalLink, Download } from "lucide-react";

interface LiveResourcesProps {
  resources: LiveResource[];
}

export function LiveResources({ resources }: LiveResourcesProps) {
  const getIcon = (type: LiveResource["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-rose-500" />;
      case "github":
        return <FolderGit2 className="w-4 h-4 text-purple-600" />;
      case "docs":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "zip":
        return <Archive className="w-4 h-4 text-amber-500" />;
      default:
        return <ExternalLink className="w-4 h-4 text-[#FF6B35]" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E7EB] p-4 overflow-y-auto space-y-3">
      <div className="pb-2 border-b border-[#F1F5F9]">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
          Class Materials & Source Code ({resources.length})
        </h4>
      </div>

      <div className="space-y-2.5">
        {resources.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-[#E5E7EB] hover:border-slate-300 bg-[#F8FAFC] hover:bg-white transition-all space-y-2 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 shadow-xs">
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors leading-snug">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#64748B] flex items-center gap-1.5 pt-0.5">
                    <span>{item.size}</span>
                    <span>•</span>
                    <span>{item.addedAt}</span>
                  </div>
                </div>
              </div>

              {item.url ? <a href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined} download={!item.url.startsWith("http") || undefined} className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-200/60 transition-colors shrink-0" aria-label={`Open ${item.title}`}>
                {item.url.startsWith("http") ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              </a> : <span className="text-[10px] font-semibold text-[#64748B]">Pending</span>}
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
