"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Search } from "lucide-react";

type QuotationItem = {
  id: string;
  product_id?: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_amount: number;
  discount_percentage?: number;
};

export default function QuotationForm({ customers, templates, products, business }: { customers: any[], templates: any[], products: any[], business: any }) {
  const [customerId, setCustomerId] = useState(customers.length === 0 ? "new" : "");
  const [templateId, setTemplateId] = useState(templates.length > 0 ? templates[0].id : "");
  const [quotationNumber, setQuotationNumber] = useState(`QT-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
  const [validUntil, setValidUntil] = useState("");
  
  // Custom template fields
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  
  const [globalTaxRate, setGlobalTaxRate] = useState(business?.default_tax_rate || 0);
  const [globalDiscountRate, setGlobalDiscountRate] = useState(business?.default_discount_rate || 0);

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const selectedTemplate = templates.find(t => t.id === templateId);
  const activeCustomerFields = selectedTemplate?.canvas_data?.customerFields?.filter((f: any) => f.requirement !== "hidden") || [];
  const allowedProductIds = selectedTemplate?.canvas_data?.allowedProducts || products.map(p => p.id);
  const availableProducts = products.filter(p => allowedProductIds.includes(p.id));

  // When customer changes, try to auto-fill known fields
  useEffect(() => {
    if (customerId && customerId !== "new") {
      const cust = customers.find(c => c.id === customerId);
      if (cust) {
        setCustomFieldsData(prev => ({
          ...prev,
          customer_name: cust.name,
          customer_email: cust.email || "",
          customer_phone: cust.phone || "",
        }));
      }
    }
  }, [customerId, customers]);

  const handleCustomFieldChange = (id: string, value: any) => {
    setCustomFieldsData({ ...customFieldsData, [id]: value });
  };

  const handleItemChange = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      return { ...item, [field]: value };
    }));
  };

  const addBlankItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      product_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      discount_amount: 0,
    }]);
  };

  const addProductToQuotation = (product: any) => {
    setItems([...items, {
      id: Date.now().toString() + Math.random(),
      product_id: product.id,
      product_name: product.name,
      description: product.description || "",
      quantity: 1,
      unit_price: product.unit_price,
      tax_rate: 0,
      discount_amount: 0,
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const calculateTotalDiscount = () => calculateSubtotal() * (Number(globalDiscountRate) / 100);
  const calculateTotalTax = () => {
    const subAfterDiscount = calculateSubtotal() - calculateTotalDiscount();
    return Math.max(0, subAfterDiscount * (Number(globalTaxRate) / 100));
  };
  const calculateGrandTotal = () => calculateSubtotal() - calculateTotalDiscount() + calculateTotalTax();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !templateId) {
      alert("Please select a customer and a template");
      return;
    }
    
    setLoading(true);

    let finalCustomerId = customerId;

    // Handle creating a new customer on the fly
    if (customerId === "new") {
      const { data: newCust, error: newCustError } = await supabase
        .from("customers")
        .insert([{
          business_id: business.id,
          name: customFieldsData.customer_name || "New Customer",
          email: customFieldsData.customer_email || null,
          phone: customFieldsData.customer_phone || null,
        }])
        .select()
        .single();
      
      if (newCustError) {
        console.error("Error creating customer:", newCustError);
        alert("Error creating new customer. Please try again.");
        setLoading(false);
        return;
      }
      
      finalCustomerId = newCust.id;
    }

    const subtotal = calculateSubtotal();
    const discount_amount = calculateTotalDiscount();
    const tax_amount = calculateTotalTax();
    const grand_total = calculateGrandTotal();

    const { data: quotationData, error: quotationError } = await supabase
      .from("quotations")
      .insert([{
        business_id: business.id,
        customer_id: finalCustomerId,
        template_id: templateId,
        quotation_number: quotationNumber,
        valid_until_date: validUntil || null,
        subtotal,
        tax_amount,
        discount_amount,
        grand_total,
        notes: JSON.stringify(customFieldsData) // Store custom requirement data here or in a dedicated field
      }])
      .select()
      .single();

    if (quotationError) {
      console.error(quotationError);
      alert("Error creating quotation");
      setLoading(false);
      return;
    }

    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        quotation_id: quotationData.id,
        product_name: item.product_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: 0,
        discount_amount: 0,
        line_total: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error(itemsError);
        alert("Error saving items");
      }
    }

    router.push(`/quotations/${quotationData.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="space-y-2">
              <Label>Customer *</Label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select a customer</option>
                <option value="new" className="font-semibold text-blue-600">+ Create New Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Quotation Number</Label>
              <Input value={quotationNumber} onChange={(e) => setQuotationNumber(e.target.value)} required className="rounded-xl font-mono" />
            </div>

            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          {customerId === "new" && (
            <>
              <hr className="my-6 border-slate-100" />
              <h4 className="font-semibold text-sm mb-4">New Customer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input 
                    required 
                    className="rounded-xl"
                    value={customFieldsData.customer_name || ""}
                    onChange={(e) => handleCustomFieldChange("customer_name", e.target.value)}
                    placeholder="E.g. Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    className="rounded-xl"
                    value={customFieldsData.customer_email || ""}
                    onChange={(e) => handleCustomFieldChange("customer_email", e.target.value)}
                    placeholder="contact@acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    type="tel"
                    className="rounded-xl"
                    value={customFieldsData.customer_phone || ""}
                    onChange={(e) => handleCustomFieldChange("customer_phone", e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </>
          )}

          {activeCustomerFields.length > 0 && (
            <>
              <hr className="my-6 border-slate-100" />
              <h4 className="font-semibold text-sm mb-4">Required Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCustomerFields.map((field: any) => (
                  <div key={field.id} className="space-y-2">
                    <Label>{field.label} {field.requirement === "required" && "*"}</Label>
                    {field.type === "textarea" ? (
                      <textarea
                        required={field.requirement === "required"}
                        className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm min-h-[80px]"
                        value={customFieldsData[field.id] || ""}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      />
                    ) : field.type === "date" ? (
                      <Input
                        type="date"
                        required={field.requirement === "required"}
                        className="rounded-xl"
                        value={customFieldsData[field.id] || ""}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        required={field.requirement === "required"}
                        className="rounded-xl"
                        value={customFieldsData[field.id] || ""}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold">Products & Services</h3>
        </div>
        
        {/* Product Catalog Picker */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
          <div className="text-sm font-medium text-slate-500 whitespace-nowrap">Catalog:</div>
          {availableProducts.length === 0 ? (
            <span className="text-sm text-slate-400">No products available.</span>
          ) : (
            availableProducts.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => addProductToQuotation(p)}
                className="whitespace-nowrap px-3 py-1.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
              >
                + {p.name}
              </button>
            ))
          )}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Item Name</th>
                  <th className="px-4 py-3 font-medium w-24">Qty</th>
                  <th className="px-4 py-3 font-medium w-32">Unit Price</th>
                  <th className="px-6 py-3 font-medium text-right w-32">Total</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Add products from the catalog above or create a custom line item.
                    </td>
                  </tr>
                )}
                {items.map((item) => {
                  const lineTotal = item.quantity * item.unit_price;
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50/50">
                      <td className="px-6 py-3">
                        <Input placeholder="Product name" value={item.product_name} onChange={(e) => handleItemChange(item.id, "product_name", e.target.value)} required className="rounded-lg h-9" />
                      </td>
                      <td className="px-4 py-3">
                        <Input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))} required className="rounded-lg h-9" />
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          type="number" min="0" step="0.01" value={item.unit_price} 
                          onChange={(e) => handleItemChange(item.id, "unit_price", Number(e.target.value))} 
                          required 
                          readOnly={!!item.product_id}
                          className={`rounded-lg h-9 ${item.product_id ? "bg-slate-50 text-slate-500 border-slate-200" : ""}`} 
                        />
                      </td>
                      <td className="px-6 py-3 text-right font-medium">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity" onClick={() => removeItem(item.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addBlankItem} className="rounded-xl text-slate-600">
              <PlusCircle size={16} className="mr-2" />
              Add Blank Line Item
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Card className="w-full md:w-80 rounded-2xl shadow-sm border-slate-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            {globalDiscountRate > 0 && (
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Discount ({globalDiscountRate}%)</span>
                <span>-₹{calculateTotalDiscount().toFixed(2)}</span>
              </div>
            )}
            
            {globalTaxRate > 0 && (
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Tax ({globalTaxRate}%)</span>
                <span>₹{calculateTotalTax().toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span>₹{calculateGrandTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" size="lg" className="rounded-xl px-8" disabled={loading || items.length === 0}>
          {loading ? "Generating..." : "Generate Quotation"}
        </Button>
      </div>
    </form>
  );
}
