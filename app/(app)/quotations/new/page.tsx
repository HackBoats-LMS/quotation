import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import QuotationForm from "@/components/QuotationForm";

export default async function NewQuotationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, businesses(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) redirect("/onboarding");

  // Fetch necessary data for dropdowns
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", profile.business_id);

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("business_id", profile.business_id);

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", profile.business_id)
    .eq("is_active", true);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Quotation</h1>
        <p className="text-slate-500 mt-1">Generate a new quotation from your templates.</p>
      </div>

      <QuotationForm 
        customers={customers || []} 
        templates={templates || []} 
        products={products || []}
        business={profile.businesses}
      />
    </div>
  );
}
