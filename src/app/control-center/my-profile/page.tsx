import AccountProfile from "@/components/profile/AccountProfile";
import { ownProfile } from "@/server/ownProfile";
import { connection } from "next/server";

export const instant = false;

export default async function AdminMyProfilePage() {
  await connection();
  return <AccountProfile profile={await ownProfile()} />;
}
