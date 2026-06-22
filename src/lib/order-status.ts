import type { Database } from "./database.types";

export type DbOrderStatus = Database["public"]["Enums"]["order_status"];

/** Customer-facing order status labels (maps 1:1 from admin DB statuses). */
export type OrderStatusLabel =
  | "Order received"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

const STATUS_MAP: Record<DbOrderStatus, OrderStatusLabel> = {
  pending: "Order received",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_FLOW: OrderStatusLabel[] = [
  "Order received",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

export function mapOrderStatusForCustomer(status: DbOrderStatus): OrderStatusLabel {
  return STATUS_MAP[status];
}

export function orderStatusBadgeClass(status: OrderStatusLabel): string {
  const map: Record<OrderStatusLabel, string> = {
    "Order received": "bg-muted text-foreground",
    Confirmed: "bg-secondary text-foreground",
    Processing: "bg-muted text-foreground",
    Shipped: "bg-accent/15 text-accent-foreground",
    Delivered: "bg-foreground/5 text-foreground",
    Cancelled: "bg-destructive/10 text-destructive",
  };
  return map[status];
}

export function orderStatusStepIndex(status: OrderStatusLabel): number {
  if (status === "Cancelled") return -1;
  return ORDER_STATUS_FLOW.indexOf(status);
}
