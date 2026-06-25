import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PDFViewerWrapper from "@/components/PDFViewerWrapper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function QuotationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch all necessary details for PDF Generation
  const { data: quotation } = await supabase
    .from("quotations")
    .select("*, customers(*), businesses(*), templates(*)")
    .eq("id", params.id)
    .single();

  if (!quotation) {
    return <div className="p-8">Quotation not found.</div>;
  }

  const { data: items } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", quotation.id);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/quotations" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2">
            <ArrowLeft size={16} className="mr-2" />
            Back to Quotations
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Quotation {quotation.quotation_number}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            quotation.status === "Accepted" ? "bg-emerald-100 text-emerald-800" :
            quotation.status === "Sent" ? "bg-amber-100 text-amber-800" :
            "bg-slate-100 text-slate-800"
          }`}>
            {quotation.status}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[800px]">
        <PDFViewerWrapper 
          quotation={quotation} 
          items={items || []} 
          business={quotation.businesses}
          customer={quotation.customers}
          template={quotation.templates}
        />
      </div>
    </div>
  );
}
