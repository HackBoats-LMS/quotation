create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    business_id uuid references public.businesses(id) on delete cascade not null,
    full_name text,
    role text default 'admin',
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

CREATE OR REPLACE FUNCTION get_current_business_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

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
