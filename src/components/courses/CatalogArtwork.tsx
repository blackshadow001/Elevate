import { BarChart3, BookOpen, Bot, BrainCircuit, BriefcaseBusiness, ChartNoAxesCombined, Code2, Coins, Cpu, Database, Flower2, Globe, Handshake, Heart, Laptop, Lightbulb, Megaphone, MessageCircle, MousePointer2, Paintbrush, Palette, PenTool, Settings2, Shapes, BadgeCheck, Sun, Target, Terminal, TrendingUp, Workflow, Zap } from "lucide-react";

const artwork = {
  "ai-generative-ai": { Icon: BrainCircuit, Accent: BadgeCheck, Detail: Cpu, from: "#1B2955", to: "#7658B8", glow: "#C7B7FF" },
  "ai-tools-automation": { Icon: Workflow, Accent: Zap, Detail: Settings2, from: "#164B72", to: "#2688A4", glow: "#8EE5EF" },
  "technology-programming": { Icon: Terminal, Accent: Code2, Detail: Database, from: "#173D5A", to: "#3974BE", glow: "#8EC6FF" },
  "digital-marketing": { Icon: Megaphone, Accent: BarChart3, Detail: MousePointer2, from: "#653A3E", to: "#D97848", glow: "#FFD0A4" },
  "business-entrepreneurship": { Icon: BriefcaseBusiness, Accent: Lightbulb, Detail: Target, from: "#184D47", to: "#48A584", glow: "#B8F0CE" },
  "sales-communication": { Icon: Handshake, Accent: MessageCircle, Detail: TrendingUp, from: "#5D335B", to: "#BE6797", glow: "#FFC3E2" },
  "finance-investment-basics": { Icon: Coins, Accent: ChartNoAxesCombined, Detail: BarChart3, from: "#284E55", to: "#4C9AAB", glow: "#A5E4EB" },
  "mindfulness-personal-development": { Icon: Flower2, Accent: Sun, Detail: Heart, from: "#43573A", to: "#91AA63", glow: "#E1F0AD" },
  "freelancing-online-income": { Icon: Laptop, Accent: Globe, Detail: PenTool, from: "#664340", to: "#C17A64", glow: "#FFD7B9" },
  "design-content-creation": { Icon: Palette, Accent: Paintbrush, Detail: Shapes, from: "#3F416E", to: "#A179C4", glow: "#DCC5FF" },
} as const;

export function CatalogArtwork({ categoryId, topicTitle, className = "" }: { categoryId: string; topicTitle?: string; className?: string }) {
  const visual = artwork[categoryId as keyof typeof artwork] ?? { Icon: BookOpen, Accent: BadgeCheck, Detail: Bot, from: "#24334F", to: "#64748B", glow: "#CFD8E5" };
  const Icon = visual.Icon;
  const Accent = visual.Accent;
  const Detail = visual.Detail;
  const headline = topicTitle?.replace(/^(What (?:is|are)|How to|Introduction to)\s+/i, "").replace(/[?]$/, "");
  return <div aria-hidden="true" className={`relative overflow-hidden ${className}`}
    style={{ background: `linear-gradient(125deg, ${visual.from}, ${visual.to})` }}>
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1.5px)", backgroundSize: "18px 18px" }} />
    <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full opacity-40 blur-3xl transition-transform duration-1000 ease-out group-hover:scale-110 motion-reduce:transition-none" style={{ backgroundColor: visual.glow }} />
    <div className="absolute -bottom-24 right-8 h-48 w-48 rounded-full border border-white/20 transition-transform duration-1000 ease-out group-hover:-translate-y-2 motion-reduce:transition-none" />
    <div className="absolute -bottom-16 right-14 h-36 w-36 rounded-full border border-white/20" />
    <div className="absolute left-5 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-2xl border border-white/40 bg-white/15 text-white shadow-lg backdrop-blur-sm transition-transform duration-700 ease-out group-hover:-translate-y-[54%] group-hover:rotate-[-3deg] motion-reduce:transition-none"><Icon className="h-8 w-8" strokeWidth={1.6} /></div>
    {headline ? <div className="absolute inset-y-0 right-5 flex max-w-[58%] items-center text-right text-lg font-black leading-tight text-white/95 drop-shadow-sm line-clamp-2 transition-transform duration-1000 ease-out group-hover:-translate-x-1 motion-reduce:transition-none">{headline}</div>
      : <div className="absolute right-9 top-1/2 grid h-[4.5rem] w-24 -translate-y-1/2 rotate-6 place-items-center rounded-2xl border border-white/35 bg-white/15 text-white shadow-xl backdrop-blur-sm transition-transform duration-1000 ease-out group-hover:-translate-y-[54%] group-hover:rotate-3 motion-reduce:transition-none">
        <Icon className="h-12 w-12" strokeWidth={1.35} />
        <span className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/40 bg-white/25 shadow-md"><Accent className="h-5 w-5" strokeWidth={1.7} /></span>
        <span className="absolute -bottom-3 -left-3 grid h-8 w-8 place-items-center rounded-lg border border-white/40 bg-white/20 shadow-md"><Detail className="h-4 w-4" strokeWidth={1.7} /></span>
      </div>}
  </div>;
}
