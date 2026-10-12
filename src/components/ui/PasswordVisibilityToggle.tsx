"use client";

import { Eye, EyeOff } from "lucide-react";

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
  inputId: string;
  label?: string;
}

export function PasswordVisibilityToggle({ visible, onToggle, inputId, label = "password" }: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${visible ? "Hide" : "Show"} ${label}`}
      aria-controls={inputId}
      aria-pressed={visible}
      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[#64748B] hover:text-[#172033] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
    >
      {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
      {visible ? "Hide" : "Show"}
    </button>
  );
}
