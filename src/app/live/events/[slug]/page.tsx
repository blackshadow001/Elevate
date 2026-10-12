import { mockEvents } from "@/data/events";
import { EventRoute } from "./EventRoute";

export async function generateStaticParams() {
  return mockEvents.flatMap((e) => [
    { slug: e.slug },
    { slug: e.id },
  ]);
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventRoute slug={slug} />;
}
