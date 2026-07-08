"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { saveTemplateSettings, uploadBackgroundFile, deleteBackgroundFile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, LayoutTemplate, Image as ImageIcon, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PDFViewerWrapper from "@/components/PDFViewerWrapper";

const TEMPLATES = [
  { id: "Classic", name: "Classic", description: "Traditional business look" },
  { id: "Modern", name: "Modern", description: "Clean lines with modern typography" },
  { id: "Minimal", name: "Minimal", description: "Simple, elegant, and distraction-free" },
  { id: "Bold", name: "Bold", description: "Strong headings and contrasts" },
];

export default function TemplateSettings({ business, existingTemplate }: { business: any, existingTemplate?: any }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [layout, setLayout] = useState(existingTemplate?.layout || "Classic");
  const [backgroundUrl, setBackgroundUrl] = useState(existingTemplate?.background_url || "");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset the input value so the onChange event fires even if the user selects the exact same file again
    e.target.value = '';

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${business?.id || 'new'}-${Date.now()}.${fileExt}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);

    try {
      // We use a Server Action to upload so we bypass any Supabase RLS restrictions automatically
      const result = await uploadBackgroundFile(formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      setBackgroundUrl(result.url);
      
      // Auto-save the new background to the database so it persists on reload
      await saveTemplateSettings({
        businessId: business.id,
        templateId: existingTemplate?.id,
        layout,
        backgroundUrl: result.url as string
      });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload image. Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBackground = async () => {
    if (!backgroundUrl) return;
    if (!confirm("Are you sure you want to permanently delete this background image?")) return;
    
    setIsUploading(true);
    try {
      // The public URL looks like: .../storage/v1/object/public/templates/backgrounds/filename.jpg
      const urlParts = backgroundUrl.split('/templates/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1]; // e.g. backgrounds/filename.jpg
        await deleteBackgroundFile(filePath);
      }
      setBackgroundUrl("");
      // Auto-save the removal to the database so it doesn't come back on reload
      await saveTemplateSettings({
        businessId: business.id,
        templateId: existingTemplate?.id,
        layout,
        backgroundUrl: ""
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to delete image", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await saveTemplateSettings({
      businessId: business.id,
      templateId: existingTemplate?.id,
      layout,
      backgroundUrl
    });

    if (!result.success) {
      console.error(result.error);
      alert("Failed to save template: " + result.error);
    } else {
      alert("Template settings saved successfully!");
      router.refresh();
    }

    setIsSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-8 space-y-8 pb-20">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotation Template</h1>
          <p className="text-slate-500 mt-1">Choose a layout and upload your letterhead to be used for all quotations.</p>
        </div>
        <div className="flex gap-3">

          <Button onClick={handleSave} disabled={isSaving || isUploading || !backgroundUrl} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            {isSaving ? "Saving..." : "Save Template Settings"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Settings */}
        <div className="lg:col-span-1 space-y-8">
          {/* Layout Selection */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>1. Choose Layout</CardTitle>
            <CardDescription>Select a layout style for how the quotation content will be formatted.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setLayout(t.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    layout === t.id 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {layout === t.id && (
                    <div className="absolute top-3 right-3 text-blue-600">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                    <LayoutTemplate className="text-slate-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Background Upload */}
        <Card className="rounded-2xl border border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>2. Upload Background (Letterhead)</CardTitle>
            <CardDescription>Upload an A4 image containing your logo and company details to be used as the background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors">
              {!backgroundUrl ? (
                <>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <ImageIcon className="text-slate-400" size={32} />
                  </div>
                  <div className="text-center space-y-2">
                    <Label className="cursor-pointer">
                      <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                    </Label>
                    <p className="text-xs text-slate-500">PNG, JPG up to 10MB (A4 size recommended)</p>
                  </div>
                </>
              ) : (
                <div className="relative w-full max-w-sm mx-auto aspect-[1/1.414] rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  <img src={backgroundUrl} alt="Template Background" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteBackground}
                      disabled={isUploading}
                      className="text-xs h-8 rounded-full px-4 shadow-sm"
                    >
                      Delete Image
                    </Button>
                  </div>
                </div>
              )}
              {isUploading && (
                <p className="text-sm text-blue-600 font-medium mt-4 animate-pulse">Uploading image...</p>
              )}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden min-h-[800px]">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center text-lg">
                <Eye className="w-5 h-5 mr-2 text-slate-400" />
                Live Preview
              </CardTitle>
              <CardDescription>Changes to layout and background update instantly below.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-slate-100/50 relative">
              <div className="absolute inset-0">
                <PDFViewerWrapper 
                  key={layout + backgroundUrl}
                  quotation={{
                    quotation_number: "QT-PREVIEW",
                    quotation_date: new Date().toISOString(),
                    grand_total: 1050,
                    tax_amount: 50,
                    subtotal: 1000,
                    notes: "This is a live preview."
                  }}
                  items={[
                    { description: "Web Development Services", quantity: 1, unit_price: 800, line_total: 800 },
                    { description: "Hosting Setup", quantity: 1, unit_price: 200, line_total: 200 }
                  ]}
                  business={business || {
                    name: "Your Business Name",
                    owner_name: "Your Name",
                    email: "contact@business.com",
                    phone: "+1 234 567 890",
                    address: "123 Business St, City",
                  }}
                  customer={{
                    name: "John Doe",
                    address: "456 Customer Ave, Town",
                    email: "john@example.com"
                  }}
                  template={{
                    layout: layout,
                    background_url: backgroundUrl
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
