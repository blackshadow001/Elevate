import { courseService } from "@/services/courseService";

export const instant = false;
import { CourseDetailRoute } from "@/components/courses/CourseDetailRoute";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await courseService.getCourseBySlug(slug);

  return <CourseDetailRoute slug={slug} initialCourse={course} />;
}
