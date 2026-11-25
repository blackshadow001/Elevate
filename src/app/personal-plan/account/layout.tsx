import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Personal Plan Subscription — Elevate",
  robots: { index: false, follow: false },
};

export default function PersonalPlanAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
