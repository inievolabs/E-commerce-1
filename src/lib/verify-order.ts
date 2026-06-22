import type { PlaceOrderInput } from "./place-order";

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
}

export interface VerifiedOrderLine {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  color: string | null;
  size: string | null;
}

export interface VerifiedOrder {
  subtotal: number;
  shipping: number;
  total: number;
  items: VerifiedOrderLine[];
}

export function verifyOrderAgainstCatalog(
  input: PlaceOrderInput,
  products: CatalogProduct[],
  shippingCost = 0,
): { ok: true; order: VerifiedOrder } | { ok: false; error: string } {
  const catalog = new Map(products.map((row) => [row.id, row]));
  const productIds = [...new Set(input.items.map((item) => item.productId))];

  if (catalog.size !== productIds.length) {
    return { ok: false, error: "One or more products are no longer available." };
  }

  let subtotal = 0;
  const items: VerifiedOrderLine[] = input.items.map((item) => {
    const product = catalog.get(item.productId)!;
    const price = Number(product.price);
    subtotal += price * item.qty;
    return {
      product_id: item.productId,
      name: product.name,
      price,
      qty: item.qty,
      color: item.color ?? null,
      size: item.size ?? null,
    };
  });

  const shipping = shippingCost;
  return {
    ok: true,
    order: {
      subtotal,
      shipping,
      total: subtotal + shipping,
      items,
    },
  };
}
