import { Text, View } from "@react-pdf/renderer";

export default function BoldLayout({ quotation, items, dict, hasBackground }: any) {
  return (
    <View style={{ padding: 40, height: "100%", backgroundColor: hasBackground ? 'transparent' : '#ffffff', fontFamily: "Helvetica" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: hasBackground ? "flex-end" : "space-between", borderBottomWidth: hasBackground ? 0 : 4, borderBottomColor: "#000000", paddingBottom: 20, marginBottom: 30 }}>
        {!hasBackground && (
          <View style={{ display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000000", textTransform: "uppercase", marginBottom: 4 }}>{dict.company_name}</Text>
            {dict.company_email && <Text style={{ fontSize: 10, color: "#000000", fontWeight: "bold" }}>{dict.company_email}</Text>}
            {dict.company_phone && <Text style={{ fontSize: 10, color: "#000000", fontWeight: "bold" }}>{dict.company_phone}</Text>}
            {dict.company_address && <Text style={{ fontSize: 10, color: "#000000", fontWeight: "bold" }}>{dict.company_address}</Text>}
          </View>
        )}
        <View style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 36, fontWeight: "bold", color: "#000000", letterSpacing: -1, textTransform: "uppercase" }}>QUOTATION</Text>
        </View>
      </View>

      {/* Grid Meta */}
      <View style={{ flexDirection: "row", borderTopWidth: 2, borderBottomWidth: 2, borderColor: "#000000", marginBottom: 30, marginTop: hasBackground ? 60 : 0 }}>
        <View style={{ width: "33.3%", padding: 10, borderRightWidth: 2, borderColor: "#000000", display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 }}>Quote Number</Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>{quotation.quotation_number}</Text>
        </View>
        <View style={{ width: "33.3%", padding: 10, borderRightWidth: 2, borderColor: "#000000", display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 }}>Date</Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>{dict.quotation_date}</Text>
        </View>
        <View style={{ width: "33.3%", padding: 10, display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 }}>Valid Until</Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>{dict.valid_until || "N/A"}</Text>
        </View>
      </View>

      {/* Billed To */}
      <View style={{ borderWidth: 2, borderColor: "#000000", padding: 20, marginBottom: 30, display: 'flex', flexDirection: 'column' }}>
        <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", backgroundColor: "#000000", color: "#ffffff", paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12 }}>BILLED TO</Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000000", marginBottom: 4 }}>{dict.customer_name}</Text>
        {dict.customer_company && <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000000" }}>{dict.customer_company}</Text>}
        {dict.customer_email && <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000000" }}>{dict.customer_email}</Text>}
        {dict.customer_address && <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000000" }}>{dict.customer_address}</Text>}
      </View>

      {/* Table */}
      <View style={{ borderWidth: 2, borderColor: "#000000", marginBottom: 30 }}>
        <View style={{ flexDirection: "row", backgroundColor: "#000000", padding: 10 }}>
          <Text style={{ width: "50%", color: "#ffffff", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>DESCRIPTION</Text>
          <Text style={{ width: "15%", color: "#ffffff", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", textAlign: "center" }}>QTY</Text>
          <Text style={{ width: "15%", color: "#ffffff", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", textAlign: "right" }}>RATE</Text>
          <Text style={{ width: "20%", color: "#ffffff", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", textAlign: "right" }}>AMOUNT</Text>
        </View>
        
        {items.map((item: any, index: number) => (
          <View key={item.id || index} style={{ flexDirection: "row", padding: 10, borderBottomWidth: index === items.length - 1 ? 0 : 2, borderBottomColor: "#000000" }}>
            <Text style={{ width: "50%", color: "#000000", fontSize: 12, fontWeight: "bold" }}>{item.product_name || item.description}</Text>
            <Text style={{ width: "15%", color: "#000000", fontSize: 12, fontWeight: "bold", textAlign: "center" }}>{item.quantity}</Text>
            <Text style={{ width: "15%", color: "#000000", fontSize: 12, fontWeight: "bold", textAlign: "right" }}>Rs. {Number(item?.unit_price || 0).toFixed(2)}</Text>
            <Text style={{ width: "20%", color: "#000000", fontSize: 12, fontWeight: "bold", textAlign: "right" }}>Rs. {Number(item?.line_total || item?.total_price || 0).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={{ alignItems: "flex-end" }}>
        <View style={{ width: "50%", borderWidth: 2, borderColor: "#000000" }}>
          <View style={{ flexDirection: "row", padding: 10, borderBottomWidth: 2, borderBottomColor: "#000000" }}>
            <Text style={{ width: "50%", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>SUBTOTAL</Text>
            <Text style={{ width: "50%", fontSize: 12, fontWeight: "bold", textAlign: "right" }}>{dict.subtotal}</Text>
          </View>
          {quotation.discount_amount > 0 && (
            <View style={{ flexDirection: "row", padding: 10, borderBottomWidth: 2, borderBottomColor: "#000000" }}>
              <Text style={{ width: "50%", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>DISCOUNT</Text>
              <Text style={{ width: "50%", fontSize: 12, fontWeight: "bold", textAlign: "right" }}>-{dict.discount}</Text>
            </View>
          )}
          {quotation.tax_amount > 0 && (
            <View style={{ flexDirection: "row", padding: 10, borderBottomWidth: 2, borderBottomColor: "#000000" }}>
              <Text style={{ width: "50%", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>TAX</Text>
              <Text style={{ width: "50%", fontSize: 12, fontWeight: "bold", textAlign: "right" }}>{dict.tax}</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", padding: 15, backgroundColor: "#000000" }}>
            <Text style={{ width: "40%", fontSize: 14, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase" }}>TOTAL</Text>
            <Text style={{ width: "60%", fontSize: 18, fontWeight: "bold", color: "#ffffff", textAlign: "right" }}>{dict.grand_total}</Text>
          </View>
        </View>
      </View>
      
    </View>
  );
}
