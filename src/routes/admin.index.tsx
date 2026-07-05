import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, type ElementType } from "react";
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
import {
  TrendingUp,
  Calendar,
  Infinity as InfinityIcon,
  AlertCircle,
  ArrowRight,
  Package,
  ShoppingCart,
} from "lucide-react";

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
      <div className="py-20 text-center">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">Overview</h1>
        </div>
        <Link
          to="/admin/orders"
          search={{ filter: undefined }}
          className="inline-flex items-center gap-2 border border-foreground px-4 py-2.5 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          All orders
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Revenue cards */}
      <section>
        <p className="eyebrow mb-4">Revenue</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <MetricCard
            label="Today"
            value={formatPrice(metrics.revenueToday)}
            hint={`${metrics.ordersToday} order${metrics.ordersToday === 1 ? "" : "s"}`}
            icon={TrendingUp}
          />
          <MetricCard
            label="This month"
            value={formatPrice(metrics.revenueMonth)}
            hint={`${metrics.ordersMonth} order${metrics.ordersMonth === 1 ? "" : "s"}`}
            highlight
            icon={Calendar}
          />
          <MetricCard
            label="All time"
            value={formatPrice(metrics.revenueAll)}
            hint="Excludes cancelled"
            icon={InfinityIcon}
          />
        </div>
      </section>

      {/* Order pipeline */}
      <section>
        <p className="eyebrow mb-4">Order pipeline</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatusCount label="Pending" count={metrics.statusCounts.pending} accent />
          <StatusCount label="Confirmed" count={metrics.statusCounts.confirmed} />
          <StatusCount label="Processing" count={metrics.statusCounts.processing} />
          <StatusCount label="Shipped" count={metrics.statusCounts.shipped} />
          <StatusCount label="Delivered" count={metrics.statusCounts.delivered} positive />
          <StatusCount label="Cancelled" count={metrics.statusCounts.cancelled} muted />
        </div>
      </section>

      {/* Needs attention */}
      {metrics.needsAction.length > 0 && (
        <section className="bg-background border border-amber-200/60 shadow-sm overflow-hidden">
          <div className="bg-amber-50/50 border-b border-amber-200/60 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <h2 className="font-serif text-lg text-amber-900">Needs your attention</h2>
                <p className="text-xs text-amber-700/70 mt-0.5">
                  {metrics.pendingCount} pending · {metrics.actionCount} awaiting fulfilment
                </p>
              </div>
            </div>
            <Link
              to="/admin/orders"
              search={{ filter: "pending" }}
              className="text-xs tracking-[0.15em] uppercase text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
            >
              Open orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border px-5">
            {metrics.needsAction.slice(0, 8).map((o) => (
              <PendingOrderRow key={o.id} order={o} onStatusChange={setOrderStatus} />
            ))}
          </ul>
          {metrics.needsAction.length > 8 && (
            <p className="text-xs text-muted-foreground px-5 py-3 border-t border-border">
              +{metrics.needsAction.length - 8} more in queue
            </p>
          )}
        </section>
      )}

      {/* Recent orders & Low stock */}
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="bg-background border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-serif text-lg">Recent orders</h2>
            </div>
            <Link
              to="/admin/orders"
              search={{ filter: undefined }}
              className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5">
            {metrics.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {metrics.recent.map((o) => (
                  <li key={o.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium font-mono truncate">{o.id}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {o.customerName} · {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm tabular-nums font-medium">{formatPrice(o.total)}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bg-background border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-serif text-lg">Low stock</h2>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5">
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6">All items healthy.</p>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.slice(0, 6).map((p) => {
                  const row = inventory[p.id];
                  return (
                    <li key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{p.category}</p>
                      </div>
                      <span className="text-xs font-medium text-destructive bg-destructive/8 px-2.5 py-1 shrink-0">
                        {row?.stock} left
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
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
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  icon: ElementType;
}) {
  return (
    <div
      className={`relative overflow-hidden border p-5 shadow-sm transition-shadow hover:shadow-md ${
        highlight
          ? "border-foreground/20 bg-foreground text-background"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className={`text-[10px] tracking-[0.22em] uppercase font-medium ${highlight ? "text-background/60" : "text-muted-foreground"}`}>
          {label}
        </p>
        <Icon className={`w-4 h-4 shrink-0 ${highlight ? "text-background/40" : "text-muted-foreground/40"}`} />
      </div>
      <p className={`font-serif text-2xl md:text-3xl tabular-nums ${highlight ? "text-background" : ""}`}>
        {value}
      </p>
      {hint && (
        <p className={`text-xs mt-2 ${highlight ? "text-background/50" : "text-muted-foreground"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

function StatusCount({
  label,
  count,
  accent,
  muted,
  positive,
}: {
  label: string;
  count: number;
  accent?: boolean;
  muted?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`border px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md ${
        accent && count > 0
          ? "border-amber-200 bg-amber-50/60"
          : positive && count > 0
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-border bg-background"
      }`}
    >
      <p className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground">{label}</p>
      <p
        className={`font-serif text-2xl mt-1.5 tabular-nums ${
          accent && count > 0 ? "text-amber-800" : positive && count > 0 ? "text-emerald-800" : ""
        }`}
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
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-sky-100 text-sky-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm ${map[status]}`}
    >
      {status}
    </span>
  );
}
