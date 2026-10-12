export interface Instructor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  rating: number;
  studentsCount: number;
  coursesCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz" | "project";
  completed?: boolean;
  videoUrl?: string;
  content?: string;
  notes?: string;
  resources?: { name: string; size: string; url: string }[];
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: "English" | "Tamil" | "Hindi";
  price: number;
  originalPrice: number;
  isFree?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  rating: number;
  ratingCount: number;
  studentsCount: number;
  duration: string;
  totalLessons: number;
  image: string;
  instructor: Instructor;
  updatedAt: string;
  whatYouWillLearn: string[];
  requirements: string[];
  sections: CourseSection[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  courseCount: number;
  colorAccent: string;
  description?: string;
}

export interface CareerPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  coursesCount: number;
  durationHours: number;
  projectsCount: number;
  technologies: string[];
  salaryRange?: string;
  coursesIncluded?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  courseTaken: string;
}

export interface EnrolledCourseProgress {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  courseImage: string;
  instructorName: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastLessonId: string;
  lastLessonTitle: string;
  lastAccessed: string;
}
