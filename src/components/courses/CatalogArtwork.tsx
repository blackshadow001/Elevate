import { BookOpen, BrainCircuit, BriefcaseBusiness, Code2, Heart, Megaphone, Palette, PenTool, TrendingUp, Workflow } from "lucide-react";

const artwork = {
  "ai-generative-ai": { Icon: BrainCircuit, from: "#1B2955", to: "#7658B8", glow: "#C7B7FF", code: "AI" },
  "ai-tools-automation": { Icon: Workflow, from: "#164B72", to: "#2688A4", glow: "#8EE5EF", code: "AT" },
  "technology-programming": { Icon: Code2, from: "#173D5A", to: "#3974BE", glow: "#8EC6FF", code: "TP" },
  "digital-marketing": { Icon: Megaphone, from: "#653A3E", to: "#D97848", glow: "#FFD0A4", code: "DM" },
  "business-entrepreneurship": { Icon: BriefcaseBusiness, from: "#184D47", to: "#48A584", glow: "#B8F0CE", code: "BE" },
  "sales-communication": { Icon: TrendingUp, from: "#5D335B", to: "#BE6797", glow: "#FFC3E2", code: "SC" },
  "finance-investment-basics": { Icon: BookOpen, from: "#284E55", to: "#4C9AAB", glow: "#A5E4EB", code: "FI" },
  "mindfulness-personal-development": { Icon: Heart, from: "#43573A", to: "#91AA63", glow: "#E1F0AD", code: "MP" },
  "freelancing-online-income": { Icon: PenTool, from: "#664340", to: "#C17A64", glow: "#FFD7B9", code: "FO" },
  "design-content-creation": { Icon: Palette, from: "#3F416E", to: "#A179C4", glow: "#DCC5FF", code: "DC" },
} as const;

export function CatalogArtwork({ categoryId, topicTitle, className = "" }: { categoryId: string; topicTitle?: string; className?: string }) {
  const visual = artwork[categoryId as keyof typeof artwork] ?? { Icon: BookOpen, from: "#24334F", to: "#64748B", glow: "#CFD8E5", code: "EL" };
  const Icon = visual.Icon;
  const headline = topicTitle?.replace(/^(What (?:is|are)|How to|Introduction to)\s+/i, "").replace(/[?]$/, "");
  return <div aria-hidden="true" className={`relative overflow-hidden ${className}`}
    style={{ background: `linear-gradient(125deg, ${visual.from}, ${visual.to})` }}>
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1.5px)", backgroundSize: "18px 18px" }} />
    <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full opacity-40 blur-3xl transition-transform duration-1000 ease-out group-hover:scale-110 motion-reduce:transition-none" style={{ backgroundColor: visual.glow }} />
    <div className="absolute -bottom-24 right-8 h-48 w-48 rounded-full border border-white/20 transition-transform duration-1000 ease-out group-hover:-translate-y-2 motion-reduce:transition-none" />
    <div className="absolute -bottom-16 right-14 h-36 w-36 rounded-full border border-white/20" />
    <div className="absolute inset-0 flex items-center justify-between px-6">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm transition-transform duration-700 ease-out group-hover:rotate-[-4deg] group-hover:scale-105 motion-reduce:transition-none"><Icon className="h-7 w-7" strokeWidth={1.65} /></span>
      {headline ? <span className="max-w-[58%] text-right text-lg font-black leading-tight text-white/95 drop-shadow-sm line-clamp-2 transition-transform duration-1000 ease-out group-hover:-translate-x-1 motion-reduce:transition-none">{headline}</span>
        : <span className="translate-x-4 select-none text-8xl font-black tracking-tighter text-white/10 transition-transform duration-1000 ease-out group-hover:translate-x-1 motion-reduce:transition-none">{visual.code}</span>}
    </div>
  </div>;
}
