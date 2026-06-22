import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAdminStore, type Order, type OrderStatus } from "@/lib/admin-store";
import {
  countOrdersByStatus,
  orderCountForPeriod,
  ordersNeedingAction,
  pendingOrders,
  revenueForPeriod,
  sortOrdersNewest,
} from "@/lib/admin-dashboard";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: AdminOverview,
});

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOverview() {
  const { products, inventory, orders, setOrderStatus, isLoading } = useAdminStore();

  const metrics = useMemo(() => {
    const statusCounts = countOrdersByStatus(orders);
    return {
      revenueToday: revenueForPeriod(orders, "today"),
      revenueMonth: revenueForPeriod(orders, "month"),
      revenueAll: revenueForPeriod(orders, "all"),
      ordersToday: orderCountForPeriod(orders, "today"),
      ordersMonth: orderCountForPeriod(orders, "month"),
      pendingCount: statusCounts.pending,
      actionCount: ordersNeedingAction(orders).length,
      deliveredCount: statusCounts.delivered,
      statusCounts,
      pending: pendingOrders(orders),
      needsAction: ordersNeedingAction(orders),
      recent: sortOrdersNewest(orders).slice(0, 6),
    };
  }, [orders]);

  const lowStock = useMemo(
    () =>
      products.filter((p) => {
        const row = inventory[p.id];
        return row && row.stock <= row.lowStockThreshold;
      }),
    [products, inventory],
  );

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">Loading dashboard…</div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">Overview</h1>
        </div>
        <Link
          to="/admin/orders"
          className="border border-foreground px-4 py-2.5 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          All orders
        </Link>
      </header>

      {/* Revenue */}
      <section className="mb-8">
        <h2 className="eyebrow text-muted-foreground mb-4">Revenue</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <MetricCard
            label="Today"
            value={formatPrice(metrics.revenueToday)}
            hint={`${metrics.ordersToday} order${metrics.ordersToday === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="This month"
            value={formatPrice(metrics.revenueMonth)}
            hint={`${metrics.ordersMonth} order${metrics.ordersMonth === 1 ? "" : "s"}`}
            highlight
          />
          <MetricCard
            label="All time"
            value={formatPrice(metrics.revenueAll)}
            hint="Excludes cancelled"
          />
        </div>
      </section>

      {/* Order pipeline */}
      <section className="mb-8">
        <h2 className="eyebrow text-muted-foreground mb-4">Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatusCount label="Pending" count={metrics.statusCounts.pending} accent />
          <StatusCount label="Confirmed" count={metrics.statusCounts.confirmed} />
          <StatusCount label="Processing" count={metrics.statusCounts.processing} />
          <StatusCount label="Shipped" count={metrics.statusCounts.shipped} />
          <StatusCount label="Delivered" count={metrics.statusCounts.delivered} />
          <StatusCount label="Cancelled" count={metrics.statusCounts.cancelled} muted />
        </div>
      </section>

      {/* Pending — needs attention */}
      {metrics.needsAction.length > 0 && (
        <section className="mb-8 bg-background border border-foreground/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-serif text-xl">Needs your attention</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics.pendingCount} pending · {metrics.actionCount} awaiting fulfilment
              </p>
            </div>
            <Link
              to="/admin/orders"
              search={{ filter: "pending" }}
              className="eyebrow link-underline"
            >
              Open orders
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {metrics.needsAction.slice(0, 8).map((o) => (
              <PendingOrderRow key={o.id} order={o} onStatusChange={setOrderStatus} />
            ))}
          </ul>
          {metrics.needsAction.length > 8 && (
            <p className="text-xs text-muted-foreground mt-4">
              +{metrics.needsAction.length - 8} more in queue
            </p>
          )}
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-background border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl">Recent orders</h2>
            <Link to="/admin/orders" className="eyebrow link-underline">
              View all
            </Link>
          </div>
          {metrics.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {metrics.recent.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.id}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.customerName} · {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm tabular-nums">{formatPrice(o.total)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-background border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl">Low stock</h2>
            <Link to="/admin/inventory" className="eyebrow link-underline">
              Manage
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All items healthy.</p>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map((p) => {
                const row = inventory[p.id];
                return (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                    </div>
                    <p className="text-sm tabular-nums text-destructive">{row?.stock} left</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-5 ${highlight ? "border-foreground bg-secondary/30" : "border-border bg-background"}`}
    >
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="font-serif text-2xl md:text-3xl mt-3 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}

function StatusCount({
  label,
  count,
  accent,
  muted,
}: {
  label: string;
  count: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`border px-4 py-3 ${accent ? "border-foreground/40 bg-secondary/20" : "border-border bg-background"}`}
    >
      <p
        className={`text-[10px] tracking-[0.2em] uppercase ${muted ? "text-muted-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </p>
      <p
        className={`font-serif text-2xl mt-1 tabular-nums ${accent && count > 0 ? "text-foreground" : ""}`}
      >
        {count}
      </p>
    </div>
  );
}

function PendingOrderRow({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  return (
    <li className="py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium font-mono">{order.id}</p>
        <p className="text-sm mt-0.5">{order.customerName}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(order.createdAt).toLocaleString()} · {order.items.length} item
          {order.items.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm tabular-nums font-medium">{formatPrice(order.total)}</p>
        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
          className="bg-background border border-border px-2 py-1.5 text-xs uppercase tracking-wider focus:outline-none focus:border-foreground"
          aria-label={`Update status for ${order.id}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    pending: "bg-amber-100 text-amber-900",
    confirmed: "bg-sky-100 text-sky-900",
    processing: "bg-blue-100 text-blue-900",
    shipped: "bg-indigo-100 text-indigo-900",
    delivered: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-rose-100 text-rose-900",
  };
  return (
    <span
      className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider ${map[status]}`}
    >
      {status}
    </span>
  );
}
