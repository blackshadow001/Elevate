import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply to Teach — Elevate Instructor Application",
  description: "Share your expertise with learners worldwide. Submit your course idea and background to become an Elevate instructor.",
  alternates: { canonical: "https://elevate.courses/instructor/apply" },
  openGraph: {
    title: "Apply to Teach on Elevate",
    description: "Submit your course proposal and background to become an Elevate instructor.",
    url: "https://elevate.courses/instructor/apply",
    siteName: "Elevate",
    type: "website",
  },
};

export default function InstructorApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
