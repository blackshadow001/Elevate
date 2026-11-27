"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Search, CheckCheck } from "lucide-react";

export default function InstructorMessagesPage() {
  const [conversations] = useState([
    { id: "c1", name: "Alex Johnson", lastMsg: "Thank you for reviewing my pull request!", time: "10:14 AM", unread: 0 },
    { id: "c2", name: "Sneha Mukherjee", lastMsg: "Can we cover dark mode tokens next class?", time: "Yesterday", unread: 1 },
    { id: "c3", name: "Rohan Verma", lastMsg: "Had a quick question regarding PostgreSQL indexing.", time: "Oct 6", unread: 0 },
  ]);

  const [activeConv, setActiveConv] = useState("c1");
  const [messages, setMessages] = useState([
    { from: "Alex Johnson", text: "Hi John, I followed the React Server Actions lecture and loved the database form validation!", time: "10:10 AM" },
    { from: "John Doe (You)", text: "Glad you enjoyed it Alex! Make sure to also check the optimistic mutations repo.", time: "10:12 AM" },
    { from: "Alex Johnson", text: "Thank you for reviewing my pull request!", time: "10:14 AM" },
  ]);
  const [replyText, setReplyText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setMessages((prev) => [...prev, { from: "John Doe (You)", text: replyText.trim(), time: "Just now" }]);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Student Q&A Messages
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Direct messaging and mentorship conversations with your enrolled students.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs grid grid-cols-1 md:grid-cols-12 h-[600px] overflow-hidden">
        {/* Left 4 Cols: Conversation list */}
        <div className="md:col-span-4 border-r border-[#E5E7EB] flex flex-col">
          <div className="p-4 border-b border-[#E5E7EB]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F7F8FA]">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveConv(c.id)}
                className={`w-full text-left p-4 transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                  activeConv === c.id ? "bg-orange-50/60" : "hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#172033]">{c.name}</div>
                  <div className="text-[11px] text-[#64748B] truncate mt-0.5">{c.lastMsg}</div>
                </div>
                <div className="text-[10px] text-[#94A3B8] shrink-0">{c.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 8 Cols: Thread View */}
        <div className="md:col-span-8 flex flex-col justify-between h-full bg-[#FAFBFD]">
          <div className="p-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
            <div className="font-bold text-sm text-[#172033]">Alex Johnson</div>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Enrolled in Full Stack Web Dev
            </span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-3">
            {messages.map((m, i) => {
              const isMe = m.from.includes("You");
              return (
                <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? "bg-[#172033] text-white rounded-br-xs"
                        : "bg-white text-[#172033] border border-[#E5E7EB] rounded-bl-xs shadow-2xs"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] mt-1 px-1">{m.time}</span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#E5E7EB] flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response to student..."
              className="flex-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:bg-white focus:outline-none focus:border-[#FF6B35]"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              aria-label="Send reply"
              className="p-3 bg-[#FF6B35] hover:bg-[#E85D2A] text-white rounded-xl shadow-xs cursor-pointer transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
