"use client";

import React, { useState } from "react";
import { LivePoll } from "@/data/polls";
import { BarChart2, CheckCircle2, Vote, X } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

interface PollProps {
  poll: LivePoll;
  onVote: (pollId: string, optionId: string) => void;
  onClose?: () => void;
  isInstructor?: boolean;
}

export function Poll({ poll, onVote, onClose, isInstructor = false }: PollProps) {
  const { notify } = useNotification();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    poll.userVotedOptionId || null
  );
  const [hasVoted, setHasVoted] = useState(!!poll.userVotedOptionId || isInstructor);

  const handleSubmitVote = () => {
    if (!selectedOptionId) return;
    onVote(poll.id, selectedOptionId);
    setHasVoted(true);
    notify({
      type: "success",
      title: "Vote Recorded",
      message: "Your answer is shown in this demo poll. Live voting requires real-time integration.",
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#FF6B35]/40 shadow-2xl p-5 space-y-4 max-w-md w-full animate-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-[#FF6B35] flex items-center gap-1.5">
            <Vote className="w-3.5 h-3.5" />
            <span>Live Poll</span>
          </span>
          <span className="text-[10px] text-[#64748B] font-semibold">
            ({poll.totalVotes} responses)
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close live poll"
            className="text-[#64748B] hover:text-[#172033] p-1 rounded-md text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question */}
      <h4 className="font-extrabold text-sm sm:text-base text-[#172033] leading-snug">
        {poll.question}
      </h4>

      {/* Options */}
      <div className="space-y-2.5 pt-1">
        {poll.options.map((option) => {
          const percent =
            poll.totalVotes > 0
              ? Math.round((option.votes / poll.totalVotes) * 100)
              : 0;

          if (hasVoted || isInstructor) {
            // Results mode with smooth progress bars
            const isUserChoice = poll.userVotedOptionId === option.id;

            return (
              <div key={option.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className={`flex items-center gap-1.5 ${isUserChoice ? "font-bold text-[#FF6B35]" : "text-[#172033]"}`}>
                    {isUserChoice && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B35]" />}
                    <span>{option.text}</span>
                  </span>
                  <span className="font-bold text-[#64748B]">{percent}% ({option.votes})</span>
                </div>
                <div className="h-2.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isUserChoice ? "bg-[#FF6B35]" : "bg-[#172033]/70"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          }

          // Voting mode
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedOptionId === option.id
                  ? "bg-orange-50 border-[#FF6B35] text-[#172033] font-semibold"
                  : "bg-[#F8FAFC] border-[#E5E7EB] hover:bg-slate-100 text-[#172033]"
              }`}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => setSelectedOptionId(option.id)}
                className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <span className="text-xs">{option.text}</span>
            </label>
          );
        })}
      </div>

      {/* Action Footer */}
      {!hasVoted && !isInstructor && (
        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedOptionId}
            onClick={handleSubmitVote}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}
