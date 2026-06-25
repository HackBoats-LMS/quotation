"use client";

import { Document, Page, Text, View, StyleSheet, Image as PDFImage, Font } from "@react-pdf/renderer";

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUJiiGg.ttf'
});

Font.register({
  family: 'Perandory-Condensed',
  src: 'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUJiiGg.ttf' // Using Oswald as a fallback for PDF generation
});

// Default fonts from react-pdf
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  logo: {
    width: 100,
  },
  companyInfo: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1e293b",
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    color: "#64748b",
    fontSize: 10,
  },
  value: {
    fontSize: 11,
  },
  table: {
    marginTop: 20,
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingBottom: 8,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  col1: { width: "40%" },
  col2: { width: "15%", textAlign: "center" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "25%", textAlign: "right" },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 4,
  },
  grandTotal: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  }
});

// A robust variable replacement engine for the PDF
function replaceVariables(text: string, data: any) {
  if (!text) return "";
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    return data[variable.trim()] !== undefined ? data[variable.trim()] : match;
  });
}

export default function QuotationPDF({ quotation, items, business, customer, template }: any) {
  let customFields = {};
  try {
    if (quotation.notes) {
      customFields = JSON.parse(quotation.notes);
    }
  } catch (e) {
    // legacy or text notes
  }

  // Construct a single dictionary for variables
  const dict = {
    ...customFields,
    company_name: business.name,
    company_email: business.email || "",
    company_phone: business.phone || "",
    company_address: business.address || "",
    customer_name: customer.name,
    customer_email: customer.email || "",
    customer_phone: customer.phone || "",
    customer_address: customer.address || "",
    customer_company: customer.company || "",
    quotation_number: quotation.quotation_number,
    quotation_date: new Date(quotation.quotation_date).toLocaleDateString(),
    valid_until: quotation.valid_until_date ? new Date(quotation.valid_until_date).toLocaleDateString() : "",
    subtotal: `Rs. ${quotation.subtotal.toFixed(2)}`,
    tax: `Rs. ${quotation.tax_amount.toFixed(2)}`,
    discount: `Rs. ${quotation.discount_amount.toFixed(2)}`,
    grand_total: `Rs. ${quotation.grand_total.toFixed(2)}`,
  };

  const templateElements = template?.canvas_data?.canvas_data?.elements || template?.canvas_data?.elements || [];
  const templateSettings = template?.canvas_data?.canvas_data?.settings || template?.canvas_data?.settings || {};

  return (
    <Document>
      <Page size={template?.layout === "A4 Landscape" ? "A4" : "A4"} orientation={template?.layout === "A4 Landscape" ? "landscape" : "portrait"} style={[styles.page, { padding: 0, backgroundColor: templateSettings.backgroundColor || '#FFFFFF' }]}>
        {templateSettings.backgroundImage && (
          <PDFImage 
            src={templateSettings.backgroundImage} 
            fixed
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} 
          />
        )}
        
        {/* Render elements based on template layout */}
        {templateElements.length > 0 ? (
          <View style={{ padding: 40, flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
            {templateElements.flatMap((el: any) => {
              const result = [];
              
              if (el.styles?.forceNewLine) {
                result.push(<View key={`break-${el.id}`} style={{ width: "100%", height: 0 }} />);
              }

              const pxToPt = (pxVal: any, defaultPx: number = 0) => {
                if (pxVal === undefined || pxVal === null) return defaultPx * 0.75;
                const parsed = parseInt(pxVal);
                return isNaN(parsed) ? defaultPx * 0.75 : parsed * 0.75;
              };

              const elementWidth = el.styles?.width || "100%";
              const elementHeight = el.styles?.height ? { height: pxToPt(el.styles.height) } : {};
              
              let boxMargins: any = { marginLeft: 0, marginRight: 0 };
              if (el.styles?.boxAlignment === 'center') boxMargins = { marginLeft: 'auto', marginRight: 'auto' };
              if (el.styles?.boxAlignment === 'right') boxMargins = { marginLeft: 'auto', marginRight: 0 };

              let verticalJustify: any = 'flex-start';
              if (el.styles?.displayMode !== 'block') {
                if (el.styles?.verticalAlignment === 'middle') verticalJustify = 'center';
                if (el.styles?.verticalAlignment === 'bottom') verticalJustify = 'flex-end';
              }

              const customMarginTop = el.styles?.marginTop !== undefined ? { marginTop: pxToPt(el.styles.marginTop) } : {};
              const customMarginBottom = el.styles?.marginBottom !== undefined ? { marginBottom: pxToPt(el.styles.marginBottom) } : { marginBottom: pxToPt(20) };
              const customFontFamily = el.styles?.fontFamily || "Helvetica";
              const fontSizePt = pxToPt(el.styles?.fontSize, 16); // Default 16px in builder

              const commonContainerStyles = {
                width: elementWidth,
                ...elementHeight,
                ...boxMargins,
                ...customMarginTop,
                ...customMarginBottom,
                display: 'flex' as const,
                flexDirection: 'column' as const,
                ...(el.styles?.displayMode !== 'block' ? { justifyContent: verticalJustify } : {})
              };

              if (el.type === "text") {
                result.push(
                  <View key={el.id} style={commonContainerStyles}>
                    <Text style={{ fontFamily: customFontFamily, fontSize: fontSizePt, textAlign: el.styles?.textAlign || "left", color: el.styles?.color || '#333', fontWeight: el.styles?.fontWeight === 'bold' ? 'bold' : 'normal' }}>
                      {el.content}
                    </Text>
                  </View>
                );
              } else if (el.type === "variable") {
                const prefix = el.styles?.prefix || "";
                const suffix = el.styles?.suffix || "";
                result.push(
                  <View key={el.id} style={commonContainerStyles}>
                    <Text style={{ fontFamily: customFontFamily, fontSize: fontSizePt, textAlign: el.styles?.textAlign || "left", color: el.styles?.color || '#333', fontWeight: el.styles?.fontWeight === 'bold' ? 'bold' : 'normal' }}>
                      {prefix}{replaceVariables(`{{${el.content}}}`, dict)}{suffix}
                    </Text>
                  </View>
                );
              } else if (el.type === "divider") {
                const dividerHeight = el.styles?.height ? parseInt(el.styles.height) : 2;
                result.push(<View key={el.id} style={{ ...commonContainerStyles, height: dividerHeight, backgroundColor: el.styles?.color || "#e2e8f0", marginTop: 16, marginBottom: 16 }} />);
              } else if (el.type === "table") {
                const headerBg = el.styles?.tableHeaderBg || "#f1f5f9";
                const headerColor = el.styles?.tableHeaderTextColor || "#64748b";
                const rowColor = el.styles?.tableRowTextColor || "#333333";
                const rowBg = el.styles?.tableRowBg || "#ffffff";
                const borderColor = el.styles?.tableBorderColor || "#e2e8f0";
                const borderSize = el.styles?.tableBorderSize !== undefined ? Number(el.styles.tableBorderSize) : 1;
                
                result.push(
                  <View key={el.id} style={[styles.table, commonContainerStyles, { borderColor: borderColor, borderWidth: borderSize, backgroundColor: rowBg }]}>
                    <View style={[styles.tableHeader, { backgroundColor: headerBg, padding: 5, borderBottomColor: borderColor, borderBottomWidth: borderSize }]}>
                      <Text style={[styles.col1, styles.label, { color: headerColor }]}>DESCRIPTION</Text>
                      <Text style={[styles.col2, styles.label, { color: headerColor }]}>QTY</Text>
                      <Text style={[styles.col3, styles.label, { color: headerColor }]}>UNIT PRICE</Text>
                      <Text style={[styles.col4, styles.label, { color: headerColor }]}>AMOUNT</Text>
                    </View>
                    {items.map((item: any) => (
                      <View key={item.id} style={[styles.tableRow, { paddingHorizontal: 5, borderBottomColor: borderColor, borderBottomWidth: borderSize }]}>
                        <Text style={[styles.col1, { color: rowColor }]}>{item.product_name}</Text>
                        <Text style={[styles.col2, { color: rowColor }]}>{item.quantity}</Text>
                      <Text style={[styles.col3, { color: rowColor }]}>Rs. {Number(item.unit_price).toFixed(2)}</Text>
                      <Text style={[styles.col4, { color: rowColor }]}>Rs. {Number(item.line_total).toFixed(2)}</Text>
                      </View>
                    ))}
                    
                    <View style={[styles.totals, { paddingHorizontal: 5, borderTopColor: borderColor, borderTopWidth: borderSize }]}>
                      <View style={styles.totalRow}>
                        <Text style={[styles.label, { color: headerColor }]}>SUBTOTAL</Text>
                        <Text style={[styles.value, { color: rowColor }]}>{dict.subtotal}</Text>
                      </View>
                      {quotation.discount_amount > 0 && (
                        <View style={styles.totalRow}>
                          <Text style={[styles.label, { color: headerColor }]}>DISCOUNT</Text>
                          <Text style={[styles.value, { color: rowColor }]}>-{dict.discount}</Text>
                        </View>
                      )}
                      {quotation.tax_amount > 0 && (
                        <View style={styles.totalRow}>
                          <Text style={[styles.label, { color: headerColor }]}>TAX</Text>
                          <Text style={[styles.value, { color: rowColor }]}>{dict.tax}</Text>
                        </View>
                      )}
                      <View style={[styles.totalRow, styles.grandTotal, { borderTopColor: borderColor, borderTopWidth: borderSize }]}>
                        <Text style={{ color: rowColor }}>TOTAL DUE</Text>
                        <Text style={{ color: rowColor }}>{dict.grand_total}</Text>
                      </View>
                    </View>
                  </View>
                );
              }
              
              return result;
            })}
          </View>
        ) : (
          // Fallback Default Layout if template is empty
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>QUOTATION</Text>
                <Text style={styles.label}>Quote No: <Text style={styles.value}>{quotation.quotation_number}</Text></Text>
                <Text style={styles.label}>Date: <Text style={styles.value}>{dict.quotation_date}</Text></Text>
              </View>
              <View style={styles.companyInfo}>
                <Text style={{ fontWeight: "bold", fontSize: 14 }}>{dict.company_name}</Text>
                {dict.company_email && <Text>{dict.company_email}</Text>}
                {dict.company_phone && <Text>{dict.company_phone}</Text>}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>QUOTATION FOR:</Text>
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>{dict.customer_name}</Text>
              {dict.customer_company && <Text>{dict.customer_company}</Text>}
              {dict.customer_email && <Text>{dict.customer_email}</Text>}
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.col1, styles.label]}>DESCRIPTION</Text>
                <Text style={[styles.col2, styles.label]}>QTY</Text>
                <Text style={[styles.col3, styles.label]}>UNIT PRICE</Text>
                <Text style={[styles.col4, styles.label]}>AMOUNT</Text>
              </View>
              {items.map((item: any) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.col1}>{item.product_name}</Text>
                  <Text style={styles.col2}>{item.quantity}</Text>
                  <Text style={styles.col3}>Rs. {Number(item.unit_price).toFixed(2)}</Text>
                  <Text style={styles.col4}>Rs. {Number(item.line_total).toFixed(2)}</Text>
                </View>
              ))}
              
              <View style={styles.totals}>
                <View style={styles.totalRow}>
                  <Text style={styles.label}>SUBTOTAL</Text>
                  <Text style={styles.value}>{dict.subtotal}</Text>
                </View>
                {quotation.discount_amount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.label}>DISCOUNT</Text>
                    <Text style={styles.value}>-{dict.discount}</Text>
                  </View>
                )}
                {quotation.tax_amount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.label}>TAX</Text>
                    <Text style={styles.value}>{dict.tax}</Text>
                  </View>
                )}
                <View style={[styles.totalRow, styles.grandTotal]}>
                  <Text>TOTAL DUE</Text>
                  <Text>{dict.grand_total}</Text>
                </View>
              </View>
            </View>
          </>
        )}

      </Page>
    </Document>
  );
}
