import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Builder from "./Builder";

export default async function TemplateBuilderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!template) {
    return <div className="p-8 text-center text-red-500">Template not found or access denied.</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="h-14 border-b border-slate-200 bg-white flex items-center px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">{template.name}</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{template.layout}</span>
        </div>
        {/* Save button will be managed by client component */}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Builder template={template} />
      </div>
    </div>
  );
}
