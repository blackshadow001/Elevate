"use client";

import React, { useState } from "react";
import { Participant } from "@/data/participants";
import { 
  Users, 
  Hand, 
  MicOff, 
  UserX, 
  Pin, 
  ShieldCheck, 
  Search, 
  VolumeX,
  Check
} from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

interface ParticipantManagerProps {
  participants: Participant[];
  onMuteParticipant: (id: string) => void;
  onRemoveParticipant: (id: string) => void;
  onPinParticipant: (id: string) => void;
  onClose?: () => void;
}

export function ParticipantManager({
  participants,
  onMuteParticipant,
  onRemoveParticipant,
  onPinParticipant,
  onClose,
}: ParticipantManagerProps) {
  const { notify } = useNotification();
  const [search, setSearch] = useState("");
  const [activeParticipants, setActiveParticipants] = useState(participants);

  const filtered = activeParticipants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMuteAll = () => {
    setActiveParticipants((prev) =>
      prev.map((p) => ({ ...p, isAudioMuted: true }))
    );
    notify({
      type: "info",
      title: "Muted All Learners",
      message: "All learner microphones are now muted.",
    });
  };

  const handleMuteOne = (p: Participant) => {
    onMuteParticipant(p.id);
    setActiveParticipants((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, isAudioMuted: true } : item))
    );
    notify({
      type: "info",
      title: "Participant Muted",
      message: `${p.name} has been muted.`,
    });
  };

  const handleRemoveOne = (p: Participant) => {
    onRemoveParticipant(p.id);
    setActiveParticipants((prev) => prev.filter((item) => item.id !== p.id));
    notify({
      type: "warning",
      title: "Participant Removed",
      message: `${p.name} was removed from the session.`,
    });
  };

  const handleMakeCoHost = (p: Participant) => {
    setActiveParticipants((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, role: item.role === "co-host" ? "learner" : "co-host" } : item
      )
    );
    notify({
      type: "success",
      title: "Role Updated",
      message: `${p.name} is now a session Co-Host.`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#F1F5F9] space-y-3 bg-[#F8FAFC]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF6B35]" />
            <h3 className="font-extrabold text-sm text-[#172033]">
              Participants ({activeParticipants.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={handleMuteAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute All</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learners by name..."
            className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:border-[#FF6B35]"
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-[#F1F5F9]">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="pt-2 first:pt-0 flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={p.avatar}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#172033] flex items-center gap-1.5 truncate">
                  <span className="truncate">{p.name}</span>
                  {p.role === "co-host" && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-black uppercase">
                      Co-Host
                    </span>
                  )}
                </div>

                <div className="text-[10px] flex items-center gap-2 pt-0.5">
                  <span
                    className={
                      p.status === "Connected"
                        ? "text-emerald-600 font-medium"
                        : "text-amber-600 font-medium"
                    }
                  >
                    ● {p.status}
                  </span>
                  {p.isHandRaised && (
                    <span className="font-extrabold text-[#FF6B35] flex items-center gap-0.5">
                      <Hand className="w-3 h-3 animate-bounce" />
                      Hand raised
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons (Requirement 18: Mute, Remove, Pin, Make Co-host) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleMuteOne(p)}
                disabled={p.isAudioMuted}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  p.isAudioMuted
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-[#64748B] hover:text-red-600 hover:bg-rose-50"
                }`}
                title={p.isAudioMuted ? "Already Muted" : "Mute Participant"}
              >
                <MicOff className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleMakeCoHost(p)}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  p.role === "co-host"
                    ? "text-purple-600 bg-purple-50"
                    : "text-[#64748B] hover:text-purple-600 hover:bg-purple-50"
                }`}
                title="Toggle Co-Host"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onPinParticipant(p.id)}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  p.isPinned
                    ? "text-blue-600 bg-blue-50"
                    : "text-[#64748B] hover:text-blue-600 hover:bg-blue-50"
                }`}
                title="Pin Video"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleRemoveOne(p)}
                className="p-1.5 rounded-lg text-xs text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove Participant"
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
