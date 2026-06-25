"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    tax_number: "",
    currency: "USD",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: businessId, error: rpcError } = await supabase.rpc(
      "create_business_and_profile",
      {
        p_name: formData.name,
        p_email: formData.email,
        p_phone: formData.phone,
        p_address: formData.address,
        p_website: formData.website,
        p_tax_number: formData.tax_number,
        p_currency: formData.currency
      }
    );

    if (rpcError) {
      console.error("RPC Error Details:", rpcError);
      alert(`Setup Failed: ${rpcError.message || "Unknown Error"}. Did you run the latest SQL script in Supabase?`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12">
      <Card className="w-full max-w-2xl shadow-lg border-0 rounded-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Set up your business</CardTitle>
          <CardDescription className="text-slate-500">
            Let's get your workspace ready for creating quotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={formData.website} onChange={handleChange} className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input id="tax_number" name="tax_number" value={formData.tax_number} onChange={handleChange} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" value={formData.currency} onChange={handleChange} placeholder="USD" className="rounded-xl" />
              </div>
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
