"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

type DialogOptions = { title?: string; confirmLabel?: string; danger?: boolean };
type PromptOptions = DialogOptions & { label?: string; minLength?: number; maxLength?: number };
type DialogRequest = { id: number; kind: "confirm" | "prompt"; message: string; options: PromptOptions;
  resolve: (value: boolean | string | null) => void; opener: HTMLElement | null };
type ActionDialogContext = {
  confirm: (message: string, options?: DialogOptions) => Promise<boolean>;
  prompt: (message: string, options?: PromptOptions) => Promise<string | null>;
};

const DialogContext = createContext<ActionDialogContext | null>(null);

export function ActionDialogProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<DialogRequest | null>(null);
  const [input, setInput] = useState("");
  const activeRef = useRef<DialogRequest | null>(null);
  const queueRef = useRef<DialogRequest[]>([]);
  const nextId = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const request = useCallback((kind: DialogRequest["kind"], message: string, options: PromptOptions) =>
    new Promise<boolean | string | null>((resolve) => {
      const item: DialogRequest = { id: ++nextId.current, kind, message, options, resolve,
        opener: typeof document === "undefined" ? null : document.activeElement as HTMLElement | null };
      if (activeRef.current) queueRef.current.push(item);
      else { activeRef.current = item; setActive(item); }
    }), []);

  const confirm = useCallback((message: string, options: DialogOptions = {}) =>
    request("confirm", message, options) as Promise<boolean>, [request]);
  const prompt = useCallback((message: string, options: PromptOptions = {}) =>
    request("prompt", message, options) as Promise<string | null>, [request]);

  const finish = useCallback((value: boolean | string | null) => {
    const current = activeRef.current;
    if (!current) return;
    const next = queueRef.current.shift() || null;
    activeRef.current = next;
    setActive(next);
    current.resolve(value);
    if (!next) requestAnimationFrame(() => current.opener?.focus());
  }, []);

  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    setInput("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => active.kind === "prompt" ? inputRef.current?.focus() : confirmRef.current?.focus());
    return () => { if (dialog.open) dialog.close(); document.body.style.overflow = previousOverflow; };
  }, [active]);

  return <DialogContext.Provider value={{ confirm, prompt }}>
    {children}
    {active && <dialog key={active.id} ref={dialogRef} aria-labelledby="action-dialog-title" aria-describedby="action-dialog-message"
      onCancel={event => { event.preventDefault(); finish(active.kind === "confirm" ? false : null); }}
      onClick={event => { if (event.target === dialogRef.current) finish(active.kind === "confirm" ? false : null); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[85dvh] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-0 text-[#172033] shadow-2xl backdrop:bg-[#0F172A]/60">
      <form onSubmit={event => { event.preventDefault(); finish(active.kind === "confirm" ? true : input.trim()); }} className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active.options.danger ? "bg-red-50 text-red-600" : "bg-[#FFF0EB] text-[#FF6B35]"}`}>
            {active.options.danger ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <button type="button" onClick={() => finish(active.kind === "confirm" ? false : null)} aria-label="Close dialog"
            className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-[#FF6B35]"><X size={18} /></button>
        </div>
        <h2 id="action-dialog-title" className="mt-4 text-lg font-extrabold">{active.options.title || (active.kind === "prompt" ? "Reason required" : "Confirm action")}</h2>
        <p id="action-dialog-message" className="mt-2 text-sm leading-relaxed text-[#64748B]">{active.message}</p>
        {active.kind === "prompt" && <label className="mt-5 block text-sm font-bold">{active.options.label || "Reason"}
          <textarea ref={inputRef} value={input} onChange={event => setInput(event.target.value)} required
            minLength={active.options.minLength ?? 3} maxLength={active.options.maxLength ?? 500} rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[#CBD5E1] bg-[#FFFDF9] px-3 py-2 text-sm font-normal focus:border-[#FF6B35] focus:outline-none" />
        </label>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => finish(active.kind === "confirm" ? false : null)}
            className="min-h-11 rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm font-bold hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#FF6B35]">Cancel</button>
          <button ref={confirmRef} type="submit" className={`min-h-11 rounded-xl px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] ${active.options.danger ? "bg-red-600 hover:bg-red-700" : "bg-[#FF6B35] hover:bg-[#E85D2A]"}`}>
            {active.options.confirmLabel || (active.kind === "prompt" ? "Continue" : "Confirm")}</button>
        </div>
      </form>
    </dialog>}
  </DialogContext.Provider>;
}

export function useActionDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useActionDialog must be used within ActionDialogProvider");
  return context;
}
