"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { updateGlobalSettings } from "./actions";

export default function GlobalSettingsForm({ 
  initialTaxRate, 
  initialDiscountRate 
}: { 
  initialTaxRate: number, 
  initialDiscountRate: number 
}) {
  const [tax, setTax] = useState(initialTaxRate);
  const [discount, setDiscount] = useState(initialDiscountRate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    try {
      await updateGlobalSettings(tax, discount);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border-slate-200 mb-8 bg-slate-50/50">
      <CardContent className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-slate-900">Global Quotation Defaults</h3>
            <p className="text-sm text-slate-500">Set the default tax and discount percentage applied to all new quotations.</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="space-y-2 w-32">
              <Label htmlFor="tax_rate">Default Tax (%)</Label>
              <Input 
                id="tax_rate" 
                type="number" 
                step="0.1" 
                min="0" 
                value={tax} 
                onChange={(e) => setTax(Number(e.target.value))} 
                className="bg-white rounded-xl"
              />
            </div>
            
            <div className="space-y-2 w-32">
              <Label htmlFor="discount_rate">Default Discount (%)</Label>
              <Input 
                id="discount_rate" 
                type="number" 
                step="0.1" 
                min="0" 
                value={discount} 
                onChange={(e) => setDiscount(Number(e.target.value))} 
                className="bg-white rounded-xl"
              />
            </div>
            
            <Button type="submit" disabled={saving} className="rounded-xl h-10 px-6 mt-6">
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
