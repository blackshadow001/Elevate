"use client";

import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  RotateCcw,
  Send,
  BadgeCheck,
  X,
} from "lucide-react";
import type { ChatCard } from "@/app/api/chat/route";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: ChatCard[];
  followUps?: string[];
}

const STORAGE_KEY = "elevate_chatbot_history_v1";

const SAFE_ROUTE_REGEX =
  /^\/(?:dashboard|profile|contact|faq|courses(?:\/[A-Za-z0-9\-_%]+)?|personal-plan(?:\/[A-Za-z0-9\-_]+)?|practice(?:\/[A-Za-z0-9\-_]+)?|blog(?:\/[A-Za-z0-9\-_#]+)?|certificates(?:\/verify(?:\/[A-Za-z0-9\-_]+)?)?|instructor\/apply|live(?:\/[A-Za-z0-9\-_/]+)?)$/;

const INLINE_TOKEN_REGEX =
  /(\[[^\]\n]+\]\(\/[A-Za-z0-9\-_/#%?=&.]+\)|`[^`\n]+`|\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|support@elevate\.courses|(?<![A-Za-z0-9])\/(?:dashboard|profile|contact|faq|courses(?:\/[A-Za-z0-9\-_%]+)?|personal-plan(?:\/account|\/checkout)?|practice(?:\/[A-Za-z0-9\-_]+)?|blog(?:\/[A-Za-z0-9\-_#]+)?|certificates(?:\/verify)?|instructor\/apply)(?![A-Za-z0-9\-_/]))/g;

function renderInlineTokens(
  text: string,
  keyPrefix: string,
  onNavigate: () => void
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  INLINE_TOKEN_REGEX.lastIndex = 0;

  while ((match = INLINE_TOKEN_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const tokenKey = `${keyPrefix}-${match.index}`;

    if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]\n]+)\]\((\/[^)\s]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        nodes.push(
          <Link
            key={tokenKey}
            href={href}
            onClick={onNavigate}
            className="font-semibold text-[#5B21FF] underline decoration-[#5B21FF]/40 underline-offset-2 hover:text-[#4314B8]"
          >
            {label}
          </Link>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={tokenKey}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-[#334155]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={tokenKey} className="font-semibold text-[#172033]">
          {renderInlineTokens(token.slice(2, -2), `${tokenKey}-b`, onNavigate)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={tokenKey} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token === "support@elevate.courses") {
      nodes.push(
        <a
          key={tokenKey}
          href="mailto:support@elevate.courses"
          className="font-semibold text-[#5B21FF] underline decoration-[#5B21FF]/40 underline-offset-2 hover:text-[#4314B8]"
        >
          {token}
        </a>
      );
    } else if (SAFE_ROUTE_REGEX.test(token)) {
      nodes.push(
        <Link
          key={tokenKey}
          href={token}
          onClick={onNavigate}
          className="font-semibold text-[#5B21FF] underline decoration-[#5B21FF]/40 underline-offset-2 hover:text-[#4314B8]"
        >
          {token}
        </Link>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTextBlocks(
  segment: string,
  segKey: string,
  onNavigate: () => void
): ReactNode[] {
  const lines = segment.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    // Markdown table block
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      /^\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1].trim())
    ) {
      const headers = parseTableRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div
          key={`${segKey}-tbl-${i}`}
          className="my-2 overflow-x-auto rounded-xl border border-[#E2E8F0]"
        >
          <table className="w-full border-collapse text-left text-[12px]">
            <thead className="bg-slate-50 text-[#172033]">
              <tr>
                {headers.map((h, idx) => (
                  <th
                    key={`${segKey}-th-${idx}`}
                    scope="col"
                    className="border-b border-[#E2E8F0] px-2.5 py-1.5 font-bold"
                  >
                    {renderInlineTokens(h, `${segKey}-th-${idx}`, onNavigate)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {rows.map((row, rIdx) => (
                <tr key={`${segKey}-tr-${rIdx}`}>
                  {headers.map((_, cIdx) => (
                    <td
                      key={`${segKey}-td-${rIdx}-${cIdx}`}
                      className="px-2.5 py-1.5 align-top text-[#334155]"
                    >
                      {renderInlineTokens(
                        row[cIdx] || "",
                        `${segKey}-td-${rIdx}-${cIdx}`,
                        onNavigate
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Markdown heading
    const headingMatch = /^#{1,4}\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      blocks.push(
        <h3
          key={`${segKey}-h-${i}`}
          className="pt-1 text-[13.5px] font-bold leading-snug text-[#172033]"
        >
          {renderInlineTokens(headingMatch[1], `${segKey}-h-${i}`, onNavigate)}
        </h3>
      );
      i += 1;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      const startLine = i;
      while (i < lines.length) {
        const cur = lines[i].trim();
        const itemMatch = /^\d+\.\s+(.+)$/.exec(cur);
        if (itemMatch) {
          items.push(itemMatch[1]);
          i += 1;
        } else if (
          cur &&
          items.length > 0 &&
          !cur.startsWith("#") &&
          !/^[-*•]\s+/.test(cur) &&
          !cur.startsWith("|")
        ) {
          items[items.length - 1] = `${items[items.length - 1]} ${cur}`;
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(
        <ol
          key={`${segKey}-ol-${startLine}`}
          className="my-1.5 list-decimal space-y-1.5 pl-4.5 text-[13.5px] leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={`${segKey}-oli-${startLine}-${idx}`}>
              {renderInlineTokens(
                item,
                `${segKey}-oli-${startLine}-${idx}`,
                onNavigate
              )}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      const startLine = i;
      while (i < lines.length) {
        const cur = lines[i].trim();
        const itemMatch = /^[-*•]\s+(.+)$/.exec(cur);
        if (itemMatch) {
          items.push(itemMatch[1]);
          i += 1;
        } else if (
          cur &&
          items.length > 0 &&
          !cur.startsWith("#") &&
          !/^\d+\.\s+/.test(cur) &&
          !cur.startsWith("|")
        ) {
          items[items.length - 1] = `${items[items.length - 1]} ${cur}`;
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(
        <ul
          key={`${segKey}-ul-${startLine}`}
          className="my-1.5 list-disc space-y-1 pl-4.5 text-[13.5px] leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={`${segKey}-uli-${startLine}-${idx}`}>
              {renderInlineTokens(
                item,
                `${segKey}-uli-${startLine}-${idx}`,
                onNavigate
              )}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Standard paragraph
    const paraLines: string[] = [];
    const startLine = i;
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (
        !cur ||
        /^#{1,4}\s+/.test(cur) ||
        /^\d+\.\s+/.test(cur) ||
        /^[-*•]\s+/.test(cur) ||
        cur.startsWith("|")
      ) {
        break;
      }
      paraLines.push(cur);
      i += 1;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={`${segKey}-p-${startLine}`} className="leading-relaxed">
          {renderInlineTokens(
            paraLines.join(" "),
            `${segKey}-p-${startLine}`,
            onNavigate
          )}
        </p>
      );
    }
  }

  return blocks;
}

function FormattedMessageContent({
  text,
  onNavigate,
}: {
  text: string;
  onNavigate: () => void;
}) {
  const parts: ReactNode[] = [];
  const codeBlockRegex = /```([A-Za-z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      parts.push(
        <Fragment key={`seg-${lastIndex}`}>
          {renderTextBlocks(before, `seg-${lastIndex}`, onNavigate)}
        </Fragment>
      );
    }
    const lang = match[1];
    const code = match[2].replace(/\n$/, "");
    parts.push(
      <div
        key={`code-${match.index}`}
        className="my-2 overflow-hidden rounded-xl border border-slate-800/40 bg-[#0F172A] text-slate-100"
      >
        {lang && (
          <div className="border-b border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            {lang}
          </div>
        )}
        <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[12px] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <Fragment key={`seg-${lastIndex}`}>
        {renderTextBlocks(text.slice(lastIndex), `seg-${lastIndex}`, onNavigate)}
      </Fragment>
    );
  }

  return <div className="space-y-2">{parts}</div>;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm Elevate Assistant. Ask me to find courses, practice arenas, Python/SQL interview guides, Personal Plan pricing, or account help.",
  followUps: [
    "Recommend top courses",
    "Python interview prep",
    "Tell me about Personal Plan",
    "Open free practice labs",
  ],
};

export function ElevateChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore conversation across page navigation
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore storage failures safely
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-20))
      );
    } catch {
      // Ignore quota errors
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Hide inside distraction-free video lesson room
  if (pathname?.startsWith("/learn/")) {
    return null;
  }

  async function sendMessage(textToSend: string) {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });
      const json = await response.json();
      if (!response.ok || !json?.data) {
        throw new Error(json?.error?.message || "Could not process message.");
      }
      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: json.data.reply,
        cards: json.data.cards,
        followUps: json.data.followUps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again or visit our Contact page.",
          followUps: ["Browse courses", "Contact support"],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleReset() {
    setMessages([INITIAL_MESSAGE]);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* Interactive Assistant Panel */}
      {isOpen && (
        <section
          role="dialog"
          aria-labelledby="elevate-chat-title"
          className="flex w-[calc(100vw-2rem)] sm:w-[400px] h-[min(78vh,600px)] flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-[#FFFDF9] shadow-[0_24px_64px_rgba(23,32,51,0.22)]"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#172033] px-5 py-3.5 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5B21FF] text-white shadow-xs">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2
                    id="elevate-chat-title"
                    className="truncate text-sm font-extrabold tracking-tight"
                  >
                    Elevate Assistant
                  </h2>
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-400"
                    title="Online"
                  />
                </div>
                <p className="truncate text-[11px] text-slate-300">
                  Courses · Practice Labs · Interview Guides
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset conversation"
                title="New conversation"
                className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat assistant"
                className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Messages Scroll Area */}
          <div
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Chat messages"
            className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                } space-y-2.5`}
              >
                <div
                  className={`max-w-[90%] break-words rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-2xs ${
                    msg.role === "user"
                      ? "whitespace-pre-wrap rounded-br-sm bg-[#5B21FF] font-medium text-white"
                      : "rounded-bl-sm border border-[#E2E8F0] bg-white text-[#172033]"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <FormattedMessageContent
                      text={msg.text}
                      onNavigate={() => setIsOpen(false)}
                    />
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Clickable Recommendation Cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="w-full space-y-2 pr-1">
                    {msg.cards.map((card) => (
                      <Link
                        key={`${msg.id}-${card.href}-${card.title}`}
                        href={card.href}
                        onClick={() => setIsOpen(false)}
                        className="group block rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-2xs transition-all hover:border-[#5B21FF]/50 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-block rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5B21FF]">
                            {card.badge}
                          </span>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#5B21FF]"
                            aria-hidden="true"
                          />
                        </div>
                        <h3 className="mt-1.5 text-xs font-extrabold leading-snug text-[#172033] group-hover:text-[#5B21FF]">
                          {card.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#64748B]">
                          {card.subtitle}
                        </p>
                        <p className="mt-1.5 text-[11px] font-bold text-[#FF6B35]">
                          {card.meta}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Follow-Up Quick Prompt Chips */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {msg.followUps.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        className="rounded-full border border-[#CBD5E1] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[#172033] transition-colors hover:border-[#5B21FF] hover:bg-violet-50 hover:text-[#5B21FF]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[#E2E8F0] bg-white px-4 py-3 text-xs font-medium text-[#64748B] w-fit">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5B21FF]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5B21FF] [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5B21FF] [animation-delay:0.3s]" />
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Composer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="shrink-0 border-t border-[#E2E8F0] bg-white px-3.5 py-3"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-[#CBD5E1] bg-[#FFFDF9] px-3.5 py-1.5 transition-all focus-within:border-[#5B21FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B21FF]/20">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses, Python, SQL, pricing..."
                aria-label="Message Elevate Assistant"
                maxLength={500}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-[13.5px] leading-5 text-[#172033] placeholder:text-[#94A3B8] outline-none focus:outline-none focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                aria-label="Send message"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5B21FF] text-white transition-colors hover:bg-[#4A18D9] disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Floating Circular Launcher (matching the vibrant violet chat bubble aesthetic) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Elevate chat assistant" : "Open Elevate chat assistant"}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#5B21FF] text-white shadow-[0_12px_30px_rgba(91,33,255,0.42)] transition-all duration-200 hover:scale-105 hover:bg-[#4B19D6] active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#FF6B35]"
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <svg
            viewBox="0 0 28 28"
            className="h-7 w-7 fill-none stroke-current"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6.5 7.5h15a2.5 2.5 0 0 1 2.5 2.5v8.5a2.5 2.5 0 0 1-2.5 2.5H13l-4.5 3v-3H6.5A2.5 2.5 0 0 1 4 18.5V10a2.5 2.5 0 0 1 2.5-2.5z" />
            <line x1="9" y1="12.5" x2="19" y2="12.5" />
            <line x1="9" y1="16" x2="15" y2="16" />
          </svg>
        )}
      </button>
    </div>
  );
}
