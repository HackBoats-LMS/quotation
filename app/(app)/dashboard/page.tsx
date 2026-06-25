import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Send, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get business ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user!.id)
    .single();

  const businessId = profile?.business_id;

  // Get Quotation Stats
  const { data: quotations } = await supabase
    .from("quotations")
    .select("status, grand_total, created_at, id, quotation_number, customers(name)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  const totalQuotations = quotations?.length || 0;
  const draftQuotations = quotations?.filter(q => q.status === "Draft").length || 0;
  const sentQuotations = quotations?.filter(q => q.status === "Sent").length || 0;
  const acceptedQuotations = quotations?.filter(q => q.status === "Accepted").length || 0;

  const recentQuotations = quotations?.slice(0, 5) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's an overview of your business.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/templates/new">
            <Button variant="outline" className="rounded-xl">Create Template</Button>
          </Link>
          <Link href="/quotations/new">
            <Button className="rounded-xl">New Quotation</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Quotations" value={totalQuotations} icon={<FileText className="text-blue-600" />} />
        <StatCard title="Drafts" value={draftQuotations} icon={<Clock className="text-slate-600" />} />
        <StatCard title="Sent" value={sentQuotations} icon={<Send className="text-amber-600" />} />
        <StatCard title="Accepted" value={acceptedQuotations} icon={<CheckCircle className="text-emerald-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-slate-200 rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentQuotations.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No quotations yet</p>
                <Link href="/quotations/new" className="text-blue-600 hover:underline mt-2 inline-block">
                  Create your first quotation
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentQuotations.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold">{quote.quotation_number}</p>
                      <p className="text-sm text-slate-500">{(quote.customers as any)?.name || "Unknown Customer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${quote.grand_total?.toFixed(2)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quote.status === "Accepted" ? "bg-emerald-100 text-emerald-800" :
                        quote.status === "Sent" ? "bg-amber-100 text-amber-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-2xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/customers/new" className="block p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors font-medium">
              + Add New Customer
            </Link>
            <Link href="/templates/new" className="block p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors font-medium">
              + Create Template
            </Link>
            <Link href="/settings/business" className="block p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors font-medium">
              ⚙️ Update Business Info
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm border-slate-200 rounded-2xl">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
