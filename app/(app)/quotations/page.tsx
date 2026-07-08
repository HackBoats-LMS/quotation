import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, FileText } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "./DeleteButton";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function QuotationsPage() {
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/auth/login");
  }

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
    select: { id: true }
  });

  if (!business) {
    redirect("/onboarding");
  }

  const quotations = await prisma.quotations.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: "desc" }
  });

  const deleteQuotation = async (id: string) => {
    "use server";
    await prisma.quotations.delete({ where: { id } });
    revalidatePath("/quotations");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-slate-500 mt-1">Manage and track your generated quotations.</p>
        </div>
        <Link href="/quotations/new">
          <Button className="rounded-xl">
            <PlusCircle className="mr-2" size={18} />
            New Quotation
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input placeholder="Search quotations by number or customer..." className="pl-10 rounded-xl" />
      </div>

      {!quotations || quotations.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent rounded-2xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No quotations found</h3>
            <p className="text-slate-500 mb-4">Create your first quotation and send it to a customer.</p>
            <Link href="/quotations/new">
              <Button variant="outline" className="rounded-xl">Create Quotation</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Quote No.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{quote.quotation_number}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(quote.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-500">{quote.customer_name || "Unknown"}</td>
                  <td className="px-6 py-4 font-medium">${quote.grand_total?.toNumber().toFixed(2)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-4 items-center">
                    <Link href={`/quotations/${quote.id}`} className="text-blue-600 hover:underline font-medium">
                      View
                    </Link>
                    <DeleteButton id={quote.id} onDelete={deleteQuotation} />
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
