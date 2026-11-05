import { EnrolledCourseProgress } from "@/types";

export const mockEnrolledCourses: EnrolledCourseProgress[] = [
  {
    courseId: "course-1",
    courseSlug: "full-stack-web-development",
    courseTitle: "Full Stack Web Development from Zero to Hero",
    courseImage: "/images/first-version/photo-1517694712202-14dd9538aa97.jpg",
    instructorName: "John Doe",
    progressPercent: 72,
    completedLessons: 18,
    totalLessons: 25,
    lastLessonId: "les-5",
    lastLessonTitle: "Variables, Scope, and Data Structures",
    lastAccessed: "2 hours ago",
  },
  {
    courseId: "course-2",
    courseSlug: "python-masterclass-data-science",
    courseTitle: "Python Masterclass: Data Science & Machine Learning",
    courseImage: "/images/first-version/photo-1526374965328-7f61d4dc18c5.jpg",
    instructorName: "Priya Sundaram",
    progressPercent: 35,
    completedLessons: 15,
    totalLessons: 44,
    lastLessonId: "les-ds-3",
    lastLessonTitle: "Multi-dimensional Arrays & Vectorization",
    lastAccessed: "Yesterday",
  },
  {
    courseId: "course-4",
    courseSlug: "generative-ai-llm-application-engineering",
    courseTitle: "Generative AI & LLM Application Engineering",
    courseImage: "/images/first-version/photo-1618005182384-a83a8bd57fbe.jpg",
    instructorName: "Priya Sundaram",
    progressPercent: 12,
    completedLessons: 6,
    totalLessons: 48,
    lastLessonId: "les-ai-2",
    lastLessonTitle: "Prompt Engineering Patterns",
    lastAccessed: "3 days ago",
  },
];

export const mockUserStats = {
  name: "Alex",
  email: "alex@example.com",
  avatar: "/images/first-version/photo-1535713875002-d1d0cf377fde.jpg",
  coursesCompleted: 8,
  learningHours: 124,
  certificates: 5,
  currentStreak: 12,
};
