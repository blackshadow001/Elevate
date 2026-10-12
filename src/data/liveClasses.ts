export interface LiveClass {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  scheduledAt: string;
  startTime: string;
  duration: number; // in minutes
  platform?: "zoom" | "google-meet" | "teams" | "custom";
  provider?: "zoom" | "google-meet" | "teams" | "custom";
  meetingUrl?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  description: string;
  attendeesCount: number;
  registeredCount?: number;
  attendanceRate?: number; // e.g. 92%
  tags: string[];
}

export const mockLiveClasses: LiveClass[] = [
  {
    id: "live-1",
    title: "React 19 Server Actions & Architecture In-Depth",
    courseId: "course-1",
    courseTitle: "Full Stack Web Development from Zero to Hero",
    instructorId: "usr_002",
    instructorName: "John Doe",
    instructorRole: "Senior Software Architect",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    scheduledAt: "Today",
    startTime: "7:00 PM IST",
    duration: 90,
    platform: "zoom",
    provider: "zoom",
    meetingUrl: "https://zoom.us/j/mock-learnly-live-1",
    status: "live", // Currently LIVE NOW for testing!
    description: "Hands-on walkthrough migrating from client-side useEffect state patterns to native React 19 Server Functions, optimistic updates, and streaming forms.",
    attendeesCount: 142,
    registeredCount: 195,
    tags: ["React 19", "Server Components", "Full Stack"],
  },
  {
    id: "live-2",
    title: "System Design: Scaling Postgres to 10M Requests",
    courseId: "course-1",
    courseTitle: "Full Stack Web Development from Zero to Hero",
    instructorId: "usr_002",
    instructorName: "John Doe",
    instructorRole: "Senior Software Architect",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    scheduledAt: "Tomorrow",
    startTime: "6:30 PM IST",
    duration: 75,
    platform: "google-meet",
    provider: "google-meet",
    meetingUrl: "https://meet.google.com/mock-postgres-scale",
    status: "scheduled",
    description: "Deep dive into connection pooling, PgBouncer, read replicas, table partitioning, and indexing strategies for high throughput systems.",
    attendeesCount: 89,
    registeredCount: 140,
    tags: ["Database", "PostgreSQL", "Scalability"],
  },
  {
    id: "live-3",
    title: "Building Production RAG Agents with LangChain",
    courseId: "course-4",
    courseTitle: "Generative AI & LLM Application Engineering",
    instructorId: "usr_003",
    instructorName: "Priya Sundaram",
    instructorRole: "Lead AI Researcher",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    scheduledAt: "Sunday, Oct 11, 2026",
    startTime: "5:00 PM IST",
    duration: 120,
    platform: "zoom",
    provider: "zoom",
    meetingUrl: "https://zoom.us/j/mock-rag-agents",
    status: "scheduled",
    description: "Architecting autonomous agents with tool calling, vector search chunking optimizations, and evaluation guardrails.",
    attendeesCount: 215,
    registeredCount: 280,
    tags: ["AI & ML", "LangChain", "Vector DB"],
  },
  {
    id: "live-4",
    title: "Modern Figma Auto-Layout & Design Tokens Masterclass",
    courseId: "course-3",
    courseTitle: "Modern UI/UX Design & Design Systems in Figma",
    instructorId: "usr_004",
    instructorName: "Ananya Sharma",
    instructorRole: "Head of Product Design",
    instructorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    scheduledAt: "Oct 5, 2026",
    startTime: "4:00 PM IST",
    duration: 60,
    platform: "zoom",
    provider: "zoom",
    meetingUrl: "https://zoom.us/j/mock-figma-tokens",
    status: "completed",
    description: "Recording available: Systematic approach to color, spacing, typography variables and component token exports for developers.",
    attendeesCount: 178,
    registeredCount: 194,
    attendanceRate: 92,
    tags: ["UI/UX", "Figma", "Design System"],
  },
];
