"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  FileDown,
} from "lucide-react";

interface LineItem {
  item: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
}

interface CustomFieldDef {
  id: string;
  label: string;
}

interface GenerateModalProps {
  templateId: string;
  templateName: string;
  customFieldDefs: CustomFieldDef[];
  liveMappings: Record<string, { page: number; x: number; y: number }>;
  onClose: () => void;
}

const defaultItem = (): LineItem => ({
  item: "",
  description: "",
  qty: 1,
  unitPrice: 0,
  taxRate: 0,
});

const INPUT_CLASS =
  "mt-1.5 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:bg-zinc-950";

const LABEL_CLASS =
  "block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";

export default function GenerateModal({
  templateId,
  templateName,
  customFieldDefs,
  liveMappings,
  onClose,
}: GenerateModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    quotationNumber: `QT-${Date.now().toString().slice(-6)}`,
    date: today,
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    notes: "",
    taxRate: 0,
  });

  // Custom field values keyed by field id
  const [customValues, setCustomValues] = useState<Record<string, string>>(
    Object.fromEntries(customFieldDefs.map((f) => [f.id, ""]))
  );

  const [lineItems, setLineItems] = useState<LineItem[]>([defaultItem()]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(100);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Derived totals
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (form.taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomValueChange = (id: string, value: string) => {
    setCustomValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => setLineItems((prev) => [...prev, defaultItem()]);

  const removeItem = (index: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== index));

  const handleGenerate = async () => {
    if (!form.customerName.trim()) {
      setError("Please enter the customer name.");
      return;
    }
    if (lineItems.some((item) => !item.item.trim())) {
      setError("Please fill in the item name for all line items.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const payload = {
        templateId,
        ...form,
        taxRate: Number(form.taxRate),
        lineItems: lineItems.map((item) => ({
          ...item,
          qty: Number(item.qty),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
        })),
        customFieldValues: customValues,
        companyLogo: logoBase64,
        logoScale: logoScale,
        // Pass current live field positions from the editor so the API
        // always uses the latest placements, even without a DB save
        liveMappings,
      };

      const res = await fetch("/api/generate-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate PDF");
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation_${form.quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm px-4 py-8">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Generate Quotation
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Using template:{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {templateName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta Info Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Quotation Number</label>
              <input
                name="quotationNumber"
                type="text"
                value={form.quotationNumber}
                onChange={handleFormChange}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Date</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Customer Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Customer Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="customerName"
                  type="text"
                  value={form.customerName}
                  onChange={handleFormChange}
                  placeholder="Acme Corp"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Phone</label>
                  <input
                    name="customerPhone"
                    type="text"
                    value={form.customerPhone}
                    onChange={handleFormChange}
                    placeholder="+1 555 000 1234"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Address</label>
                  <input
                    name="customerAddress"
                    type="text"
                    value={form.customerAddress}
                    onChange={handleFormChange}
                    placeholder="123 Main St, City"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields Section — only shown if any exist */}
          {customFieldDefs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                Custom Fields
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {customFieldDefs.map((field) => (
                  <div key={field.id}>
                    <label className={LABEL_CLASS}>{field.label}</label>
                    <input
                      type="text"
                      value={customValues[field.id] ?? ""}
                      onChange={(e) =>
                        handleCustomValueChange(field.id, e.target.value)
                      }
                      placeholder={`Enter ${field.label}`}
                      className={INPUT_CLASS}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logo Upload Section - only shown if company_logo is mapped */}
          {liveMappings.company_logo && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                Company Logo
              </h3>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleLogoUpload}
                className={INPUT_CLASS}
              />
              {logoBase64 && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={LABEL_CLASS}>Logo Size</label>
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{logoScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={logoScale}
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-50"
                  />
                  <p className="mt-1 text-[10px] text-zinc-500">Adjust the slider to scale your logo in the generated PDF.</p>
                </div>
              )}
            </div>
          )}

          {/* Line Items Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Line Items
              </h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Column headers */}
                <div className="grid grid-cols-[2fr_3fr_60px_100px_70px_32px] gap-px bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-2">Item</div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-2">Description</div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-2">Qty</div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-2">Unit Price</div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-2">Tax %</div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-1 py-2"></div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[2fr_3fr_60px_100px_70px_32px] gap-px bg-zinc-100 dark:bg-zinc-800"
                    >
                      <input
                        value={item.item}
                        onChange={(e) => handleItemChange(idx, "item", e.target.value)}
                        placeholder="Item name"
                        className="min-w-0 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:bg-blue-50 dark:focus:bg-zinc-900"
                      />
                      <input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(idx, "description", e.target.value)
                        }
                        placeholder="Description"
                        className="min-w-0 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:bg-blue-50 dark:focus:bg-zinc-900"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", parseFloat(e.target.value) || 0)
                        }
                        className="min-w-0 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:bg-blue-50 dark:focus:bg-zinc-900"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="min-w-0 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:bg-blue-50 dark:focus:bg-zinc-900"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.5"
                        value={item.taxRate}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "taxRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="min-w-0 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:bg-blue-50 dark:focus:bg-zinc-900"
                      />
                      <button
                        onClick={() => removeItem(idx)}
                        disabled={lineItems.length === 1}
                        className="flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes + Totals */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="w-full sm:flex-1">
              <label className={LABEL_CLASS}>Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Payment terms, delivery notes, etc."
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:bg-zinc-950 resize-none"
              />
            </div>

            <div className="w-full sm:w-64 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {fmt(subtotal)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 shrink-0">
                  Tax Rate %
                </span>
                <input
                  name="taxRate"
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={form.taxRate}
                  onChange={handleFormChange}
                  className="w-16 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-right text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Tax</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {fmt(taxAmount)}
                </span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Grand Total
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {fmt(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5" />
                Generate &amp; Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
