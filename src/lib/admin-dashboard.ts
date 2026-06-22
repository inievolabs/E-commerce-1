import type { Order, OrderStatus } from "./admin-types";

export type RevenuePeriod = "today" | "week" | "month" | "all";

const ACTION_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing"];

function isActiveOrder(order: Order): boolean {
  return order.status !== "cancelled";
}

function orderTime(order: Order): number {
  return new Date(order.createdAt).getTime();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Week starts Monday (local time). */
function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  const weekday = start.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + diff);
  return start;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function periodStart(period: Exclude<RevenuePeriod, "all">, now: Date): Date {
  switch (period) {
    case "today":
      return startOfDay(now);
    case "week":
      return startOfWeek(now);
    case "month":
      return startOfMonth(now);
  }
}

export function ordersInPeriod(orders: Order[], period: RevenuePeriod, now = new Date()): Order[] {
  const active = orders.filter(isActiveOrder);
  if (period === "all") return active;
  const since = periodStart(period, now).getTime();
  return active.filter((o) => orderTime(o) >= since);
}

export function revenueForPeriod(orders: Order[], period: RevenuePeriod, now = new Date()): number {
  return ordersInPeriod(orders, period, now).reduce((sum, o) => sum + o.total, 0);
}

export function orderCountForPeriod(orders: Order[], period: RevenuePeriod, now = new Date()): number {
  return ordersInPeriod(orders, period, now).length;
}

export function pendingOrders(orders: Order[]): Order[] {
  return orders
    .filter((o) => o.status === "pending")
    .sort((a, b) => orderTime(b) - orderTime(a));
}

export function ordersNeedingAction(orders: Order[]): Order[] {
  return orders
    .filter((o) => ACTION_STATUSES.includes(o.status))
    .sort((a, b) => orderTime(b) - orderTime(a));
}

export function countOrdersByStatus(orders: Order[]): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const order of orders) {
    counts[order.status] += 1;
  }
  return counts;
}

export function sortOrdersNewest(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => orderTime(b) - orderTime(a));
}
