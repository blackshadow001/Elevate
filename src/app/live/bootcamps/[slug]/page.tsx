import { mockBootcamps } from "@/data/bootcamps";
import { BootcampRoute } from "./BootcampRoute";

export async function generateStaticParams() {
  return mockBootcamps.flatMap((b) => [
    { slug: b.slug },
    { slug: b.id },
  ]);
}

export default async function BootcampDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BootcampRoute slug={slug} />;
}
