export interface BootcampSession {
  dayNumber: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: "completed" | "live" | "upcoming";
  hasRecording?: boolean;
  recordingUrl?: string;
  liveClassId?: string;
  assignmentTitle?: string;
  resourcesCount?: number;
}

export interface Bootcamp {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  dateRange: string;
  totalDays: number;
  liveSessionsCount: number;
  projectsCount: number;
  enrolledLearners: number;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  coverImage: string;
  tags: string[];
  userProgressPercent: number; // mock learner progress
  sessions: BootcampSession[];
}

export const mockBootcamps: Bootcamp[] = [
  {
    id: "bootcamp-1",
    slug: "7-day-full-stack-bootcamp",
    title: "7-Day Full Stack Web Bootcamp",
    tagline: "Build & deploy 3 production applications from scratch with live mentorship",
    description: "An intensive cohort-based bootcamp designed to take developers from frontend fundamentals to architecting scalable Node.js & Next.js full-stack systems with databases, caching, and CI/CD pipelines.",
    dateRange: "Oct 4 – Oct 10, 2026",
    totalDays: 7,
    liveSessionsCount: 7,
    projectsCount: 3,
    enrolledLearners: 2400,
    instructorName: "John Doe",
    instructorRole: "Senior Software Architect & Ex-Google",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000",
    tags: ["Full Stack", "React 19", "Next.js", "PostgreSQL", "Node.js"],
    userProgressPercent: 65,
    sessions: [
      {
        dayNumber: 1,
        title: "Introduction & Development Environment",
        description: "Monorepo architecture, Docker containerization, ESLint & TypeScript configuration.",
        date: "Oct 4, 2026",
        time: "7:00 PM IST",
        duration: 90,
        status: "completed",
        hasRecording: true,
        assignmentTitle: "Setup Local Docker & Postgres Container",
        resourcesCount: 4,
      },
      {
        dayNumber: 2,
        title: "Modern HTML5, Semantic Web & CSS Architecture",
        description: "Tailwind CSS design systems, container queries, accessible interactive components.",
        date: "Oct 5, 2026",
        time: "7:00 PM IST",
        duration: 90,
        status: "completed",
        hasRecording: true,
        assignmentTitle: "Build a Fully Accessible Component System",
        resourcesCount: 5,
      },
      {
        dayNumber: 3,
        title: "Advanced TypeScript & Modern JavaScript",
        description: "Async pipelines, generics, type guards, runtime validation with Zod.",
        date: "Oct 6, 2026",
        time: "7:00 PM IST",
        duration: 90,
        status: "completed",
        hasRecording: true,
        assignmentTitle: "Implement Type-Safe API Client with Zod",
        resourcesCount: 3,
      },
      {
        dayNumber: 4,
        title: "React 19 Architecture & Server Components",
        description: "RSC rendering lifecycle, server actions, useActionState, optimistic UI updates.",
        date: "Oct 7, 2026",
        time: "7:00 PM IST",
        duration: 105,
        status: "completed",
        hasRecording: true,
        assignmentTitle: "Project 1: Interactive Data Dashboard",
        resourcesCount: 6,
      },
      {
        dayNumber: 5,
        title: "Node.js Backend & Scalable APIs",
        description: "Express/Fastify microservices, connection pooling, middleware, JWT & OAuth2 auth.",
        date: "Oct 8, 2026",
        time: "7:00 PM IST",
        duration: 90,
        status: "live", // current active session!
        liveClassId: "live-1",
        assignmentTitle: "Project 2: Authentication & Token Management Service",
        resourcesCount: 4,
      },
      {
        dayNumber: 6,
        title: "Database Engineering with PostgreSQL & Prisma",
        description: "Relational schema modeling, index optimization, query performance, transactions.",
        date: "Oct 9, 2026",
        time: "7:00 PM IST",
        duration: 90,
        status: "upcoming",
        assignmentTitle: "Database Indexing & Query Tuning Benchmark",
        resourcesCount: 3,
      },
      {
        dayNumber: 7,
        title: "Final Capstone Project: End-to-End Deployment",
        description: "Full-stack project review, AWS/Vercel deployment, Docker, monitoring, automated testing.",
        date: "Oct 10, 2026",
        time: "7:00 PM IST",
        duration: 120,
        status: "upcoming",
        assignmentTitle: "Project 3: Production LMS / E-Commerce Capstone",
        resourcesCount: 8,
      },
    ],
  },
  {
    id: "bootcamp-2",
    slug: "2-day-ai-engineer-bootcamp",
    title: "2-Day AI Engineer & LLM Systems Bootcamp",
    tagline: "Build production-ready GenAI agents, RAG pipelines, and fine-tune open models",
    description: "Hands-on immersion in building enterprise generative AI systems: embedding strategies, LangChain/LlamaIndex agents, vector stores, guardrails, and latency optimization.",
    dateRange: "Nov 1 – Nov 2, 2026",
    totalDays: 2,
    liveSessionsCount: 2,
    projectsCount: 4,
    enrolledLearners: 1850,
    instructorName: "Priya Sundaram",
    instructorRole: "Lead AI Researcher & ML Consultant",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
    tags: ["AI & ML", "LangChain", "Vector DB", "Python", "RAG"],
    userProgressPercent: 0,
    sessions: [
      {
        dayNumber: 1,
        title: "Foundations of Modern LLMs & Attention Architecture",
        description: "Transformers overview, tokenization, temperature, system prompts and API latency.",
        date: "Nov 1, 2026",
        time: "6:00 PM IST",
        duration: 90,
        status: "upcoming",
        resourcesCount: 3,
      },
      {
        dayNumber: 2,
        title: "Vector Embeddings & Semantic Search at Scale",
        description: "Cosine similarity, HNSW indexes, hybrid search with BM25, Chroma & pgvector.",
        date: "Nov 2, 2026",
        time: "6:00 PM IST",
        duration: 90,
        status: "upcoming",
        resourcesCount: 5,
      },
    ],
  },
  {
    id: "bootcamp-3",
    slug: "30-day-frontend-system-architecture",
    title: "30-Day Frontend Architecture & Performance",
    tagline: "Master micro-frontends, Web Workers, WASM, and sub-second Core Web Vitals",
    description: "Built for senior frontend developers seeking Staff/Principal engineering roles. Learn how large tech companies structure million-line codebases.",
    dateRange: "Nov 15 – Dec 14, 2026",
    totalDays: 30,
    liveSessionsCount: 20,
    projectsCount: 5,
    enrolledLearners: 1320,
    instructorName: "John Doe",
    instructorRole: "Senior Software Architect & Ex-Google",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000",
    tags: ["Architecture", "Performance", "Web Vitals", "Next.js"],
    userProgressPercent: 0,
    sessions: [],
  },
];
