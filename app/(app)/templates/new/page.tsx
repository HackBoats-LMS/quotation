import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TemplateWizard from "./Wizard";

export default async function NewTemplatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, businesses(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) redirect("/onboarding");

  // Pre-fetch products to feed the wizard
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", profile.business_id)
    .eq("is_active", true);

  return (
    <div className="h-[calc(100vh-4rem)]">
      <TemplateWizard business={profile.businesses} products={products || []} />
    </div>
  );
}
