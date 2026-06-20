import { redirect } from "next/navigation";
import { getLoggedInOwnerEmail, getBusinessProfile } from "../auth/actions";
import SetupFormClient from "./SetupFormClient";

export const dynamic = "force-dynamic";

export default async function BusinessSetupPage() {
  const email = await getLoggedInOwnerEmail();

  // If not logged in as business owner, redirect to login
  if (!email) {
    redirect("/login");
  }

  // Check if business profile already exists
  const business = await getBusinessProfile(email);

  // If already completed, skip setup and open dashboard directly
  if (business) {
    redirect("/dashboard");
  }

  return <SetupFormClient ownerEmail={email} />;
}
