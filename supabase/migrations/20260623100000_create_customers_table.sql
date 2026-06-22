-- Dedicated customers table with automatic sync on signup and checkout

CREATE TYPE public.customer_type AS ENUM ('registered', 'guest');

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  email_normalized text NOT NULL,
  name text NOT NULL DEFAULT '',
  phone text,
  type public.customer_type NOT NULL DEFAULT 'guest',
  order_count integer NOT NULL DEFAULT 0 CHECK (order_count >= 0),
  total_spent numeric NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  last_order_at timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customers_email_normalized_unique UNIQUE (email_normalized)
);

CREATE INDEX IF NOT EXISTS customers_type_idx ON public.customers (type);
CREATE INDEX IF NOT EXISTS customers_last_order_idx ON public.customers (last_order_at DESC NULLS LAST);

CREATE OR REPLACE FUNCTION public.normalize_customer_email(p_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(trim(p_email));
$$;

CREATE OR REPLACE FUNCTION public.refresh_customer_stats_for_email(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm text := public.normalize_customer_email(p_email);
  v_customer public.customers%ROWTYPE;
  v_order_count integer;
  v_total_spent numeric;
  v_last_order_at timestamptz;
BEGIN
  SELECT * INTO v_customer FROM public.customers WHERE email_normalized = v_norm;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT
    count(*)::integer,
    coalesce(sum(total), 0),
    max(created_at)
  INTO v_order_count, v_total_spent, v_last_order_at
  FROM public.orders
  WHERE status <> 'cancelled'
    AND (
      public.normalize_customer_email(customer_email) = v_norm
      OR (v_customer.user_id IS NOT NULL AND user_id = v_customer.user_id)
    );

  UPDATE public.customers
  SET
    order_count = v_order_count,
    total_spent = v_total_spent,
    last_order_at = v_last_order_at,
    updated_at = now()
  WHERE id = v_customer.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_customer_record(
  p_user_id uuid,
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_refresh_stats boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm text := public.normalize_customer_email(p_email);
  v_customer_id uuid;
  v_type public.customer_type;
BEGIN
  IF v_norm IS NULL OR v_norm = '' THEN
    RETURN NULL;
  END IF;

  v_type := CASE WHEN p_user_id IS NOT NULL THEN 'registered'::public.customer_type ELSE 'guest'::public.customer_type END;

  INSERT INTO public.customers (
    user_id,
    email,
    email_normalized,
    name,
    phone,
    type
  )
  VALUES (
    p_user_id,
    trim(p_email),
    v_norm,
    coalesce(nullif(trim(p_name), ''), 'Customer'),
    nullif(trim(p_phone), ''),
    v_type
  )
  ON CONFLICT (email_normalized) DO UPDATE SET
    user_id = coalesce(EXCLUDED.user_id, public.customers.user_id),
    email = EXCLUDED.email,
    name = CASE
      WHEN nullif(trim(EXCLUDED.name), '') IS NOT NULL AND trim(EXCLUDED.name) <> 'Customer'
        THEN trim(EXCLUDED.name)
      ELSE public.customers.name
    END,
    phone = coalesce(nullif(trim(EXCLUDED.phone), ''), public.customers.phone),
    type = CASE
      WHEN EXCLUDED.user_id IS NOT NULL THEN 'registered'::public.customer_type
      ELSE public.customers.type
    END,
    updated_at = now()
  RETURNING id INTO v_customer_id;

  IF p_refresh_stats THEN
    PERFORM public.refresh_customer_stats_for_email(trim(p_email));
  END IF;

  RETURN v_customer_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_customer_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM public.upsert_customer_record(
    NEW.id,
    coalesce(NEW.full_name, ''),
    v_email,
    NULL,
    false
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_customer ON public.profiles;
CREATE TRIGGER on_profile_created_customer
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_customer_on_profile();

CREATE OR REPLACE FUNCTION public.sync_customer_on_order_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_name text;
  v_phone text;
  v_user_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_email := OLD.customer_email;
    v_name := OLD.customer_name;
    v_phone := OLD.customer_phone;
    v_user_id := OLD.user_id;
  ELSE
    v_email := NEW.customer_email;
    v_name := NEW.customer_name;
    v_phone := NEW.customer_phone;
    v_user_id := NEW.user_id;
  END IF;

  PERFORM public.upsert_customer_record(v_user_id, v_name, v_email, v_phone, true);

  IF TG_OP = 'UPDATE' AND OLD.customer_email IS DISTINCT FROM NEW.customer_email THEN
    PERFORM public.refresh_customer_stats_for_email(OLD.customer_email);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_order_customer_sync ON public.orders;
CREATE TRIGGER on_order_customer_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_customer_on_order_change();

-- Backfill registered customers from profiles + auth.users
INSERT INTO public.customers (user_id, email, email_normalized, name, type, first_seen_at)
SELECT
  p.id,
  u.email,
  public.normalize_customer_email(u.email),
  coalesce(nullif(trim(p.full_name), ''), split_part(u.email, '@', 1)),
  'registered'::public.customer_type,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'customer'
  AND u.email IS NOT NULL
ON CONFLICT (email_normalized) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  type = 'registered'::public.customer_type,
  name = CASE
    WHEN nullif(trim(EXCLUDED.name), '') IS NOT NULL THEN EXCLUDED.name
    ELSE public.customers.name
  END,
  updated_at = now();

-- Backfill guest / checkout-only emails from orders
INSERT INTO public.customers (email, email_normalized, name, phone, type, first_seen_at)
SELECT DISTINCT ON (public.normalize_customer_email(o.customer_email))
  trim(o.customer_email),
  public.normalize_customer_email(o.customer_email),
  o.customer_name,
  o.customer_phone,
  CASE WHEN o.user_id IS NOT NULL THEN 'registered'::public.customer_type ELSE 'guest'::public.customer_type END,
  o.created_at
FROM public.orders o
WHERE trim(o.customer_email) <> ''
ORDER BY public.normalize_customer_email(o.customer_email), o.created_at ASC
ON CONFLICT (email_normalized) DO UPDATE SET
  phone = coalesce(public.customers.phone, EXCLUDED.phone),
  updated_at = now();

-- Refresh stats for all customers from order history
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT email FROM public.customers LOOP
    PERFORM public.refresh_customer_stats_for_email(r.email);
  END LOOP;
END;
$$;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read customers" ON public.customers;
CREATE POLICY "Admins read customers" ON public.customers
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users read own customer" ON public.customers;
CREATE POLICY "Users read own customer" ON public.customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage customers" ON public.customers;
CREATE POLICY "Admins manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
