import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import QuotationForm from "@/components/QuotationForm";

export default async function NewQuotationPage() {
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/auth/login");
  }

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
  });

  if (!business) {
    redirect("/onboarding");
  }

  const templates = await prisma.quotation_templates.findMany({
    where: { business_id: business.id },
  });

  const customers = await prisma.customers.findMany({
    where: { business_id: business.id },
  });

  const products = await prisma.products.findMany({
    where: { business_id: business.id },
  });

  // Serialize Prisma models containing Decimals to plain objects for the Client Component
  const serializedCustomers = JSON.parse(JSON.stringify(customers));
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedBusiness = JSON.parse(JSON.stringify(business));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Quotation</h1>
        <p className="text-slate-500 mt-1">Generate a new quotation from your templates.</p>
      </div>

      <QuotationForm 
        customers={serializedCustomers} 
        templates={templates || []} 
        products={serializedProducts}
        business={serializedBusiness}
      />
    </div>
  );
}
