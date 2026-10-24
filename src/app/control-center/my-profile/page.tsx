import AccountProfile from "@/components/profile/AccountProfile";
import { ownProfile } from "@/server/ownProfile";

export const instant = false;

export default async function AdminMyProfilePage() {
  return <AccountProfile profile={await ownProfile()} />;
}
