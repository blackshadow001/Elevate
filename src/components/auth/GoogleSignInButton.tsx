type Props = { intent?: "login" | "link"; label?: string };

export function GoogleSignInButton({ intent = "login", label = "Continue with Google" }: Props) {
  return <a href={`/api/auth/google/start${intent === "link" ? "?intent=link" : ""}`}
    className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#D5DCE5] bg-white px-4 py-3 text-sm font-bold text-[#172033] transition-colors hover:bg-[#F7F8FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]">
    <span aria-hidden="true" className="text-lg font-extrabold leading-none"><span className="text-[#4285F4]">G</span></span>
    {label}
  </a>;
}
