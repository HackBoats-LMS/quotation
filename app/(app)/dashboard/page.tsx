import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Send, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    console.log("Redirecting to login because no Supabase or NextAuth user found!");
    redirect("/auth/login");
  }

  // Get business ID
  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
    select: { id: true, name: true },
  });

  const businessId = business?.id;

  if (!businessId) {
    // If they logged in but haven't onboarded
    redirect("/onboarding");
  }

  // Get Quotation Stats
  const quotationsList = await prisma.quotations.findMany({
    where: { business_id: businessId },
    select: {
      id: true,
      quotation_number: true,
      customer_name: true,
      grand_total: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });

  const totalQuotations = quotationsList.length || 0;
  
  // Since the new schema does not have a status field, we'll just mock these for now,
  // or default to Draft. The /api doesn't seem to insert a status field.
  const draftQuotations = totalQuotations; 
  const sentQuotations = 0;
  const acceptedQuotations = 0;

  const recentQuotations = quotationsList.slice(0, 5) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {business.name}! Here's an overview of your business.</p>
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
                      <p className="text-sm text-slate-500">{quote.customer_name || "Unknown Customer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${quote.grand_total?.toNumber().toFixed(2)}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Draft
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
