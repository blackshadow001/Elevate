import { redirect } from "next/navigation";

export default async function OldLiveClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/live/classes/${id}`);
}
