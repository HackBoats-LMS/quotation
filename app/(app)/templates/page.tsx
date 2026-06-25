import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutTemplate } from "lucide-react";
import Link from "next/link";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user!.id)
    .single();

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("business_id", profile?.business_id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-slate-500 mt-1">Manage your custom quotation templates.</p>
        </div>
        <Link href="/templates/new">
          <Button className="rounded-xl">
            <PlusCircle className="mr-2" size={18} />
            Create Template
          </Button>
        </Link>
      </div>

      {!templates || templates.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent rounded-2xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <LayoutTemplate className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No templates found</h3>
            <p className="text-slate-500 mb-4">Create your first template to start generating beautiful quotations.</p>
            <Link href="/templates/new">
              <Button variant="outline" className="rounded-xl">Create Template</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Link key={template.id} href={`/templates/${template.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-2xl border-slate-200">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.layout}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[1/1.414] bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 relative overflow-hidden">
                    <LayoutTemplate className="text-slate-300" size={48} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
