"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Builder from "../[id]/Builder";

export default function TemplateWizard({ business, products }: { business: any, products: any[] }) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);

  const [oldBackgrounds, setOldBackgrounds] = useState<string[]>([]);

  useEffect(() => {
    async function loadOldBackgrounds() {
      if (!business?.id) return;
      const { data, error } = await supabase.storage.from('templates').list('backgrounds', {
        search: business.id
      });
      if (data && !error) {
        const files = data.filter(f => f.name && f.name !== '.emptyFolderPlaceholder');
        const bgUrls = files.map(f => {
          return supabase.storage.from('templates').getPublicUrl(`backgrounds/${f.name}`).data.publicUrl;
        });
        setOldBackgrounds(bgUrls);
      }
    }
    loadOldBackgrounds();
  }, [business?.id, supabase]);

  const [config, setConfig] = useState({
    name: "New Quotation Template",
    layout: "A4 Portrait",
    businessInfo: {
      name: business?.name || "",
      email: business?.email || "",
      phone: business?.phone || "",
      address: business?.address || "",
    },
    allowedProducts: products.map(p => p.id), // by default all allowed
    customerFields: [
      { id: "customer_name", label: "Customer Name", type: "text", requirement: "required" },
      { id: "customer_email", label: "Customer Email", type: "email", requirement: "optional" },
      { id: "customer_phone", label: "Customer Phone", type: "phone", requirement: "optional" },
    ],
    canvas_data: { elements: [], settings: { backgroundImage: "" } }
  });

  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${business?.id || 'new'}-${Date.now()}.${fileExt}`;
    const filePath = `backgrounds/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('templates')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      alert("Failed to upload image. Please ensure you have created a public storage bucket named 'templates' in your Supabase dashboard.");
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('templates')
      .getPublicUrl(filePath);

    setConfig(prev => ({
      ...prev,
      canvas_data: {
        ...prev.canvas_data,
        settings: {
          ...prev.canvas_data.settings,
          backgroundImage: publicUrlData.publicUrl
        }
      }
    }));
    setIsUploading(false);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const addCustomField = () => {
    setConfig({
      ...config,
      customerFields: [
        ...config.customerFields,
        { id: `custom_${Date.now()}`, label: "New Field", type: "text", requirement: "optional" }
      ]
    });
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...config.customerFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setConfig({ ...config, customerFields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = [...config.customerFields];
    newFields.splice(index, 1);
    setConfig({ ...config, customerFields: newFields });
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase
      .from("templates")
      .insert([
        { 
          business_id: business.id,
          name: config.name,
          layout: config.layout,
          canvas_data: config
        }
      ]);

    if (error) {
      console.error(error);
      alert("Failed to publish template");
      setIsSaving(false);
      return;
    }

    router.push("/templates");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Wizard Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-bold text-lg">{config.name}</h2>
          <p className="text-sm text-slate-500">Step {step} of 6</p>
        </div>
        <div className="flex gap-2">
          {step > 1 && <Button variant="outline" onClick={prevStep} className="rounded-xl">Back</Button>}
          {step < 6 && <Button onClick={nextStep} className="rounded-xl">Continue</Button>}
          {step === 6 && <Button onClick={handlePublish} disabled={isSaving} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">{isSaving ? "Publishing..." : "Publish Template"}</Button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        {step === 1 && (
          <Card className="w-full max-w-2xl shadow-sm rounded-2xl border-0 h-fit">
            <CardHeader>
              <CardTitle>Step 1: General & Business Information</CardTitle>
              <CardDescription>Set the name of this template and verify the business information that will be exposed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Page Layout</Label>
                <select
                  value={config.layout}
                  onChange={e => setConfig({...config, layout: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4 Portrait">A4 Portrait</option>
                  <option value="A4 Landscape">A4 Landscape</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Background Template (Optional Image)</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                  className="rounded-xl h-10 py-2 cursor-pointer" 
                />
                {isUploading && <p className="text-xs text-blue-500 font-medium">Uploading...</p>}
                {(config.canvas_data as any).settings?.backgroundImage && !isUploading && (
                  <p className="text-xs text-emerald-500 font-medium">✓ Background image uploaded successfully.</p>
                )}
                <p className="text-xs text-slate-500">Upload your company letterhead (A4 size recommended). It will be used as the background of the PDF.</p>
                {oldBackgrounds.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Label className="text-xs text-slate-500 mb-3 block">Or choose a previously uploaded background:</Label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {oldBackgrounds.map((url, idx) => (
                        <div 
                          key={idx} 
                          className={`flex-shrink-0 w-20 h-28 border-2 rounded-lg cursor-pointer overflow-hidden ${
                            (config.canvas_data as any).settings?.backgroundImage === url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              canvas_data: {
                                ...prev.canvas_data,
                                settings: {
                                  ...prev.canvas_data.settings,
                                  backgroundImage: url
                                }
                              }
                            }));
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Old Background" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <hr className="my-4 border-slate-100" />
              <h4 className="font-semibold text-sm">Business Overrides</h4>
              <p className="text-xs text-slate-500 mb-4">You can override your default business details for this specific template.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={config.businessInfo.name} onChange={e => setConfig({...config, businessInfo: {...config.businessInfo, name: e.target.value}})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={config.businessInfo.email} onChange={e => setConfig({...config, businessInfo: {...config.businessInfo, email: e.target.value}})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={config.businessInfo.phone} onChange={e => setConfig({...config, businessInfo: {...config.businessInfo, phone: e.target.value}})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={config.businessInfo.address} onChange={e => setConfig({...config, businessInfo: {...config.businessInfo, address: e.target.value}})} className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="w-full max-w-2xl shadow-sm rounded-2xl border-0 h-fit">
            <CardHeader>
              <CardTitle>Step 2: Product & Service Catalog</CardTitle>
              <CardDescription>Select which products are allowed to be quoted using this template.</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center p-6 text-slate-500">No products found in your catalog. <br/><span className="text-sm">You can add them later via the Products menu.</span></div>
              ) : (
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center space-x-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        id={`prod-${p.id}`} 
                        checked={config.allowedProducts.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({...config, allowedProducts: [...config.allowedProducts, p.id]});
                          } else {
                            setConfig({...config, allowedProducts: config.allowedProducts.filter(id => id !== p.id)});
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Label htmlFor={`prod-${p.id}`} className="flex-1 cursor-pointer font-medium">
                        {p.name} <span className="text-slate-400 font-normal ml-2">{p.code ? `(${p.code})` : ""}</span>
                      </Label>
                      <span className="text-sm font-semibold">${p.unit_price}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="w-full max-w-3xl shadow-sm rounded-2xl border-0 h-fit">
            <CardHeader>
              <CardTitle>Step 3: Customer Information Requirements</CardTitle>
              <CardDescription>Define what information you need to collect from customers when generating a quotation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {config.customerFields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs text-slate-500 uppercase">Field Label</Label>
                      <Input value={field.label} onChange={(e) => updateField(idx, "label", e.target.value)} className="bg-white rounded-lg h-9" />
                    </div>
                    <div className="w-40 space-y-2">
                      <Label className="text-xs text-slate-500 uppercase">Type</Label>
                      <select value={field.type} onChange={(e) => updateField(idx, "type", e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="date">Date</option>
                        <option value="textarea">Text Area</option>
                      </select>
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-xs text-slate-500 uppercase">Requirement</Label>
                      <select value={field.requirement} onChange={(e) => updateField(idx, "requirement", e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm">
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    <div className="pt-6">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => removeField(idx)}>X</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addCustomField} className="w-full rounded-xl border-dashed border-2 py-6">
                + Add Custom Field
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <div className="w-full h-full border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            {/* The Builder.tsx was originally standalone, but we can pass it the full config and an onChange handler. 
                For simplicity, we'll adapt Builder to accept `template` and `onUpdate` props. */}
            <Builder 
              template={{ id: "wizard", layout: config.layout, canvas_data: config.canvas_data }} 
              onUpdate={(canvas_data: any) => setConfig({...config, canvas_data})}
              hideHeader={true}
            />
          </div>
        )}

        {step === 5 && (
          <Card className="w-full max-w-2xl shadow-sm rounded-2xl border-0 h-fit">
            <CardHeader>
              <CardTitle>Step 5: Preview</CardTitle>
              <CardDescription>Review your configuration before publishing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold mb-2">Template Details</h3>
                <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Name:</span> {config.name}</p>
                <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Layout:</span> {config.layout}</p>
                <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Products:</span> {config.allowedProducts.length} selected</p>
                <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Customer Fields:</span> {config.customerFields.length} configured</p>
                <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Canvas Elements:</span> {config.canvas_data.elements.length} added</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 6 && (
          <Card className="w-full max-w-xl shadow-sm rounded-2xl border-0 h-fit text-center p-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <CardTitle className="text-2xl mb-2">Ready to Publish</CardTitle>
            <CardDescription className="mb-8">
              Your template is fully configured. Publishing it will make it available for generating quotations and compatible with future WhatsApp integrations.
            </CardDescription>
            <Button onClick={handlePublish} disabled={isSaving} size="lg" className="rounded-xl px-8 w-full bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? "Publishing..." : "Publish Template"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
