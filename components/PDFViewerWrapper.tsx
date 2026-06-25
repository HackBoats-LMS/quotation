"use client";

import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import QuotationPDF from "./QuotationPDF";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";

export default function PDFViewerWrapper({ quotation, items, business, customer, template }: any) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="h-full flex items-center justify-center">Loading PDF Generator...</div>;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-end">
        <PDFDownloadLink
          document={<QuotationPDF quotation={quotation} items={items} business={business} customer={customer} template={template} />}
          fileName={`Quotation_${quotation.quotation_number}.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading} className="rounded-xl">
              <Download size={18} className="mr-2" />
              {loading ? "Preparing PDF..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      
      <div className="flex-1 border rounded-xl overflow-hidden shadow-sm bg-white min-h-[800px]">
        <PDFViewer width="100%" height="100%" className="border-0">
          <QuotationPDF quotation={quotation} items={items} business={business} customer={customer} template={template} />
        </PDFViewer>
      </div>
    </div>
  );
}
