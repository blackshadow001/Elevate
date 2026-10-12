"use client";

import React, { useState } from "react";
import { Monitor, Check, X, Laptop, Layers, Globe, AppWindow } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmShare: (sourceName: string) => void;
}

export function ScreenShareModal({ isOpen, onClose, onConfirmShare }: ScreenShareModalProps) {
  const { notify } = useNotification();
  const [selectedSource, setSelectedSource] = useState<"entire" | "window" | "tab">("entire");

  if (!isOpen) return null;

  const sources = [
    {
      id: "entire" as const,
      label: "Entire Screen (Screen 1 - 4K Display)",
      icon: Laptop,
      desc: "Share your full primary desktop workspace",
    },
    {
      id: "window" as const,
      label: "VS Code / IDE Window",
      icon: AppWindow,
      desc: "Only stream current Visual Studio Code application",
    },
    {
      id: "tab" as const,
      label: "Browser Tab — React 19 Docs",
      icon: Globe,
      desc: "Only stream active browser documentation tab",
    },
  ];

  const handleStartSharing = () => {
    const chosen = sources.find((s) => s.id === selectedSource)?.label || "Entire Screen";
    onConfirmShare(chosen);
    notify({
      type: "success",
      title: "Screen Sharing Active",
      message: `Broadcasting ${chosen} to 143 learners.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#172033]">Share Your Screen</h3>
              <p className="text-[11px] text-[#64748B]">Choose what you want to broadcast to students</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source options */}
        <div className="space-y-2.5">
          {sources.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedSource === s.id;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedSource(s.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? "border-[#FF6B35] bg-orange-50/60 shadow-xs"
                    : "border-[#E5E7EB] hover:bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#FF6B35] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#172033] flex items-center justify-between">
                    <span>{s.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#FF6B35]" />}
                  </div>
                  <div className="text-[11px] text-[#64748B] pt-0.5">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartSharing}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B35] hover:bg-[#E85D2A] text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Start Sharing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
