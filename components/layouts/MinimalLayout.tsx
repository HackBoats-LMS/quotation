import { Text, View } from "@react-pdf/renderer";

export default function MinimalLayout({ quotation, items, dict, hasBackground }: any) {
  return (
    <View style={{ paddingHorizontal: 60, backgroundColor: hasBackground ? 'transparent' : '#ffffff', fontFamily: "Helvetica" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: hasBackground ? "flex-end" : "space-between", marginBottom: 60 }}>
        {!hasBackground && (
          <View style={{ display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 14, color: "#334155", marginBottom: 8 }}>{dict.company_name}</Text>
            {dict.company_email && <Text style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{dict.company_email}</Text>}
            {dict.company_phone && <Text style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{dict.company_phone}</Text>}
            {dict.company_address && <Text style={{ fontSize: 10, color: "#94a3b8" }}>{dict.company_address}</Text>}
          </View>
        )}
        <View style={{ display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 24, color: "#94a3b8", letterSpacing: 2, marginBottom: 16 }}>QUOTATION</Text>
          <Text style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Quote #{quotation.quotation_number}</Text>
          <Text style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{dict.quotation_date}</Text>
          {dict.valid_until && <Text style={{ fontSize: 10, color: "#64748b" }}>Valid until {dict.valid_until}</Text>}
        </View>
      </View>

      {/* For */}
      <View style={{ marginBottom: 60 }}>
        <Text style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>PREPARED FOR</Text>
        <Text style={{ fontSize: 16, color: "#334155", marginBottom: 4 }}>{dict.customer_name}</Text>
        {dict.customer_company && <Text style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>{dict.customer_company}</Text>}
        {dict.customer_email && <Text style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>{dict.customer_email}</Text>}
        {dict.customer_address && <Text style={{ fontSize: 10, color: "#64748b" }}>{dict.customer_address}</Text>}
      </View>

      {/* Table - No Borders */}
      <View style={{ marginBottom: 40 }}>
        <View style={{ flexDirection: "row", paddingBottom: 16 }}>
          <Text style={{ width: "50%", fontSize: 9, color: "#94a3b8", letterSpacing: 1 }}>DESCRIPTION</Text>
          <Text style={{ width: "15%", fontSize: 9, color: "#94a3b8", letterSpacing: 1, textAlign: "center" }}>QTY</Text>
          <Text style={{ width: "15%", fontSize: 9, color: "#94a3b8", letterSpacing: 1, textAlign: "right" }}>PRICE</Text>
          <Text style={{ width: "20%", fontSize: 9, color: "#94a3b8", letterSpacing: 1, textAlign: "right" }}>TOTAL</Text>
        </View>
        
        {items.map((item: any, index: number) => (
          <View key={item.id || index} style={{ flexDirection: "row", paddingVertical: 12 }} wrap={false}>
            <Text style={{ width: "50%", fontSize: 11, color: "#334155" }}>{item.product_name || item.description}</Text>
            <Text style={{ width: "15%", fontSize: 11, color: "#64748b", textAlign: "center" }}>{item.quantity}</Text>
            <Text style={{ width: "15%", fontSize: 11, color: "#64748b", textAlign: "right" }}>Rs. {Number(item?.unit_price || 0).toFixed(2)}</Text>
            <Text style={{ width: "20%", fontSize: 11, color: "#334155", textAlign: "right" }}>Rs. {Number(item?.line_total || item?.total_price || 0).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={{ alignItems: "flex-end" }}>
        <View style={{ width: "40%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
            <Text style={{ fontSize: 10, color: "#94a3b8" }}>Subtotal</Text>
            <Text style={{ fontSize: 10, color: "#334155" }}>{dict.subtotal}</Text>
          </View>
          {quotation.discount_amount > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
              <Text style={{ fontSize: 10, color: "#94a3b8" }}>Discount</Text>
              <Text style={{ fontSize: 10, color: "#334155" }}>-{dict.discount}</Text>
            </View>
          )}
          {quotation.tax_amount > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
              <Text style={{ fontSize: 10, color: "#94a3b8" }}>Tax</Text>
              <Text style={{ fontSize: 10, color: "#334155" }}>{dict.tax}</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 16, marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: "#94a3b8" }}>Total</Text>
            <Text style={{ fontSize: 16, color: "#334155" }}>{dict.grand_total}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 60, left: 60, right: 60 }} fixed>
        <Text style={{ fontSize: 9, color: "#cbd5e1", textAlign: "center" }}>Thank you for your business. {dict.company_name}</Text>
      </View>
    </View>
  );
}
