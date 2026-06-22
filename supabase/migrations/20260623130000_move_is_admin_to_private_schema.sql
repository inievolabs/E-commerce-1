-- Move is_admin() out of public schema so it cannot be called via PostgREST RPC.
-- RLS policies continue to use private.is_admin().

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated, anon;

CREATE OR REPLACE FUNCTION private.is_admin()
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

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, anon, service_role;

-- addresses
DROP POLICY IF EXISTS "Admins read all addresses" ON public.addresses;
CREATE POLICY "Admins read all addresses" ON public.addresses
  FOR SELECT TO authenticated
  USING (private.is_admin());

-- categories
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- customers
DROP POLICY IF EXISTS "Admins manage customers" ON public.customers;
CREATE POLICY "Admins manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins read customers" ON public.customers;
CREATE POLICY "Admins read customers" ON public.customers
  FOR SELECT TO authenticated
  USING (private.is_admin());

-- inventory
DROP POLICY IF EXISTS "Admins manage inventory" ON public.inventory;
CREATE POLICY "Admins manage inventory" ON public.inventory
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- media_assets
DROP POLICY IF EXISTS "Admins manage media assets" ON public.media_assets;
CREATE POLICY "Admins manage media assets" ON public.media_assets
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- order_items
DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Read order items via order access" ON public.order_items;
CREATE POLICY "Read order items via order access" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = (select auth.uid()) OR private.is_admin())
    )
  );

-- orders
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
CREATE POLICY "Admins delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (private.is_admin());

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR private.is_admin());

-- post_categories
DROP POLICY IF EXISTS "Admins manage post categories" ON public.post_categories;
CREATE POLICY "Admins manage post categories" ON public.post_categories
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- posts
DROP POLICY IF EXISTS "Admins manage posts" ON public.posts;
CREATE POLICY "Admins manage posts" ON public.posts
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Public read published posts" ON public.posts;
CREATE POLICY "Public read published posts" ON public.posts
  FOR SELECT TO public
  USING (published = true OR private.is_admin());

-- products
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- profiles
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (private.is_admin());

DROP FUNCTION IF EXISTS public.is_admin();
