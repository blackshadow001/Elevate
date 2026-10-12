"use client";

import React, { useState } from "react";
import { LivePoll } from "@/data/polls";
import { Plus, Trash2, Vote, Play, CheckCircle2, X } from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

interface PollCreatorProps {
  onLaunchPoll: (question: string, options: string[]) => void;
  activePoll?: LivePoll;
  onClose?: () => void;
}

export function PollCreator({ onLaunchPoll, activePoll, onClose }: PollCreatorProps) {
  const { notify } = useNotification();
  const [question, setQuestion] = useState("What is the correct React Server Action directive?");
  const [options, setOptions] = useState<string[]>([
    '"use server"',
    '"use client"',
    "serverAction()",
    "createAction()",
  ]);

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    const validOptions = options.filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) return;

    onLaunchPoll(question.trim(), validOptions);
    notify({
      type: "success",
      title: "Live Poll Broadcasted",
      message: "Learners can now vote live in real time.",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-5 space-y-4 max-w-md w-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B35] flex items-center justify-center">
            <Vote className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm text-[#172033]">
            {activePoll ? "Active Live Poll" : "Create Classroom Poll"}
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#172033] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {activePoll ? (
        /* Displaying Active Poll Results */
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              ● Poll Live ({activePoll.totalVotes} Votes Received)
            </span>
            <h4 className="font-bold text-sm text-[#172033] mt-1">{activePoll.question}</h4>
          </div>

          <div className="space-y-2.5">
            {activePoll.options.map((opt) => {
              const pct =
                activePoll.totalVotes > 0
                  ? Math.round((opt.votes / activePoll.totalVotes) * 100)
                  : 0;

              return (
                <div key={opt.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#172033]">{opt.text}</span>
                    <span className="font-bold text-[#64748B]">{pct}% ({opt.votes})</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B35] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Poll Creation Form */
        <form onSubmit={handleLaunch} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Question Prompt</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the correct React Server Action directive?"
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#172033]">Options (2 to 6)</label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-[11px] font-bold text-[#FF6B35] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-[11px] font-bold text-[#64748B]">{i + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#FF6B35]"
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="p-1.5 text-[#64748B] hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E85D2A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Poll to Room</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
