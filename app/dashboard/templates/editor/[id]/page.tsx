import { redirect } from "next/navigation";
import { getLoggedInOwnerEmail, getBusinessProfile } from "@/app/auth/actions";
import { getTemplateById } from "../../actions";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const email = await getLoggedInOwnerEmail();

  // Enforce session login check
  if (!email) {
    redirect("/login");
  }

  // Enforce business setup completion check
  const business = await getBusinessProfile(email);
  if (!business) {
    redirect("/business-setup");
  }

  // Fetch specific template metadata
  const template = await getTemplateById(id, business.id);
  if (!template) {
    redirect("/dashboard/templates");
  }

  return (
    <EditorClient 
      template={{
        id: template.id,
        name: template.name,
        pdf_path: template.pdf_path,
        mappings: template.mappings || {},
      }} 
    />
  );
}
