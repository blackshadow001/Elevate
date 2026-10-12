import { courseService } from "@/services/courseService";
import { mockCourses } from "@/data/courses";

export const instant = false;
import { CourseDetailRoute } from "@/components/courses/CourseDetailRoute";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockCourses.map((course) => ({
    slug: course.slug,
  }));
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await courseService.getCourseBySlug(slug);

  return <CourseDetailRoute slug={slug} initialCourse={course} />;
}
