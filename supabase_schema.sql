-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Businesses Table
create table public.businesses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    email text,
    phone text,
    address text,
    website text,
    tax_number text,
    currency text default 'USD',
    default_tax_rate numeric(5,2) default 0,
    default_discount_rate numeric(5,2) default 0,
    logo_url text,
    authorized_signature_url text,
    company_stamp_url text,
    terms_and_conditions text,
    payment_instructions text,
    bank_details text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 3. Profiles Table (Extends auth.users and links to businesses)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    business_id uuid references public.businesses(id) on delete cascade not null,
    full_name text,
    role text default 'admin',
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 4. Products Table (NEW)
create table public.products (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references public.businesses(id) on delete cascade not null,
    name text not null,
    code text,
    description text,
    category text,
    unit_price numeric(10,2) default 0 not null,
    currency text default 'USD',
    tax_percentage numeric(5,2) default 0,
    discount_percentage numeric(5,2) default 0,
    unit_type text default 'Piece', -- Piece, Hour, Day, Month, Project, Custom
    is_active boolean default true,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 5. Customers Table
create table public.customers (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references public.businesses(id) on delete cascade not null,
    name text not null,
    email text,
    phone text,
    company text,
    address text,
    notes text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 6. Templates Table (UPDATED to support 6-step flow and custom requirements)
create table public.templates (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references public.businesses(id) on delete cascade not null,
    name text not null,
    layout text default 'A4 Portrait',
    canvas_data jsonb default '{}'::jsonb not null, -- Now holds full configuration (products, requirements, layout, PDF JSON)
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 7. Quotations Table
create table public.quotations (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references public.businesses(id) on delete cascade not null,
    customer_id uuid references public.customers(id) on delete set null,
    template_id uuid references public.templates(id) on delete set null,
    quotation_number text not null,
    status text default 'Draft',
    quotation_date date default CURRENT_DATE,
    valid_until_date date,
    subtotal numeric(10,2) default 0,
    tax_amount numeric(10,2) default 0,
    discount_amount numeric(10,2) default 0,
    grand_total numeric(10,2) default 0,
    notes text,
    terms text,
    pdf_url text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 8. Quotation Items Table
create table public.quotation_items (
    id uuid primary key default uuid_generate_v4(),
    quotation_id uuid references public.quotations(id) on delete cascade not null,
    product_name text not null,
    description text,
    quantity numeric(10,2) default 1 not null,
    unit_price numeric(10,2) default 0 not null,
    tax_rate numeric(5,2) default 0,
    discount_amount numeric(10,2) default 0,
    line_total numeric(10,2) default 0 not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 9. Documents (Uploads Metadata - actual files in storage bucket)
create table public.documents (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references public.businesses(id) on delete cascade not null,
    file_name text not null,
    file_type text,
    file_url text not null,
    created_at timestamp with time zone default now() not null
);

-- Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_quotation_items_updated_at BEFORE UPDATE ON public.quotation_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS)

-- Helper function to get current user's business_id
CREATE OR REPLACE FUNCTION get_current_business_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Businesses RLS
CREATE POLICY "Users can view their own business" ON public.businesses FOR SELECT USING (id = get_current_business_id());
CREATE POLICY "Users can update their own business" ON public.businesses FOR UPDATE USING (id = get_current_business_id());

-- Helper RPC to create business and profile bypassing RLS chicken-and-egg
CREATE OR REPLACE FUNCTION create_business_and_profile(
    p_name text,
    p_email text,
    p_phone text,
    p_address text,
    p_website text,
    p_tax_number text,
    p_currency text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_business_id uuid;
BEGIN
    INSERT INTO public.businesses (name, email, phone, address, website, tax_number, currency)
    VALUES (p_name, p_email, p_phone, p_address, p_website, p_tax_number, p_currency)
    RETURNING id INTO v_business_id;

    INSERT INTO public.profiles (id, business_id, role)
    VALUES (auth.uid(), v_business_id, 'owner')
    ON CONFLICT (id) DO UPDATE SET business_id = EXCLUDED.business_id, role = EXCLUDED.role;

    RETURN v_business_id;
END;
$$;

-- Profiles RLS
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Products RLS
CREATE POLICY "Business scoped select" ON public.products FOR SELECT USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped insert" ON public.products FOR INSERT WITH CHECK (business_id = get_current_business_id());
CREATE POLICY "Business scoped update" ON public.products FOR UPDATE USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped delete" ON public.products FOR DELETE USING (business_id = get_current_business_id());

-- Customers RLS
CREATE POLICY "Business scoped select" ON public.customers FOR SELECT USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped insert" ON public.customers FOR INSERT WITH CHECK (business_id = get_current_business_id());
CREATE POLICY "Business scoped update" ON public.customers FOR UPDATE USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped delete" ON public.customers FOR DELETE USING (business_id = get_current_business_id());

-- Templates RLS
CREATE POLICY "Business scoped select" ON public.templates FOR SELECT USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped insert" ON public.templates FOR INSERT WITH CHECK (business_id = get_current_business_id());
CREATE POLICY "Business scoped update" ON public.templates FOR UPDATE USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped delete" ON public.templates FOR DELETE USING (business_id = get_current_business_id());

-- Quotations RLS
CREATE POLICY "Business scoped select" ON public.quotations FOR SELECT USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped insert" ON public.quotations FOR INSERT WITH CHECK (business_id = get_current_business_id());
CREATE POLICY "Business scoped update" ON public.quotations FOR UPDATE USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped delete" ON public.quotations FOR DELETE USING (business_id = get_current_business_id());

-- Quotation Items RLS (through quotation's business_id)
CREATE POLICY "Business scoped select" ON public.quotation_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_items.quotation_id AND q.business_id = get_current_business_id())
);
CREATE POLICY "Business scoped insert" ON public.quotation_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_items.quotation_id AND q.business_id = get_current_business_id())
);
CREATE POLICY "Business scoped update" ON public.quotation_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_items.quotation_id AND q.business_id = get_current_business_id())
);
CREATE POLICY "Business scoped delete" ON public.quotation_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_items.quotation_id AND q.business_id = get_current_business_id())
);

-- Documents RLS
CREATE POLICY "Business scoped select" ON public.documents FOR SELECT USING (business_id = get_current_business_id());
CREATE POLICY "Business scoped insert" ON public.documents FOR INSERT WITH CHECK (business_id = get_current_business_id());
CREATE POLICY "Business scoped delete" ON public.documents FOR DELETE USING (business_id = get_current_business_id());
