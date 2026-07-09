import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) redirect("/auth/login");

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
    select: { id: true },
  });

  if (!business?.id) redirect("/onboarding");
  const businessId = business.id;

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("business_id", businessId)
    .single();

  if (!product) {
    return <div className="p-8">Product not found.</div>;
  }

  async function updateProduct(formData: FormData) {
    "use server";
    const supabase = createAdminClient();
    
    await supabase.from("products").update({
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description"),
      category: formData.get("category"),
      unit_type: formData.get("unit_type"),
      unit_price: parseFloat(formData.get("unit_price") as string) || 0,
      currency: formData.get("currency"),
    }).eq("id", params.id);
    
    redirect("/products");
  }

  async function deleteProduct() {
    "use server";
    const supabase = createAdminClient();
    await supabase.from("products").delete().eq("id", params.id);
    redirect("/products");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Products
      </Link>

      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Edit Product</CardTitle>
          <form action={deleteProduct}>
            <Button type="submit" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 size={18} className="mr-2" />
              Delete
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <form action={updateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product/Service Name *</Label>
                <Input id="name" name="name" defaultValue={product.name} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code (SKU)</Label>
                <Input id="code" name="code" defaultValue={product.code} className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  name="description" 
                  defaultValue={product.description} 
                  className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={product.category} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_type">Unit Type</Label>
                <select
                  id="unit_type"
                  name="unit_type"
                  defaultValue={product.unit_type}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="Piece">Piece</option>
                  <option value="Hour">Hour</option>
                  <option value="Day">Day</option>
                  <option value="Month">Month</option>
                  <option value="Project">Project</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input id="unit_price" name="unit_price" type="number" step="0.01" min="0" defaultValue={product.unit_price} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue={product.currency} className="rounded-xl" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="submit" className="rounded-xl">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
