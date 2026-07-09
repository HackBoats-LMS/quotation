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
import GlobalSettingsForm from "./GlobalSettingsForm";
import ProductImport from "./ProductImport";

export default async function ProductsPage() {
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) redirect("/auth/login");

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail }
  });

  if (!business?.id) redirect("/onboarding");

  const products = await prisma.products.findMany({
    where: { business_id: business.id },
    orderBy: { name: "asc" }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your product catalog and pricing</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <ProductImport />
          <Link href="/products/new" className="flex-1 md:flex-none">
            <Button className="rounded-xl shadow-sm w-full">
              <Plus size={18} className="mr-2" />
              Add New
            </Button>
          </Link>
        </div>
      </div>

      <GlobalSettingsForm 
        initialTaxRate={business?.default_tax_rate ? Number(business.default_tax_rate) : 0} 
        initialDiscountRate={business?.default_discount_rate ? Number(business.default_discount_rate) : 0} 
      />

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-[600px]">
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
                    }).format(Number(product.unit_price) || 0)}
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
