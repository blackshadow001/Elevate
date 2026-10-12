"use client";

import React from "react";
import { Participant } from "@/data/participants";
import { Users, Hand, Mic, MicOff, Video, VideoOff, Wifi, Pin } from "lucide-react";

interface ParticipantPanelProps {
  participants: Participant[];
}

export function ParticipantPanel({ participants }: ParticipantPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden p-4">
      <div className="pb-3 border-b border-[#F1F5F9] flex items-center justify-between">
        <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#FF6B35]" />
          <span>Learners in Room ({participants.length})</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pt-3">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={p.avatar}
                alt={p.name}
                className="w-7 h-7 rounded-full object-cover border border-[#E5E7EB]"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#172033] flex items-center gap-1.5 truncate">
                  <span>{p.name}</span>
                  {p.role === "co-host" && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[9px] font-black uppercase">
                      Co-Host
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <span>{p.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {p.isHandRaised && (
                <span className="p-1 rounded-md bg-orange-100 text-[#FF6B35]" title="Hand Raised">
                  <Hand className="w-3.5 h-3.5 animate-bounce" />
                </span>
              )}
              {p.isAudioMuted ? (
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
