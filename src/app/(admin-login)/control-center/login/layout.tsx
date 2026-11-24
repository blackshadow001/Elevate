import { redirect } from "next/navigation";
import { connection } from "next/server";
import { currentUser } from "@/server/auth";
import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Login — Elevate Control Center",
  robots: { index: false, follow: false },
};

export default async function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await currentUser();
  if (user?.role === "admin") redirect("/control-center");
  return children;
}
