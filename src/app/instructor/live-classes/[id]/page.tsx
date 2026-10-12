import { mockLiveClasses } from "@/data/liveClasses";
import { LiveClassRoute } from "@/components/live/LiveClassRoute";

export async function generateStaticParams() {
  return mockLiveClasses.map((c) => ({
    id: c.id,
  }));
}

export default async function InstructorLiveClassRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveClassRoute id={id} instructor />;
}
