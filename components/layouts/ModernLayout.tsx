import { Text, View } from "@react-pdf/renderer";

export default function ModernLayout({ quotation, items, dict, hasBackground }: any) {
  return (
    <View style={{ height: "100%", backgroundColor: hasBackground ? 'transparent' : '#ffffff', fontFamily: "Helvetica" }}>
      {/* Header Block */}
      <View style={{ backgroundColor: hasBackground ? 'transparent' : '#f1f8f6', padding: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {!hasBackground && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <View style={{ marginBottom: 4 }}><Text style={{ color: '#94a3b8', fontSize: 10 }}>Quotation by</Text></View>
            <View style={{ marginBottom: 2 }}><Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0f172a' }}>{dict.company_name}</Text></View>
            {dict.company_address && <View style={{ marginTop: 2 }}><Text style={{ color: '#475569', fontSize: 9 }}>{dict.company_address}</Text></View>}
            {dict.company_email && <View style={{ marginTop: 2 }}><Text style={{ color: '#475569', fontSize: 9 }}>{dict.company_email}</Text></View>}
          </View>
        )}
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#10b981', letterSpacing: 1, textTransform: 'uppercase' }}>QUOTATION</Text>
        </View>
      </View>

      {/* Details Area */}
      <View style={{ padding: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Billed To */}
        <View style={{ width: '45%', display: 'flex', flexDirection: 'column' }}>
          <View style={{ backgroundColor: '#f1f8f6', paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 8 }}>
            <Text style={{ color: '#10b981', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' }}>Billed to</Text>
          </View>
          <View style={{ borderLeftWidth: 2, borderLeftColor: '#10b981', paddingLeft: 10, display: 'flex', flexDirection: 'column' }}>
            <View style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold', fontSize: 14, color: '#0f172a' }}>{dict.customer_name}</Text></View>
            {dict.customer_address && <View style={{ marginBottom: 2 }}><Text style={{ color: '#475569', fontSize: 10 }}>{dict.customer_address}</Text></View>}
            {dict.customer_email && <View><Text style={{ color: '#475569', fontSize: 10 }}>{dict.customer_email}</Text></View>}
          </View>
        </View>
        
        {/* Quotation Details */}
        <View style={{ width: '45%', display: 'flex', flexDirection: 'column' }}>
          <View style={{ backgroundColor: '#f1f8f6', paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 8 }}>
            <Text style={{ color: '#10b981', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' }}>Quotation Details</Text>
          </View>
          <View style={{ borderLeftWidth: 2, borderLeftColor: '#10b981', paddingLeft: 10, display: 'flex', flexDirection: 'column' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#0f172a', fontSize: 10, fontWeight: 'bold' }}>Quotation #</Text>
              <Text style={{ color: '#475569', fontSize: 10 }}>{quotation.quotation_number}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#0f172a', fontSize: 10, fontWeight: 'bold' }}>Quotation Date</Text>
              <Text style={{ color: '#475569', fontSize: 10 }}>{dict.quotation_date}</Text>
            </View>
            {dict.valid_until && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#0f172a', fontSize: 10, fontWeight: 'bold' }}>Due Date</Text>
                <Text style={{ color: '#475569', fontSize: 10 }}>{dict.valid_until}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Table */}
      <View style={{ paddingHorizontal: 40, display: 'flex', flexDirection: 'column' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#10b981', padding: 12 }}>
          <Text style={{ width: '45%', color: '#ffffff', fontWeight: 'bold', fontSize: 10 }}>Item #/Item description</Text>
          <Text style={{ width: '15%', color: '#ffffff', fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>Qty.</Text>
          <Text style={{ width: '20%', color: '#ffffff', fontWeight: 'bold', fontSize: 10, textAlign: 'right' }}>Rate</Text>
          <Text style={{ width: '20%', color: '#ffffff', fontWeight: 'bold', fontSize: 10, textAlign: 'right' }}>Amount</Text>
        </View>
        {items.map((item: any, index: number) => (
          <View key={item.id || index} style={{ flexDirection: 'row', padding: 12, backgroundColor: index % 2 === 0 ? '#ffffff' : '#f1f8f6' }}>
            <Text style={{ width: '45%', color: '#0f172a', fontSize: 10 }}>{index + 1}.  {item.product_name || item.description}</Text>
            <Text style={{ width: '15%', color: '#0f172a', fontSize: 10, textAlign: 'center' }}>{item.quantity}</Text>
            <Text style={{ width: '20%', color: '#0f172a', fontSize: 10, textAlign: 'right' }}>Rs. {Number(item?.unit_price || 0).toFixed(2)}</Text>
            <Text style={{ width: '20%', color: '#0f172a', fontSize: 10, textAlign: 'right' }}>Rs. {Number(item?.line_total || item?.total_price || 0).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={{ paddingHorizontal: 40, marginTop: 20, alignItems: 'flex-end', display: 'flex', flexDirection: 'column' }}>
        <View style={{ width: '45%', display: 'flex', flexDirection: 'column' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
            <Text style={{ color: '#0f172a', fontSize: 12 }}>Sub Total</Text>
            <Text style={{ color: '#0f172a', fontSize: 12 }}>{dict.subtotal}</Text>
          </View>
          {quotation.discount_amount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: '#0f172a', fontSize: 12 }}>Discount</Text>
              <Text style={{ color: '#0f172a', fontSize: 12 }}>-{dict.discount}</Text>
            </View>
          )}
          {quotation.tax_amount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: '#0f172a', fontSize: 12 }}>Tax</Text>
              <Text style={{ color: '#0f172a', fontSize: 12 }}>{dict.tax}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8 }}>
            <Text style={{ color: '#475569', fontSize: 16 }}>Total</Text>
            <Text style={{ color: '#10b981', fontSize: 20, fontWeight: 'bold' }}>{dict.grand_total}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#f1f8f6', padding: 40, display: 'flex', flexDirection: 'column' }}>
        <View style={{ marginBottom: 8 }}><Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 10 }}>Terms and Conditions</Text></View>
        <View style={{ marginBottom: 4 }}><Text style={{ color: '#475569', fontSize: 8 }}>1. Please pay within 15 days from the date of invoice.</Text></View>
        <View style={{ marginBottom: 12 }}><Text style={{ color: '#475569', fontSize: 8 }}>2. Please quote invoice number when remitting funds.</Text></View>
        
        <View style={{ marginBottom: 8 }}><Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 10 }}>Additional Notes</Text></View>
        <View style={{ marginBottom: 12 }}><Text style={{ color: '#475569', fontSize: 8, lineHeight: 1.5 }}>{dict.company_email ? `Thank you for your business. For any enquiries, email us on ${dict.company_email}.` : "Thank you for your business. Please contact us for any enquiries."}</Text></View>
      </View>
    </View>
  );
}
