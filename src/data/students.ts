export interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  courseTitle: string;
  courseId: string;
  progressPercent: number;
  lastActive: string;
  status: "Active" | "Completed" | "At Risk";
  enrolledAt: string;
}

export const mockInstructorStudents: EnrolledStudent[] = [
  {
    id: "std-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/images/first-version/photo-1534528741775-53994a69daeb.jpg",
    courseTitle: "Full Stack Web Development from Zero to Hero",
    courseId: "course-1",
    progressPercent: 72,
    lastActive: "2 hours ago",
    status: "Active",
    enrolledAt: "Sep 15, 2026",
  },
  {
    id: "std-2",
    name: "Kavita Raman",
    email: "kavita.r@gmail.com",
    avatar: "/images/first-version/photo-1494790108377-be9c29b29330.jpg",
    courseTitle: "Full Stack Web Development from Zero to Hero",
    courseId: "course-1",
    progressPercent: 100,
    lastActive: "Yesterday",
    status: "Completed",
    enrolledAt: "Aug 20, 2026",
  },
  {
    id: "std-3",
    name: "Rohan Verma",
    email: "rohan.v@tech.in",
    avatar: "/images/first-version/photo-1507003211169-0a1dd7228f2d.jpg",
    courseTitle: "Python Masterclass: Data Science & Machine Learning",
    courseId: "course-2",
    progressPercent: 45,
    lastActive: "5 hours ago",
    status: "Active",
    enrolledAt: "Oct 1, 2026",
  },
  {
    id: "std-4",
    name: "Sneha Mukherjee",
    email: "sneha.ux@gmail.com",
    avatar: "/images/first-version/photo-1544005313-94ddf0286df2.jpg",
    courseTitle: "Modern UI/UX Design & Design Systems in Figma",
    courseId: "course-3",
    progressPercent: 88,
    lastActive: "30 mins ago",
    status: "Active",
    enrolledAt: "Sep 22, 2026",
  },
  {
    id: "std-5",
    name: "Vikram Mehta",
    email: "vikram.m@outlook.com",
    avatar: "/images/first-version/photo-1500648767791-00dcc994a43e.jpg",
    courseTitle: "Cloud & DevOps Engineering: Docker, Kubernetes & AWS",
    courseId: "course-5",
    progressPercent: 18,
    lastActive: "6 days ago",
    status: "At Risk",
    enrolledAt: "Sep 10, 2026",
  },
  {
    id: "std-6",
    name: "Deepak Choudhury",
    email: "deepak.c@cloud.com",
    avatar: "/images/first-version/photo-1519085360753-af0119f7cbe7.jpg",
    courseTitle: "Full Stack Web Development in Tamil (தமிழ்)",
    courseId: "course-6",
    progressPercent: 64,
    lastActive: "Today",
    status: "Active",
    enrolledAt: "Sep 28, 2026",
  },
];
