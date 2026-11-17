import { courseService } from "@/services/courseService";
import type { Metadata } from "next";

export const instant = false;
import { CourseDetailRoute } from "@/components/courses/CourseDetailRoute";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await courseService.getCourseBySlug(slug);
  if (!course) return { title: "Course not found — Elevate", robots: { index: false } };
  const description = course.subtitle || course.description;
  return {
    title: `${course.title} — Elevate`,
    description: description.slice(0, 160),
    alternates: { canonical: `https://elevate.courses/courses/${encodeURIComponent(course.slug)}` },
    openGraph: { title: course.title, description: description.slice(0, 160), type: "website" },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await courseService.getCourseBySlug(slug);
  const relatedCourses = course ? (await courseService.getAllCourses())
    .filter((item) => item.id !== course.id && item.category === course.category)
    .sort((a, b) => Number(Boolean(course.subcategory) && b.subcategory === course.subcategory) - Number(Boolean(course.subcategory) && a.subcategory === course.subcategory))
    .slice(0, 3) : [];

  return <CourseDetailRoute slug={slug} initialCourse={course} relatedCourses={relatedCourses} />;
}
