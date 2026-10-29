import "server-only";

import { connection } from "next/server";
import { Course, Category, CareerPath, Instructor, Lesson } from "@/types";
import { ApiError } from "@/server/api";
import { getDb } from "@/server/db";
import { getCourse, listCourses } from "@/server/courses";
import { currentUser } from "@/server/auth";
import { formatVideoDuration } from "@/lib/videoDuration";
import { publicActivity } from "@/server/lessonActivities";

type ServerCourse = ReturnType<typeof getCourse>;

function metadataFor(id: string): Record<string, unknown> {
  const raw = getDb().prepare("SELECT metadata_json FROM courses WHERE id=?").get(id)?.metadata_json;
  try { return JSON.parse(String(raw || "{}")) as Record<string, unknown>; }
  catch { return {}; }
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function duration(seconds: number): string {
  if (seconds >= 3600) return `${Math.round(seconds / 3600)} hours`;
  return `${Math.max(1, Math.ceil(seconds / 60))} mins`;
}

function mapCourse(source: ServerCourse): Course {
  const metadata = metadataFor(source.id);
  const counts = getDb().prepare(`SELECT
    (SELECT COUNT(*) FROM enrollments WHERE course_id=?) learners,
    (SELECT COUNT(*) FROM reviews WHERE course_id=?) reviews`).get(source.id, source.id);
  const instructorCounts = getDb().prepare(`SELECT
    (SELECT COUNT(*) FROM courses WHERE instructor_id=? AND status='published') courses,
    (SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.instructor_id=?) learners`).get(source.instructor.id, source.instructor.id);
  const instructor: Instructor = {
    id: source.instructor.id, name: source.instructor.name, role: "Instructor",
    avatar: source.instructor.avatar || "",
    bio: "",
    rating: 0, studentsCount: Number(instructorCounts?.learners || 0),
    coursesCount: Number(instructorCounts?.courses || 0),
  };
  return {
    id: source.id, slug: source.slug, title: source.title, subtitle: source.subtitle,
    description: source.description, category: source.category,
    level: (source.level === "Advanced" || source.level === "Intermediate" ? source.level : "Beginner"),
    language: (source.language === "Hindi" || source.language === "Tamil" ? source.language : "English"),
    price: source.price, originalPrice: typeof metadata.originalPrice === "number" ? metadata.originalPrice : source.price,
    isFree: source.price === 0, rating: Number(counts?.reviews) ? source.rating : 0,
    ratingCount: Number(counts?.reviews || 0), studentsCount: Number(counts?.learners || 0),
    duration: duration(source.durationSeconds), totalLessons: source.sections.reduce((sum, section) => sum + section.lessons.length, 0),
    image: source.thumbnail || "", instructor,
    updatedAt: new Date(source.updatedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    whatYouWillLearn: strings(metadata.whatYouWillLearn), requirements: strings(metadata.requirements),
    sections: source.sections.map((section) => ({
      id: section.id, title: section.title,
      lessons: section.lessons.map((lesson): Lesson => ({
          id: lesson.id, title: lesson.title,
          duration: lesson.mediaAssetId
            ? formatVideoDuration(lesson.durationSeconds) : duration(lesson.durationSeconds),
          type: lesson.activity?.kind === "resource" ? "resource" : lesson.type === "quiz" || lesson.type === "project" || lesson.type === "reading" ? lesson.type : "video",
          content: lesson.description, activity: publicActivity(lesson.activity),
          videoUrl: lesson.mediaAssetId ? `/api/media/${lesson.mediaAssetId}/stream` : undefined,
        })),
    })),
  };
}

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    await connection();
    const ids = listCourses(new URLSearchParams({ pageSize: "50", sort: "newest" })).items.map((item) => item.id);
    return ids.map((id) => mapCourse(getCourse(id)));
  },
  getCourseBySlug: async (slug: string): Promise<Course | undefined> => {
    await connection();
    try { return mapCourse(getCourse(slug)); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return undefined; throw error; }
  },
  getEnrolledCourseBySlug: async (slug: string): Promise<Course | undefined> => {
    await connection();
    const user = await currentUser();
    if (!user) return undefined;
    const row = getDb().prepare(`SELECT c.id FROM courses c JOIN enrollments e ON e.course_id=c.id
      WHERE c.slug=? AND e.user_id=? AND e.status IN ('active','completed')`).get(slug, user.id);
    return row ? mapCourse(getCourse(String(row.id), false)) : undefined;
  },
  getPopularCourses: async (category?: string): Promise<Course[]> => {
    const courses = await courseService.getAllCourses();
    return (category && category !== "All" ? courses.filter((course) => course.category.toLowerCase() === category.toLowerCase()) : courses).slice(0, 8);
  },
  getCategories: async (): Promise<Category[]> => [],
  getCareerPaths: async (): Promise<CareerPath[]> => [],
  getCareerPathBySlug: async (_slug: string): Promise<CareerPath | undefined> => undefined,
  getInstructors: async (): Promise<Instructor[]> => [],
};
