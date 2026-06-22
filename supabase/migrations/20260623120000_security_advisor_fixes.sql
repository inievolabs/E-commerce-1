-- Supabase advisor fixes: lock down SECURITY DEFINER RPC, RLS perf, indexes

ALTER FUNCTION public.normalize_customer_email(text) SET search_path = public;

-- is_admin: needed by authenticated RLS only (not anon)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- Server-only order RPC
REVOKE EXECUTE ON FUNCTION public.place_cod_order(
  uuid, text, text, text, text, numeric, numeric, numeric, jsonb
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_cod_order(
  uuid, text, text, text, text, numeric, numeric, numeric, jsonb
) TO service_role;

-- Internal customer helpers (trigger-only; not public RPC)
REVOKE EXECUTE ON FUNCTION public.refresh_customer_stats_for_email(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.upsert_customer_record(uuid, text, text, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_customer_on_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_customer_on_order_change() FROM PUBLIC, anon, authenticated;

-- RLS: auth.uid() initplan optimization
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (
    id = (select auth.uid())
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users read own customer" ON public.customers;
CREATE POLICY "Users read own customer" ON public.customers
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Read order items via order access" ON public.order_items;
CREATE POLICY "Read order items via order access" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = (select auth.uid()) OR public.is_admin())
    )
  );

CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items (product_id);
