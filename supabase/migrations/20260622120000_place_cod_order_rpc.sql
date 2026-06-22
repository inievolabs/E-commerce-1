-- Atomic COD order placement with inventory decrement

CREATE OR REPLACE FUNCTION public.place_cod_order(
  p_user_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_subtotal numeric,
  p_shipping numeric,
  p_total numeric,
  p_items jsonb
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id text;
  v_item jsonb;
  v_product_id text;
  v_qty integer;
  v_stock integer;
BEGIN
  IF jsonb_array_length(p_items) IS NULL OR jsonb_array_length(p_items) < 1 THEN
    RAISE EXCEPTION 'Order must include at least one item';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item ->> 'product_id';
    v_qty := (v_item ->> 'qty')::integer;

    SELECT stock INTO v_stock
    FROM public.inventory
    WHERE product_id = v_product_id
    FOR UPDATE;

    IF v_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_product_id;
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_product_id;
    END IF;
  END LOOP;

  v_order_id := public.generate_order_id();

  INSERT INTO public.orders (
    id,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    payment_method,
    status,
    subtotal,
    shipping,
    total
  ) VALUES (
    v_order_id,
    p_user_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    'cod',
    'pending',
    p_subtotal,
    p_shipping,
    p_total
  );

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item ->> 'product_id';
    v_qty := (v_item ->> 'qty')::integer;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      name,
      price,
      qty,
      color,
      size
    ) VALUES (
      v_order_id,
      v_product_id,
      v_item ->> 'name',
      (v_item ->> 'price')::numeric,
      v_qty,
      v_item ->> 'color',
      v_item ->> 'size'
    );

    UPDATE public.inventory
    SET stock = stock - v_qty
    WHERE product_id = v_product_id;
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_cod_order(
  uuid, text, text, text, text, numeric, numeric, numeric, jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.place_cod_order(
  uuid, text, text, text, text, numeric, numeric, numeric, jsonb
) TO service_role;
