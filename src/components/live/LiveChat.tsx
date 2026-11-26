"use client";

import React, { useState, useRef, useEffect } from "react";
import { LiveChatMessage } from "@/data/chatMessages";
import { Send, Smile, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LiveChatProps {
  messages: LiveChatMessage[];
  onSendMessage: (text: string) => void;
}

export function LiveChat({ messages, onSendMessage }: LiveChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      {/* Chat Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 divide-y divide-[#F1F5F9]/50">
        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === user?.id || msg.senderName.includes(user?.name || "Alex");

          return (
            <div
              key={msg.id}
              className="pt-2 first:pt-0 animate-in fade-in slide-in-from-bottom-1 duration-200"
            >
              <div className="flex items-start gap-2.5">
                {msg.senderAvatar ? <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover border border-[#E5E7EB] mt-0.5 shrink-0"
                /> : <span aria-hidden="true" className="w-7 h-7 rounded-full bg-[#172033] text-white text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">
                  {msg.senderName.charAt(0).toUpperCase()}
                </span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-[#172033]">
                      {msg.senderName}
                    </span>

                    {msg.isInstructor && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-wider">
                        Instructor
                      </span>
                    )}

                    {msg.senderRole === "co-host" && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-wider">
                        Co-Host
                      </span>
                    )}

                    <span className="text-[10px] text-[#64748B] ml-auto">
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[#172033]/90 mt-1 leading-relaxed break-words">
                    {msg.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message to class..."
          className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:border-[#FF6B35] transition-all shadow-inner"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-[#FF6B35] disabled:opacity-40 hover:bg-[#E85D2A] text-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
          title="Send Message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
