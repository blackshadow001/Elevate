"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface CodeBlockProps {
  language: string;
  filename?: string;
  snippet: string;
  output?: string;
}

export function CodeBlock({
  language,
  filename,
  snippet,
  output,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0B1120] text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#111827] px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center rounded-md bg-[#FF6B35]/15 px-2 py-0.5 font-mono font-bold uppercase tracking-wider text-[#FF8A5B]">
            {language}
          </span>
          {filename && (
            <span className="truncate font-mono text-slate-400">{filename}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied code snippet" : "Copy code snippet"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed font-mono text-slate-100">
        <code>{snippet}</code>
      </pre>

      {output && (
        <div className="border-t border-white/10 bg-[#070B14] px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Output</span>
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-200">
            <code>{output}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
