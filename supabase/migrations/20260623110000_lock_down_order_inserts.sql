-- Orders must be placed only via server-side place_cod_order (service_role), not direct client INSERT.

DROP POLICY IF EXISTS "Anyone can place guest orders" ON public.orders;
DROP POLICY IF EXISTS "Insert order items with order" ON public.order_items;
