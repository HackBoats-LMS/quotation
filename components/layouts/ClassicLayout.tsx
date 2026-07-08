import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 20,
  },
  companyInfo: {
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontWeight: "bold",
    color: "#64748b",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 10,
    color: "#0f172a",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "#f8fafc",
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: "#475569",
    fontSize: 9,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingBottom: 12,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  col1: { width: "45%", paddingLeft: 8 },
  col2: { width: "15%", textAlign: "center" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right", paddingRight: 8 },
  totals: {
    marginTop: 24,
    alignItems: "flex-end",
    paddingRight: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "45%",
    paddingVertical: 6,
  },
  grandTotal: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#cbd5e1",
    color: "#0f172a",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  }
});

export default function ClassicLayout({ quotation, items, dict, hasBackground }: any) {
  return (
    <View style={{ padding: 50, height: "100%", fontFamily: "Helvetica", backgroundColor: hasBackground ? 'transparent' : '#ffffff' }}>
      <View style={[styles.header, hasBackground ? { borderBottomWidth: 0 } : {}]}>
        {!hasBackground && (
          <View style={[styles.companyInfo, { alignItems: "flex-start" }]}>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.companyName}>{dict.company_name}</Text>
            </View>
            {dict.company_email && <View style={{ marginBottom: 2 }}><Text style={styles.companyDetails}>{dict.company_email}</Text></View>}
            {dict.company_phone && <View style={{ marginBottom: 2 }}><Text style={styles.companyDetails}>{dict.company_phone}</Text></View>}
            {dict.company_address && <View style={{ marginBottom: 2 }}><Text style={styles.companyDetails}>{dict.company_address}</Text></View>}
          </View>
        )}
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: "flex-end", flex: 1 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.title}>QUOTATION</Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.label}>QUOTE NO: <Text style={styles.value}>{quotation.quotation_number}</Text></Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.label}>DATE: <Text style={styles.value}>{dict.quotation_date}</Text></Text>
          </View>
          {dict.valid_until && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.label}>VALID UNTIL: <Text style={styles.value}>{dict.valid_until}</Text></Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>QUOTATION FOR:</Text>
        <Text style={{ fontWeight: "bold", fontSize: 14, color: "#0f172a", marginTop: 6 }}>{dict.customer_name}</Text>
        {dict.customer_company && <Text style={{ color: "#334155", marginTop: 2 }}>{dict.customer_company}</Text>}
        {dict.customer_email && <Text style={{ color: "#334155", marginTop: 2 }}>{dict.customer_email}</Text>}
        {dict.customer_address && <Text style={{ color: "#334155", marginTop: 2 }}>{dict.customer_address}</Text>}
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col1]}>DESCRIPTION</Text>
          <Text style={[styles.tableHeaderCell, styles.col2]}>QTY</Text>
          <Text style={[styles.tableHeaderCell, styles.col3]}>UNIT PRICE</Text>
          <Text style={[styles.tableHeaderCell, styles.col4]}>AMOUNT</Text>
        </View>
        {items.map((item: any, index: number) => (
          <View key={item.id || index} style={styles.tableRow}>
            <Text style={[styles.col1, { color: "#0f172a", fontWeight: "bold" }]}>{item.product_name || item.description}</Text>
            <Text style={[styles.col2, { color: "#334155" }]}>{item.quantity}</Text>
            <Text style={[styles.col3, { color: "#334155" }]}>Rs. {Number(item?.unit_price || 0).toFixed(2)}</Text>
            <Text style={[styles.col4, { color: "#0f172a", fontWeight: "bold" }]}>Rs. {Number(item?.line_total || item?.total_price || 0).toFixed(2)}</Text>
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
            <Text style={{ color: "#0f172a" }}>TOTAL DUE</Text>
            <Text style={{ color: "#0f172a" }}>{dict.grand_total}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your business.</Text>
        {dict.company_name && <Text style={{ marginTop: 4 }}>{dict.company_name} • {dict.company_email || ''}</Text>}
      </View>
    </View>
  );
}
