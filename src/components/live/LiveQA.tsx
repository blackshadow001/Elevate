"use client";

import React, { useState } from "react";
import { LiveQuestion } from "@/data/chatMessages";
import { ThumbsUp, CheckCircle2, MessageCircleQuestion, Send, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LiveQAProps {
  questions: LiveQuestion[];
  onAskQuestion: (question: string) => void;
  onUpvoteQuestion: (id: string) => void;
}

export function LiveQA({ questions, onAskQuestion, onUpvoteQuestion }: LiveQAProps) {
  const [questionText, setQuestionText] = useState("");
  const { user } = useAuth();

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    onAskQuestion(questionText.trim());
    setQuestionText("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      {/* Questions list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {questions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748B]">
            <MessageCircleQuestion className="w-8 h-8 text-[#FF6B35] mb-2 opacity-80" />
            <p className="text-xs font-semibold">No questions asked yet.</p>
            <p className="text-[11px] text-[#64748B]">Be the first to ask a question to the instructor!</p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className={`p-3.5 rounded-xl border transition-all ${
                q.isAnswered
                  ? "bg-[#F8FAFC] border-[#E2E8F0]"
                  : "bg-white border-[#E5E7EB] hover:border-orange-200"
              }`}
            >
              {/* Question header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={q.authorAvatar}
                    alt={q.authorName}
                    className="w-6 h-6 rounded-full object-cover border border-[#E5E7EB]"
                  />
                  <span className="text-xs font-bold text-[#172033] truncate">
                    {q.authorName}
                  </span>
                  <span className="text-[10px] text-[#64748B]">{q.timestamp}</span>
                </div>

                {q.isAnswered ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Answered</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 shrink-0">
                    Pending
                  </span>
                )}
              </div>

              {/* Question text */}
              <p className="text-xs font-medium text-[#172033] leading-relaxed">
                {q.question}
              </p>

              {/* Answer text if answered */}
              {q.isAnswered && q.answerText && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                    <span>Instructor Answer ({q.answeredBy || "John Doe"})</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-900">
                    {q.answerText}
                  </p>
                </div>
              )}

              {/* Upvote button */}
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onUpvoteQuestion(q.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#FF6B35] hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{q.upvotes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ask Question Input */}
      <form onSubmit={handleAskSubmit} className="p-3 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center gap-2">
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Ask a question for the instructor..."
          className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:border-[#FF6B35] transition-all shadow-inner"
        />

        <button
          type="submit"
          disabled={!questionText.trim()}
          className="px-3 py-2 rounded-xl bg-[#172033] hover:bg-[#26344D] disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <span>Ask</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
