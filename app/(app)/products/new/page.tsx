"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "",
    unit_price: 0,
    currency: "USD",
    unit_type: "Piece",
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === "number") {
      finalValue = parseFloat(value) || 0;
    }
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProduct(formData);
      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Products
      </Link>

      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Product or Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product/Service Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code (SKU)</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleChange} className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Consulting, Software..." className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_type">Unit Type</Label>
                <select
                  id="unit_type"
                  name="unit_type"
                  value={formData.unit_type}
                  onChange={handleChange}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="Piece">Piece</option>
                  <option value="Hour">Hour</option>
                  <option value="Day">Day</option>
                  <option value="Month">Month</option>
                  <option value="Project">Project</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input id="unit_price" name="unit_price" type="number" step="0.01" min="0" value={formData.unit_price} onChange={handleChange} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" value={formData.currency} onChange={handleChange} className="rounded-xl" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={loading}>
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
