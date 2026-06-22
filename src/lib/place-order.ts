import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
});

export const placeOrderSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required"),
  customerEmail: z.string().trim().email("Valid email is required"),
  customerPhone: z.string().trim().min(6, "Phone is required"),
  shippingAddress: z.string().trim().min(5, "Address is required"),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().nonnegative(),
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
  userId: z.string().uuid().nullable().optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export interface PlaceOrderResult {
  ok: true;
  orderId: string;
}

export interface PlaceOrderError {
  ok: false;
  error: string;
}

export type PlaceOrderResponse = PlaceOrderResult | PlaceOrderError;
