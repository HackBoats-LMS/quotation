import { redirect } from "next/navigation";
import { getLoggedInOwnerEmail, getBusinessProfile } from "@/app/auth/actions";
import { getTemplates } from "./actions";
import TemplatesClient from "./TemplatesClient";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const email = await getLoggedInOwnerEmail();

  // Enforce session login check
  if (!email) {
    redirect("/login");
  }

  // Enforce business setup completion check
  const business = await getBusinessProfile(email);
  if (!business) {
    redirect("/business-setup");
  }

  // Fetch templates for the current business
  let templates = [];
  try {
    templates = await getTemplates();
  } catch (e) {
    console.error("Failed to load templates (it might be that the database table is not created yet):", e);
  }

  return (
    <TemplatesClient 
      initialTemplates={templates} 
      businessName={business.name} 
      ownerEmail={email} 
    />
  );
}
