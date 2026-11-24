import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Plan — Unlimited Access to Curated Courses | Elevate",
  description: "Subscribe to Elevate Personal Plan for monthly or annual access to curated courses in AI, software engineering, and technology. Learn on your schedule and keep your progress in one place.",
  alternates: { canonical: "https://elevate.courses/personal-plan" },
  openGraph: {
    title: "Personal Plan — Elevate Courses Subscription",
    description: "Explore our curated course library with flexible monthly or annual subscriptions.",
    url: "https://elevate.courses/personal-plan",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Elevate Personal Plan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Plan — Elevate Courses Subscription",
    description: "Explore our curated course library with flexible monthly or annual subscriptions.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

export default function PersonalPlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
