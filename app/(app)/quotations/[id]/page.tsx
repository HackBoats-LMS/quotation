import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PDFViewerWrapper from "@/components/PDFViewerWrapper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function QuotationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/auth/login");
  }

  // Fetch quotation and relation data via Prisma
  const quotation = await prisma.quotations.findUnique({
    where: { id: params.id },
    include: {
      business: true,
      template: true,
      items: true,
      customer: true,
    }
  });

  if (!quotation) {
    return <div className="p-8">Quotation not found.</div>;
  }

  let parsedLineItems = [];
  try {
    if (typeof quotation.line_items === 'string') {
      parsedLineItems = JSON.parse(quotation.line_items);
    } else if (Array.isArray(quotation.line_items)) {
      parsedLineItems = quotation.line_items;
    }
  } catch (e) {
    parsedLineItems = [];
  }

  const itemsToUse = quotation.items && quotation.items.length > 0 ? quotation.items : parsedLineItems;

  const customerData = quotation.customer || {
    name: quotation.customer_name || "",
    address: quotation.customer_address || "",
    email: "",
    phone: quotation.customer_phone || "",
  };

  // Foolproof serialization for Next.js Client Components
  const serializedQuotation = JSON.parse(JSON.stringify({
    ...quotation,
    quotation_date: quotation.created_at
  }));
  
  const serializedItems = JSON.parse(JSON.stringify(itemsToUse));
  const serializedBusiness = JSON.parse(JSON.stringify(quotation.business));
  const serializedCustomer = JSON.parse(JSON.stringify(customerData));
  const serializedTemplate = JSON.parse(JSON.stringify(quotation.template));

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
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800`}>
            Sent
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[800px]">
        <PDFViewerWrapper 
          quotation={serializedQuotation} 
          items={serializedItems} 
          business={serializedBusiness}
          customer={serializedCustomer}
          template={serializedTemplate}
        />
      </div>
    </div>
  );
}
