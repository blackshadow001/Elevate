import { LiveClassRoute } from "@/components/live/LiveClassRoute";

export default async function LearnerClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveClassRoute id={id} />;
}
