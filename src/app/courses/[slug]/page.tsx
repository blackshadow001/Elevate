import { courseService } from "@/services/courseService";

export const instant = false;
import { CourseDetailRoute } from "@/components/courses/CourseDetailRoute";

interface PageProps {
  params: Promise<{ slug: string }>;
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
