import { redirect } from "next/navigation";
import { getLoggedInOwnerEmail, getBusinessProfile } from "../auth/actions";
import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

async function getStats(businessId: string) {
  let templateCount = 0;
  let quotationCount = 0;

  try {
    // Attempt exact count check. Head is true to minimize packet size.
    const { count, error } = await supabase
      .from("quotation_templates")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId);
    
    if (!error && count !== null) {
      templateCount = count;
    }
  } catch (e) {
    console.warn("Failed fetching quotation_templates count (this is expected if the table hasn't been created yet):", e);
  }

  try {
    const { count, error } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId);
    
    if (!error && count !== null) {
      quotationCount = count;
    }
  } catch (e) {
    console.warn("Failed fetching quotations count (this is expected if the table hasn't been created yet):", e);
  }

  return { templateCount, quotationCount };
}

export default async function DashboardPage() {
  const email = await getLoggedInOwnerEmail();

  // Redirect to login if session is empty
  if (!email) {
    redirect("/login");
  }

  // Fetch business profile
  const business = await getBusinessProfile(email);

  // If setup has not been completed, enforce redirection to setup wizard
  if (!business) {
    redirect("/business-setup");
  }

  // Retrieve metrics stats (gracefully defaults counts to 0 if tables are missing)
  const { templateCount, quotationCount } = await getStats(business.id);

  return (
    <DashboardClient 
      business={business} 
      ownerEmail={email} 
      templateCount={templateCount} 
      quotationCount={quotationCount} 
    />
  );
}
