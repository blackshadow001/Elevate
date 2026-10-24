import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AccountProfile from "@/components/profile/AccountProfile";
import { currentUser } from "@/server/auth";
import { ownProfile } from "@/server/ownProfile";

export const instant = false;

export default async function ProfilePage() {
  await connection();
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/control-center/my-profile");
  const profile = await ownProfile();
  return <><Navbar /><main className="flex-1 bg-[#FFFDF9] px-4 sm:px-6"><AccountProfile profile={profile} /></main><Footer /></>;
}
