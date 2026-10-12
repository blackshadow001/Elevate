export type UserRole = "learner" | "instructor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  headline?: string;
  enrolledCourseCount?: number;
  publishedCourseCount?: number;
}

export const mockUsers: User[] = [
  {
    id: "usr_001",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    headline: "Aspiring Full Stack Engineer",
    enrolledCourseCount: 4,
  },
  {
    id: "usr_002",
    name: "John Doe",
    email: "john@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    headline: "Senior Software Architect & Lead Instructor",
    publishedCourseCount: 8,
  },
  {
    id: "usr_003",
    name: "Admin Elevate",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    headline: "Platform Operations Manager",
  },
];
