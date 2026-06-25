import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function BusinessSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, businesses(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) redirect("/onboarding");

  const business = profile.businesses as any;

  async function updateBusiness(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    const { data: prof } = await supabase.from("profiles").select("business_id").eq("id", user.id).single();
    
    if (prof?.business_id) {
      await supabase.from("businesses").update({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        website: formData.get("website"),
        address: formData.get("address"),
        tax_number: formData.get("tax_number"),
        currency: formData.get("currency"),
      }).eq("id", prof.business_id);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
        <p className="text-slate-500 mt-1">Manage your business profile and preferences.</p>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Update your company details. These will be used in your quotations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateBusiness} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input id="name" name="name" defaultValue={business.name} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input id="email" name="email" type="email" defaultValue={business.email} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={business.phone} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={business.website} className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={business.address} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input id="tax_number" name="tax_number" defaultValue={business.tax_number} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue={business.currency} className="rounded-xl" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" className="rounded-xl">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
