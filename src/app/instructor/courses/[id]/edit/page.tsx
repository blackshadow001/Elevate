import { EditCourseClient } from "./EditCourseClient";

export const metadata = {
  title: "Edit Course — Elevate Instructor",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;
  return <EditCourseClient id={id} />;
}
