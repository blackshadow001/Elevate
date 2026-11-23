import type { Metadata } from "next";
import HelpCenterPage from "../help/page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Elevate",
  description: "Find quick answers to common questions about Elevate platform, enrollments, video learning, and certificates.",
  alternates: { canonical: "https://elevate.courses/faq" },
  openGraph: {
    title: "Frequently Asked Questions — Elevate",
    description: "Find quick answers to common questions about Elevate platform, enrollments, video learning, and certificates.",
    url: "https://elevate.courses/faq",
  },
};

export default function FAQPage() {
  return <HelpCenterPage />;
}
