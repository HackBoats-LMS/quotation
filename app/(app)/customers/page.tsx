import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Users } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user!.id)
    .single();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", profile?.business_id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-slate-500 mt-1">Manage your clients and their quotation history.</p>
        </div>
        <Link href="/customers/new">
          <Button className="rounded-xl">
            <PlusCircle className="mr-2" size={18} />
            Add Customer
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input placeholder="Search customers..." className="pl-10 rounded-xl" />
      </div>

      {!customers || customers.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent rounded-2xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No customers yet</h3>
            <p className="text-slate-500 mb-4">Add your first customer to generate quotations for them.</p>
            <Link href="/customers/new">
              <Button variant="outline" className="rounded-xl">Add Customer</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{customer.name}</td>
                  <td className="px-6 py-4 text-slate-500">{customer.company || "-"}</td>
                  <td className="px-6 py-4 text-slate-500">{customer.email || "-"}</td>
                  <td className="px-6 py-4 text-slate-500">{customer.phone || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/customers/${customer.id}`} className="text-blue-600 hover:underline font-medium">
                      View
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
