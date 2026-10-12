export interface LiveEvent {
  id: string;
  slug: string;
  title: string;
  speaker: string;
  speakerRole: string;
  speakerCompany: string;
  speakerAvatar: string;
  date: string;
  time: string;
  duration: number; // minutes
  description: string;
  detailedAgenda: string[];
  registeredCount: number;
  isPaid: boolean;
  price?: number;
  currency?: string;
  category: "workshop" | "masterclass" | "qa" | "hackathon" | "industry";
  tags: string[];
  coverImage: string;
  isRegistered?: boolean;
}

export const mockEvents: LiveEvent[] = [
  {
    id: "event-1",
    slug: "ai-engineering-masterclass",
    title: "AI Engineering Masterclass: Production Agentic Workflows",
    speaker: "Priya Sundaram",
    speakerRole: "Lead AI Researcher & ML Consultant",
    speakerCompany: "Elevate AI Labs",
    speakerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    date: "Sunday, Oct 11, 2026",
    time: "6:00 PM IST",
    duration: 120,
    description: "Deep dive into state machines, LangGraph, tool calling verification, and latency optimizations when deploying multi-agent generative systems to enterprise scale.",
    detailedAgenda: [
      "Why standard prompt chains fail in production environments",
      "Designing stateful multi-agent graphs with cyclic topologies",
      "Human-in-the-loop validation patterns and fallback routers",
      "Benchmarking response latency and token costs with real telemetry",
    ],
    registeredCount: 840,
    isPaid: false,
    category: "masterclass",
    tags: ["Generative AI", "LangGraph", "Agents", "Python"],
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
    isRegistered: true,
  },
  {
    id: "event-2",
    slug: "career-qa-staff-engineers",
    title: "Career Q&A: Cracking Senior & Staff Engineering Interviews",
    speaker: "John Doe & Guests",
    speakerRole: "Senior Software Architect & Hiring Manager",
    speakerCompany: "Global Tech Advisory",
    speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    date: "Monday, Oct 12, 2026",
    time: "5:00 PM IST",
    duration: 90,
    description: "Open floor Q&A on navigating senior engineering promotions, negotiating compensation packages, system design interviews, and standout portfolio projects.",
    detailedAgenda: [
      "What hiring committees actually look for in candidate evaluations",
      "How to frame technical trade-offs during live system design rounds",
      "Demonstrating organizational business impact beyond pure code commits",
      "Live audience AMA & resume breakdown session",
    ],
    registeredCount: 1200,
    isPaid: false,
    category: "qa",
    tags: ["Career", "Interviews", "System Design", "Mentorship"],
    coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000",
    isRegistered: false,
  },
  {
    id: "event-3",
    slug: "frontend-architecture-workshop",
    title: "Frontend Architecture Workshop: Micro-Frontends & Monorepos",
    speaker: "Ananya Sharma",
    speakerRole: "Head of Product Design & Frontend Guild Lead",
    speakerCompany: "FinTech Scaleup",
    speakerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    date: "Tuesday, Oct 13, 2026",
    time: "7:00 PM IST",
    duration: 105,
    description: "Hands-on architectural teardown of large-scale Next.js monorepos, module federation, design token propagation, and sub-second CI/CD pipelines.",
    detailedAgenda: [
      "Module federation vs Turborepo package sharing trade-offs",
      "Isolating independent deployment blast radiuses",
      "Enforcing strict ESLint boundaries and zero circular dependencies",
      "Measuring Core Web Vitals across federated page fragments",
    ],
    registeredCount: 620,
    isPaid: false,
    category: "workshop",
    tags: ["Architecture", "Next.js", "Monorepos", "Design Systems"],
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000",
    isRegistered: false,
  },
  {
    id: "event-4",
    slug: "react-19-hackathon",
    title: "48-Hour Hackathon: Build the Future with React 19 & AI",
    speaker: "Elevate Community Team",
    speakerRole: "Developer Relations & Judges",
    speakerCompany: "Elevate Platform",
    speakerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    date: "Oct 16 – Oct 18, 2026",
    time: "Kickoff 6:00 PM IST",
    duration: 2880,
    description: "Team up or build solo to create next-generation web applications using React 19, Next.js App Router, and AI APIs. ₹1,50,000 prize pool and 1-on-1 mentor reviews.",
    detailedAgenda: [
      "Friday 6 PM: Theme reveal and keynote kickoff",
      "Saturday 2 PM: Midpoint mentor office hours & live code reviews",
      "Sunday 4 PM: Submission deadline and demo showcases",
      "Sunday 7 PM: Winner announcements and awards ceremony",
    ],
    registeredCount: 1540,
    isPaid: false,
    category: "hackathon",
    tags: ["Hackathon", "React 19", "AI", "Prizes"],
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000",
    isRegistered: false,
  },
  {
    id: "event-5",
    slug: "industry-expert-microservices",
    title: "Industry Expert Session: Resilient Microservices in 2026",
    speaker: "Vikram Rathore",
    speakerRole: "VP of Engineering & Distributed Systems Specialist",
    speakerCompany: "CloudScale Systems",
    speakerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    date: "Thursday, Oct 22, 2026",
    time: "7:30 PM IST",
    duration: 90,
    description: "Real-world incident reviews from operating multi-region microservices handling 50,000 TPS: circuit breakers, idempotency, event sourcing, and Kafka partitions.",
    detailedAgenda: [
      "Post-mortem dissection of a multi-million dollar cascade failure",
      "Distributed transactions: Saga pattern vs two-phase commit",
      "Kafka consumer group tuning and partition rebalancing",
      "Live interactive Q&A on production resiliency",
    ],
    registeredCount: 450,
    isPaid: true,
    price: 499,
    currency: "INR",
    category: "industry",
    tags: ["Microservices", "Kafka", "Distributed Systems", "Cloud"],
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    isRegistered: false,
  },
];
