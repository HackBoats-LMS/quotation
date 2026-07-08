import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default async function ProductsPage() {
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) redirect("/auth/login");

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
    select: { id: true },
  });

  if (!business?.id) redirect("/onboarding");

  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
          <p className="text-slate-500 mt-1">Manage your catalog for quotations and invoicing.</p>
        </div>
        <Link href="/products/new">
          <Button className="rounded-xl shadow-sm">
            <Plus size={18} className="mr-2" />
            Add New
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.unit_type && (
                      <span className="text-xs text-slate-500 block">per {product.unit_type}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">{product.code || "—"}</TableCell>
                  <TableCell>
                    {product.category ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: product.currency || "USD"
                    }).format(product.unit_price || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} className="mr-1.5" /> Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-base font-medium text-slate-900 mb-1">No products found</p>
                    <p>Get started by adding your first product or service.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
