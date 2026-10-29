import { EventRoute } from "./EventRoute";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventRoute slug={slug} />;
}
