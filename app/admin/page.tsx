import { redirect } from "next/navigation";
import { isAdminAuthenticated, getInvitedUsers } from "./actions";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const users = await getInvitedUsers();

  return <DashboardClient initialUsers={users} />;
}
