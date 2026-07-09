"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, FileSpreadsheet } from "lucide-react";
import { importProducts } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProductImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const validProducts = results.data.filter((row: any) => 
            row.name || row.Name || row.description || row.Description
          );
          
          if (validProducts.length === 0) {
            alert("No valid products found in CSV. Please ensure you have a 'name' or 'description' column.");
            return;
          }

          const res = await importProducts(validProducts);
          if (res.success) {
            alert(`Successfully imported ${res.count} products!`);
            setIsOpen(false);
          }
        } catch (error: any) {
          console.error("Import error:", error);
          alert("Error importing products: " + error.message);
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input
          }
        }
      },
      error: (error) => {
        alert("Error parsing CSV: " + error.message);
        setIsLoading(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
        <UploadCloud className="w-4 h-4" />
        Import CSV
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV file exported from Excel or Google Sheets.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-600 mb-4">
          <p className="font-semibold text-slate-800 mb-2">Required Columns:</p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li><span className="font-medium text-slate-700">Name</span> (or Description)</li>
          </ul>
          
          <p className="font-semibold text-slate-800 mb-2">Optional Columns:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium text-slate-700">Price</span> (or unit_price)</li>
            <li><span className="font-medium text-slate-700">SKU</span> (or Code)</li>
            <li><span className="font-medium text-slate-700">Category</span></li>
            <li><span className="font-medium text-slate-700">Unit</span> (e.g., Piece, Box)</li>
            <li><span className="font-medium text-slate-700">Currency</span> (e.g., USD, INR)</li>
          </ul>
        </div>

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <DialogFooter>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {isLoading ? "Uploading & Importing..." : "Select CSV File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
