import { BootcampRoute } from "./BootcampRoute";

export default async function BootcampDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BootcampRoute slug={slug} />;
}
