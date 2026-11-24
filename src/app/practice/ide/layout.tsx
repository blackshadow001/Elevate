import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud IDE — Online Code Editor",
  alternates: { canonical: "https://elevate.courses/practice/cloudstudio" },
};

export default function IDELayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
