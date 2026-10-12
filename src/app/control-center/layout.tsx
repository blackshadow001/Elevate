import React from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { currentUser } from "@/server/auth";
import AdminShell from "@/components/admin/AdminShell";

export const instant = false;

export const metadata = {
  title: "Admin Control Center | Elevate LMS",
  description: "Enterprise operations, review queue, pricing engine, and platform governance.",
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const user = await currentUser();

  if (!user) redirect("/control-center/login");
  if (user.role !== "admin") notFound();

  return (
    <AdminShell
      adminUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin === true,
      }}
    >
      {children}
    </AdminShell>
  );
}
