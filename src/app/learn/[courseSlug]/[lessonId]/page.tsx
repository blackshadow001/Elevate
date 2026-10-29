import { courseService } from "@/services/courseService";

export const instant = false;
import { CoursePlayerRoute } from "@/components/learning/CoursePlayerRoute";

interface PageProps {
  params: Promise<{
    courseSlug: string;
    lessonId: string;
  }>;
}

export default async function LearnLessonPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const course = await courseService.getEnrolledCourseBySlug(courseSlug);

  return <CoursePlayerRoute slug={courseSlug} lessonId={lessonId} initialCourse={course} />;
}
