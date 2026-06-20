-- Run this SQL in your Supabase SQL Editor to create the quotations table.
-- Navigate to: Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run

CREATE TABLE IF NOT EXISTS quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES quotation_templates(id) ON DELETE SET NULL,
  quotation_number TEXT,
  customer_name TEXT,
  customer_address TEXT,
  customer_phone TEXT,
  line_items JSONB DEFAULT '[]',
  subtotal NUMERIC(12, 2) DEFAULT 0,
  tax_rate NUMERIC(6, 2) DEFAULT 0,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  grand_total NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own business quotations
CREATE POLICY "Users can view their business quotations"
  ON quotations FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_email = auth.email()
  ));

CREATE POLICY "Users can insert their business quotations"
  ON quotations FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE owner_email = auth.email()
  ));

CREATE POLICY "Users can delete their business quotations"
  ON quotations FOR DELETE
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_email = auth.email()
  ));
