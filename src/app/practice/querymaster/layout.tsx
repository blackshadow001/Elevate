import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QueryMaster — Interactive SQL Terminal & Schema Explorer",
  description: "Execute SQL queries directly in the browser across real relational database schemas. Practice SELECT, JOIN, GROUP BY, and data analysis tasks with instant execution.",
  alternates: { canonical: "https://elevate.courses/practice/querymaster" },
  openGraph: {
    title: "QueryMaster — Interactive SQL Terminal | Elevate Practice",
    description: "Execute SQL queries directly in the browser across real relational database schemas.",
    url: "https://elevate.courses/practice/querymaster",
    siteName: "Elevate",
    type: "website",
  },
};

export default function QueryMasterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
