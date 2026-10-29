import { LiveClassRoute } from "@/components/live/LiveClassRoute";

export default async function InstructorLiveClassRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveClassRoute id={id} instructor />;
}
