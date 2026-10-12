import { redirect } from "next/navigation";
import { mockLiveClasses } from "@/data/liveClasses";

export async function generateStaticParams() {
  return mockLiveClasses.map((c) => ({ id: c.id }));
}

export default async function OldLiveClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/live/classes/${id}`);
}
