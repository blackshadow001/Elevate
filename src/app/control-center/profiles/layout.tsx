import { redirect } from "next/navigation";
import { connection } from "next/server";
import { currentUser } from "@/server/auth";

export const instant = false;

export default async function AdminProfilesLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await currentUser();
  if (!user?.isSuperAdmin) redirect("/control-center");
  return children;
}
