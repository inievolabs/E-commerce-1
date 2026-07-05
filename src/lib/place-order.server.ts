import { createSupabaseAdminClient } from "./supabase-server";
import { placeOrderSchema, type PlaceOrderResponse } from "./place-order";
import { verifyOrderAgainstCatalog } from "./verify-order";

const SHIPPING_COST = 0;

export async function placeCodOrder(
  raw: unknown,
  options?: { userId?: string | null },
): Promise<PlaceOrderResponse> {
  const parsed = placeOrderSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join("; ");
    return { ok: false, error: message };
  }

  const input = parsed.data;
  const admin = createSupabaseAdminClient();
  const productIds = [...new Set(input.items.map((item) => item.productId))];

  const { data: products, error: catalogError } = await admin
    .from("products")
    .select("id, name, price")
    .in("id", productIds);

  if (catalogError) {
    throw catalogError;
  }

  const verified = verifyOrderAgainstCatalog(input, products ?? [], SHIPPING_COST);
  if (!verified.ok) {
    return verified;
  }

  const { data: orderId, error } = await admin.rpc("place_cod_order", {
    p_user_id: options?.userId ?? null,
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone,
    p_shipping_address: input.shippingAddress,
    p_subtotal: verified.order.subtotal,
    p_shipping: verified.order.shipping,
    p_total: verified.order.total,
    p_items: verified.order.items as unknown as import("./database.types").Json,
  });

  if (error) {
    const msg = error.message.includes("Insufficient stock")
      ? "One or more items are out of stock."
      : error.message;
    return { ok: false, error: msg };
  }

  if (!orderId) {
    return { ok: false, error: "Order could not be created." };
  }

  return { ok: true, orderId };
}
