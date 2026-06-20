import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";
import { getLoggedInOwnerEmail, getBusinessProfile } from "@/app/auth/actions";

interface LineItem {
  item: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
}

interface QuotationData {
  templateId: string;
  quotationNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  customFieldValues?: Record<string, string>;
  liveMappings?: Record<string, { page: number; x: number; y: number }>;
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const email = await getLoggedInOwnerEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const business = await getBusinessProfile(email);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const body: QuotationData = await req.json();
    const { templateId } = body;

    // Fetch template from DB
    const { data: template, error: templateError } = await supabase
      .from("quotation_templates")
      .select("*")
      .eq("id", templateId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (templateError || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Prefer live mappings sent from the editor (always up-to-date).
    // Fall back to DB mappings only if client didn't send live positions.
    // Strip the _customFields metadata key — it's not a real field position.
    const rawMappings: Record<string, any> =
      (body.liveMappings && Object.keys(body.liveMappings).length > 0)
        ? body.liveMappings
        : (template.mappings || {});

    // Remove internal metadata keys before processing
    const mappings: Record<string, { page: number; x: number; y: number }> =
      Object.fromEntries(
        Object.entries(rawMappings).filter(([key]) => !key.startsWith("_"))
      );

    // Load the PDF template file
    const pdfFilePath = path.join(process.cwd(), "public", template.pdf_path);
    let pdfBytes: Buffer;
    try {
      pdfBytes = await fs.readFile(pdfFilePath);
    } catch {
      return NextResponse.json(
        { error: "Template PDF file not found on server" },
        { status: 404 }
      );
    }

    // Load into pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();

    // The editor stores x%,y% as the top-left corner of the draggable chip.
    // PDF.js renders the canvas at: scale = 720 / pdfPageWidth
    // So percentages correctly map to PDF coordinate space at 1:1 aspect ratio.
    //
    // pdf-lib drawText(x, y) places the TEXT BASELINE at (x, y) measured from
    // the BOTTOM-LEFT of the page. We need to:
    //   1. Convert yPct (top-down, %) → PDF y (bottom-up, points)
    //   2. Subtract FONT_SIZE so the baseline is at the visual top of the chip
    //      (otherwise the text renders ABOVE the placed chip position)
    //   3. Add a small chip-padding correction so text centres in the chip height

    const CHIP_TOP_PADDING_PT = 6; // matches py-1.5 ≈ 6pt top padding on the chip
    const CHIP_FONT_SIZE = 10;     // text size inside the chip (10pt)

    function coordsToPdfPoints(
      xPct: number,
      yPct: number,
      pageWidth: number,
      pageHeight: number
    ) {
      const x = (xPct / 100) * pageWidth;
      // yPct is top-down (0% = top); PDF origin is bottom-left.
      // Subtract FONT_SIZE so the baseline aligns with where the chip top is.
      const topFromBottom = pageHeight - (yPct / 100) * pageHeight;
      // Move down by chip padding so text appears inside the chip, not above it
      const y = topFromBottom - CHIP_TOP_PADDING_PT - CHIP_FONT_SIZE;
      return { x, y };
    }

    // Calculate quotation values
    const subtotal = body.lineItems.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (body.taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    // Format helpers
    const fmt = (n: number) =>
      n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // Build field value map
    const fieldValues: Record<string, string> = {
      customer_name: body.customerName,
      customer_address: body.customerAddress,
      customer_phone: body.customerPhone,
      quotation_number: body.quotationNumber,
      date: body.date,
      subtotal: `${fmt(subtotal)}`,
      tax: `${fmt(taxAmount)} (${body.taxRate}%)`,
      grand_total: `${fmt(grandTotal)}`,
      notes: body.notes,
      // Merge in any custom field values
      ...(body.customFieldValues || {}),
    };

    const FONT_SIZE = 10;
    const textColor = rgb(0.1, 0.1, 0.1);

    // Draw each mapped field onto the PDF
    for (const [fieldId, mapping] of Object.entries(mappings)) {
      // Skip item table (handled separately) and any internal metadata keys
      if (fieldId === "item_table" || fieldId.startsWith("_")) continue;

      const value = fieldValues[fieldId];
      if (!value) continue;

      const pageIndex = (mapping.page || 1) - 1;
      if (pageIndex >= pages.length) continue;
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      const { x, y } = coordsToPdfPoints(mapping.x, mapping.y, width, height);

      // Multi-line support for address
      if (fieldId === "customer_address") {
        const lines = value.split(/\n|,\s*/);
        lines.forEach((line, i) => {
          page.drawText(line.trim(), {
            x,
            y: y - i * (FONT_SIZE + 3),
            size: FONT_SIZE,
            font,
            color: textColor,
          });
        });
      } else {
        page.drawText(value, {
          x,
          y,
          size: FONT_SIZE,
          font,
          color: textColor,
        });
      }
    }

    // Draw item table if mapped
    if (mappings.item_table && body.lineItems.length > 0) {
      const mapping = mappings.item_table;
      const pageIndex = (mapping.page || 1) - 1;
      if (pageIndex < pages.length) {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        const { x: tableX, y: tableY } = coordsToPdfPoints(
          mapping.x,
          mapping.y,
          width,
          height
        );

        const colWidths = [80, 160, 40, 80, 50, 80];
        const headers = ["Item", "Description", "Qty", "Unit Price", "Tax%", "Total"];
        const rowHeight = 18;
        const headerFontSize = 9;
        const cellFontSize = 9;
        const headerBg = rgb(0.2, 0.2, 0.2);
        const headerColor = rgb(1, 1, 1);
        const rowBgAlt = rgb(0.96, 0.96, 0.96);
        const cellColor = rgb(0.1, 0.1, 0.1);
        const lineColor = rgb(0.8, 0.8, 0.8);

        let curX = tableX;
        let curY = tableY;

        // Draw header
        colWidths.forEach((colW, ci) => {
          page.drawRectangle({
            x: curX,
            y: curY - rowHeight,
            width: colW,
            height: rowHeight,
            color: headerBg,
          });
          page.drawText(headers[ci], {
            x: curX + 4,
            y: curY - rowHeight + 5,
            size: headerFontSize,
            font: fontBold,
            color: headerColor,
          });
          curX += colW;
        });

        curY -= rowHeight;

        // Draw rows
        body.lineItems.forEach((item, rowIdx) => {
          curX = tableX;
          const rowTotal = item.qty * item.unitPrice * (1 + item.taxRate / 100);
          const cells = [
            item.item,
            item.description,
            String(item.qty),
            fmt(item.unitPrice),
            `${item.taxRate}%`,
            fmt(rowTotal),
          ];

          if (rowIdx % 2 === 1) {
            page.drawRectangle({
              x: tableX,
              y: curY - rowHeight,
              width: colWidths.reduce((a, b) => a + b, 0),
              height: rowHeight,
              color: rowBgAlt,
            });
          }

          // Border line
          page.drawLine({
            start: { x: tableX, y: curY },
            end: { x: tableX + colWidths.reduce((a, b) => a + b, 0), y: curY },
            thickness: 0.5,
            color: lineColor,
          });

          cells.forEach((cell, ci) => {
            const cellText = cell.length > 20 ? cell.substring(0, 20) + "…" : cell;
            page.drawText(cellText, {
              x: curX + 4,
              y: curY - rowHeight + 5,
              size: cellFontSize,
              font,
              color: cellColor,
            });
            curX += colWidths[ci];
          });

          curY -= rowHeight;
        });

        // Bottom border
        page.drawLine({
          start: { x: tableX, y: curY },
          end: { x: tableX + colWidths.reduce((a, b) => a + b, 0), y: curY },
          thickness: 0.5,
          color: lineColor,
        });
      }
    }

    // Save generated PDF
    const generatedUint8 = await pdfDoc.save();
    const generatedBuffer = Buffer.from(generatedUint8);
    const safeName = body.customerName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const timestamp = Date.now();
    const filename = `quotation_${safeName}_${timestamp}.pdf`;
    const savePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "quotations",
      filename
    );
    await fs.writeFile(savePath, generatedBuffer);

    // Save record in DB
    const subtotalCalc = body.lineItems.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    );
    const taxAmountCalc = subtotalCalc * (body.taxRate / 100);
    const grandTotalCalc = subtotalCalc + taxAmountCalc;

    await supabase.from("quotations").insert([
      {
        business_id: business.id,
        template_id: templateId,
        quotation_number: body.quotationNumber,
        customer_name: body.customerName,
        customer_address: body.customerAddress,
        customer_phone: body.customerPhone,
        line_items: body.lineItems,
        subtotal: subtotalCalc,
        tax_rate: body.taxRate,
        tax_amount: taxAmountCalc,
        grand_total: grandTotalCalc,
        notes: body.notes,
        pdf_path: `/uploads/quotations/${filename}`,
      },
    ]);

    // Return the generated PDF as download
    return new NextResponse(generatedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Generate quotation error:", err);
    return NextResponse.json(
      { error: "Failed to generate quotation PDF" },
      { status: 500 }
    );
  }
}
