import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guided Learning Paths | Elevate",
  description: "Learn by doing with short interactive lessons, instant checks, and practical projects on Elevate.",
};

export default function LearningPathsLayout({ children }: { children: React.ReactNode }) { return children; }
