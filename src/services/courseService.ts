import "server-only";

import { connection } from "next/server";
import { Course, Category, CareerPath, Instructor, Lesson } from "@/types";
import { ApiError } from "@/server/api";
import { getDb } from "@/server/db";
import { getCourse } from "@/server/courses";
import { currentUser } from "@/server/auth";
import { formatVideoDuration } from "@/lib/videoDuration";
import { publicActivity, readActivity } from "@/server/lessonActivities";
import { catalogCategory } from "@/lib/catalogTaxonomy";
import { cachedAsync } from "@/server/cache";

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
  const instructorProfile = getDb().prepare("SELECT headline,bio FROM instructor_profiles WHERE user_id=?").get(source.instructor.id);
  const instructor: Instructor = {
    id: source.instructor.id, name: source.instructor.name, role: "Instructor",
    avatar: source.instructor.avatar || "",
    headline: String(instructorProfile?.headline || ""), bio: String(instructorProfile?.bio || ""),
    rating: 0, studentsCount: Number(instructorCounts?.learners || 0),
    coursesCount: Number(instructorCounts?.courses || 0),
  };
  return {
    id: source.id, slug: source.slug, title: source.title, subtitle: source.subtitle,
    description: source.description, category: source.category,
    subcategory: typeof metadata.subcategory === "string" ? metadata.subcategory : "",
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
          isPreview: lesson.isPreview && lesson.durationSeconds >= 30 && lesson.durationSeconds <= 60,
          duration: lesson.mediaAssetId
            ? formatVideoDuration(lesson.durationSeconds) : duration(lesson.durationSeconds),
          type: lesson.activity?.kind === "resource" ? "resource" : lesson.type === "quiz" || lesson.type === "project" || lesson.type === "reading" ? lesson.type : "video",
          content: lesson.description, activity: publicActivity(lesson.activity),
          videoUrl: lesson.mediaAssetId ? `/api/media/${lesson.mediaAssetId}/stream` : undefined,
        })),
    })),
  };
}

function mapBatchCourse(
  source: Record<string, unknown>,
  sections: Array<{ id: string; title: string; lessons: Array<Lesson> }>
): Course {
  let metadata: Record<string, unknown> = {};
  try { metadata = JSON.parse(String(source.metadata_json || "{}")); } catch { metadata = {}; }

  const instructor: Instructor = {
    id: String(source.instructor_id),
    name: String(source.instructor_name),
    role: "Instructor",
    avatar: source.instructor_avatar ? String(source.instructor_avatar) : "",
    headline: String(source.instructor_headline || ""),
    bio: String(source.instructor_bio || ""),
    rating: 0,
    studentsCount: Number(source.instructor_learners_count || 0),
    coursesCount: Number(source.instructor_courses_count || 0),
  };

  const level = String(source.level);
  const language = String(source.language);
  const price = Number(source.price_minor) / 100;
  const reviewsCount = Number(source.reviews_count || 0);
  const durationSeconds = Number(source.duration_seconds || 0);

  return {
    id: String(source.id),
    slug: String(source.slug),
    title: String(source.title),
    subtitle: String(source.subtitle || ""),
    description: String(source.description || ""),
    category: catalogCategory(String(source.category)),
    subcategory: typeof metadata.subcategory === "string" ? metadata.subcategory : "",
    level: level === "Advanced" || level === "Intermediate" ? level : "Beginner",
    language: language === "Hindi" || language === "Tamil" ? language : "English",
    price,
    originalPrice: typeof metadata.originalPrice === "number" ? metadata.originalPrice : price,
    isFree: price === 0,
    rating: reviewsCount > 0 ? Number(source.rating || 0) : 0,
    ratingCount: reviewsCount,
    studentsCount: Number(source.learners_count || 0),
    duration: duration(durationSeconds),
    totalLessons: sections.reduce((sum, section) => sum + section.lessons.length, 0),
    image: source.thumbnail ? String(source.thumbnail) : "",
    instructor,
    updatedAt: new Date(String(source.updated_at)).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    whatYouWillLearn: strings(metadata.whatYouWillLearn),
    requirements: strings(metadata.requirements),
    sections,
  };
}

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    await connection();
    return cachedAsync("courses:published-all", 30_000, async () => {
    const db = getDb();

    const courseQuery = `
      SELECT
        c.id, c.slug, c.title, c.subtitle, c.description, c.category, c.level, c.language,
        c.thumbnail, c.price_minor, c.currency, c.status, c.rating, c.duration_seconds, c.lesson_count,
        c.metadata_json, c.updated_at, c.published_at,
        u.id as instructor_id, u.name as instructor_name, u.avatar as instructor_avatar,
        COALESCE(ip.headline, '') as instructor_headline,
        COALESCE(ip.bio, '') as instructor_bio,
        COALESCE(enr.learners_count, 0) as learners_count,
        COALESCE(rev.reviews_count, 0) as reviews_count,
        COALESCE(inst.instructor_courses_count, 0) as instructor_courses_count,
        COALESCE(inst.instructor_learners_count, 0) as instructor_learners_count
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN instructor_profiles ip ON ip.user_id = u.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as learners_count FROM enrollments GROUP BY course_id
      ) enr ON enr.course_id = c.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as reviews_count FROM reviews GROUP BY course_id
      ) rev ON rev.course_id = c.id
      LEFT JOIN (
        SELECT
          c2.instructor_id,
          COUNT(DISTINCT CASE WHEN c2.status = 'published' THEN c2.id END) as instructor_courses_count,
          COUNT(e2.id) as instructor_learners_count
        FROM courses c2
        LEFT JOIN enrollments e2 ON e2.course_id = c2.id
        GROUP BY c2.instructor_id
      ) inst ON inst.instructor_id = u.id
      WHERE c.status = 'published' AND c.review_status = 'approved'
      ORDER BY c.published_at DESC
    `;

    const sectionQuery = `
      SELECT
        s.id as section_id, s.course_id, s.title as section_title, s.position as section_position,
        l.id as lesson_id, l.title as lesson_title, l.description as lesson_description,
        l.activity_json, l.position as lesson_position, l.type as lesson_type,
        l.duration_seconds as lesson_duration_seconds, l.is_preview as lesson_is_preview,
        l.status as lesson_status, m.id as media_asset_id
      FROM course_sections s
      LEFT JOIN lessons l ON l.section_id = s.id AND l.status = 'published'
      LEFT JOIN media_assets m ON m.storage_key = l.video_storage_key
      ORDER BY s.course_id, s.position, l.position
    `;

    const courseRows = db.prepare(courseQuery).all() as Array<Record<string, unknown>>;
    const sectionRows = db.prepare(sectionQuery).all() as Array<Record<string, unknown>>;

    // Group sections and lessons by course_id
    const sectionsByCourse = new Map<string, Map<string, { id: string; title: string; lessons: Lesson[] }>>();

    for (const row of sectionRows) {
      const courseId = String(row.course_id);
      if (!sectionsByCourse.has(courseId)) {
        sectionsByCourse.set(courseId, new Map());
      }
      const courseSections = sectionsByCourse.get(courseId)!;
      const sectionId = String(row.section_id);

      if (!courseSections.has(sectionId)) {
        courseSections.set(sectionId, {
          id: sectionId,
          title: String(row.section_title),
          lessons: [],
        });
      }

      if (row.lesson_id) {
        const sec = courseSections.get(sectionId)!;
        const durationSec = Number(row.lesson_duration_seconds || 0);
        const isPreview = Boolean(row.lesson_is_preview) && durationSec >= 30 && durationSec <= 60;
        const mediaAssetId = row.media_asset_id ? String(row.media_asset_id) : undefined;
        const act = publicActivity(readActivity(String(row.activity_json || "")));
        const lType = act?.kind === "resource" ? "resource" : (row.lesson_type === "quiz" || row.lesson_type === "project" || row.lesson_type === "reading" ? String(row.lesson_type) : "video") as Lesson["type"];

        sec.lessons.push({
          id: String(row.lesson_id),
          title: String(row.lesson_title),
          isPreview,
          duration: mediaAssetId ? formatVideoDuration(durationSec) : duration(durationSec),
          type: lType,
          content: String(row.lesson_description || ""),
          activity: act,
          videoUrl: mediaAssetId ? `/api/media/${mediaAssetId}/stream` : undefined,
        });
      }
    }

    return courseRows.map((courseRow) => {
      const courseId = String(courseRow.id);
      const courseSectionsMap = sectionsByCourse.get(courseId);
      const sections = courseSectionsMap ? Array.from(courseSectionsMap.values()) : [];
      return mapBatchCourse(courseRow, sections);
    });
    });
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
