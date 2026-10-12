import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { currentUser } from "@/server/auth";
import AdminOverviewDashboard from "@/components/admin/AdminOverviewDashboard";

export const instant = false;

export default async function AdminPage() {
  await connection();
  const user = await currentUser();
  if (!user) redirect("/control-center/login");
  if (user.role !== "admin") notFound();
  return <AdminOverviewDashboard adminName={user.name} />;
}
