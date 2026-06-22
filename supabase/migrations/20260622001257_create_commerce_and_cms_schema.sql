-- Velin Studio: profiles, commerce, CMS

CREATE TYPE public.order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

CREATE TYPE public.payment_method AS ENUM ('cod');

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  line1 text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text NOT NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cod',
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL CHECK (subtotal >= 0),
  shipping numeric NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  total numeric NOT NULL CHECK (total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  qty integer NOT NULL CHECK (qty > 0),
  color text,
  size text
);

CREATE TABLE IF NOT EXISTS public.post_categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS public.posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  cover text,
  category_id text NOT NULL REFERENCES public.post_categories(id) ON DELETE RESTRICT,
  tags text[] NOT NULL DEFAULT '{}',
  author text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  product_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq bigint;
BEGIN
  SELECT count(*) + 1 INTO seq FROM public.orders;
  RETURN 'VS-' || lpad(seq::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    'customer'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
