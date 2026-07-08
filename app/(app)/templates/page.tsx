import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TemplateSettings from "./TemplateSettings";

export default async function TemplatesPage() {
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/auth/login");
  }

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail }
  });

  if (!business) {
    redirect("/onboarding");
  }

  // Fetch the first template for this business, if any
  const templates = await prisma.quotation_templates.findMany({
    where: { business_id: business.id },
    orderBy: { created_at: "asc" },
    take: 1
  });

  const existingTemplate = templates && templates.length > 0 ? templates[0] : null;

  // Pass plain objects to client component
  const plainBusiness = {
    id: business.id,
    name: business.name
  };

  const plainTemplate = existingTemplate ? {
    id: existingTemplate.id,
    layout: (existingTemplate.mappings as any)?.layout || "Classic",
    background_url: (existingTemplate.mappings as any)?.background_url || ""
  } : null;

  return (
    <TemplateSettings business={plainBusiness} existingTemplate={plainTemplate} />
  );
}
