import { EditCourseClient } from "./EditCourseClient";
import { mockCourses } from "@/data/courses";

export const metadata = {
  title: "Edit Course — Elevate Instructor",
};

export async function generateStaticParams() {
  return mockCourses.map((c) => ({
    id: c.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;
  return <EditCourseClient id={id} />;
}
