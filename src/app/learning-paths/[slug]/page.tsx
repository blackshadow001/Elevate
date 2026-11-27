import { GuidedPathPlayer } from "@/components/learning/GuidedPathPlayer";

export default async function GuidedPathPage({ params }: { params: Promise<{ slug: string }> }) {
  return <GuidedPathPlayer slug={(await params).slug} />;
}
