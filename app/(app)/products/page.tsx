import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Package } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user!.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", profile?.business_id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
          <p className="text-slate-500 mt-1">Manage your catalog for quick quotation generation.</p>
        </div>
        <Link href="/products/new">
          <Button className="rounded-xl">
            <PlusCircle className="mr-2" size={18} />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input placeholder="Search products by name or code..." className="pl-10 rounded-xl" />
      </div>

      {!products || products.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent rounded-2xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No products found</h3>
            <p className="text-slate-500 mb-4">Add products and services to your catalog to easily include them in quotes.</p>
            <Link href="/products/new">
              <Button variant="outline" className="rounded-xl">Add Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-slate-500">{product.code || "-"}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {product.category ? (
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{product.category}</span>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {Number(product.unit_price).toFixed(2)} <span className="text-xs text-slate-400">{product.currency}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{product.unit_type}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/products/${product.id}`} className="text-blue-600 hover:underline font-medium">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
