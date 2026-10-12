import { courseService } from "@/services/courseService";
import { mockCourses } from "@/data/courses";

export const instant = false;
import { CoursePlayerRoute } from "@/components/learning/CoursePlayerRoute";

interface PageProps {
  params: Promise<{
    courseSlug: string;
    lessonId: string;
  }>;
}

export async function generateStaticParams() {
  const params: { courseSlug: string; lessonId: string }[] = [];
  mockCourses.forEach((c) => {
    c.sections.forEach((s) => {
      s.lessons.forEach((l) => {
        params.push({
          courseSlug: c.slug,
          lessonId: l.id,
        });
      });
    });
  });
  return params;
}

export default async function LearnLessonPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const course = await courseService.getEnrolledCourseBySlug(courseSlug);

  return <CoursePlayerRoute slug={courseSlug} lessonId={lessonId} initialCourse={course} />;
}
