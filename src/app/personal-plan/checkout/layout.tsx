import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Plan Checkout — Elevate",
  robots: { index: false, follow: false },
};

export default function PersonalPlanCheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
