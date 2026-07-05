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
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#c9a96e",
  },
} satisfies ChartConfig;

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
      recent: sortOrdersNewest(orders).slice(0, 5),
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

  // Group last 7 days of revenue for the chart
  const chartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyMap[label] = 0;
    }
    
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const dateLabel = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyMap[dateLabel] !== undefined) {
        dailyMap[dateLabel] += o.total;
      }
    });
    
    return Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [orders]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin" />
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Loading Studio Dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-1.5">Studio Overview</h1>
        </div>
        <Link
          to="/admin/orders"
          search={{ filter: undefined }}
          className="inline-flex items-center gap-2 border border-[#0d0c0b]/10 bg-background hover:bg-[#0d0c0b] hover:text-white px-5 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold transition-all duration-200 shadow-xs cursor-pointer"
        >
          All orders
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Revenue cards */}
      <section className="space-y-4">
        <p className="eyebrow">Revenue Metrics</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <MetricCard
            label="Today"
            value={formatPrice(metrics.revenueToday)}
            hint={`${metrics.ordersToday} order${metrics.ordersToday === 1 ? "" : "s"} today`}
            icon={TrendingUp}
          />
          <MetricCard
            label="This month"
            value={formatPrice(metrics.revenueMonth)}
            hint={`${metrics.ordersMonth} order${metrics.ordersMonth === 1 ? "" : "s"} this month`}
            highlight
            icon={Calendar}
          />
          <MetricCard
            label="All time"
            value={formatPrice(metrics.revenueAll)}
            hint="Excludes cancelled orders"
            icon={InfinityIcon}
          />
        </div>
      </section>

      {/* Revenue Chart Section */}
      <section className="bg-background border border-border p-5 lg:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-lg font-medium text-foreground">Revenue Trend</h2>
            <p className="text-[10px] text-muted-foreground mt-1">Daily gross revenue performance for the past week</p>
          </div>
          <div className="flex items-center gap-1 bg-[#131210]/5 p-0.5 rounded-sm border border-black/5">
            <span className="text-[9px] tracking-wider uppercase font-semibold text-[#c9a96e] bg-[#0d0c0b] px-2.5 py-1 shadow-xs">7 Days</span>
            <span className="text-[9px] tracking-wider uppercase font-semibold text-muted-foreground px-2.5 py-1 cursor-pointer hover:text-foreground">30 Days</span>
            <span className="text-[9px] tracking-wider uppercase font-semibold text-muted-foreground px-2.5 py-1 cursor-pointer hover:text-foreground">12 Months</span>
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ChartContainer config={chartConfig} className="w-full h-full max-h-72 aspect-auto text-xs">
            <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c9a96e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                dy={10}
                className="text-[9px] font-sans fill-muted-foreground uppercase tracking-widest"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                dx={-10}
                className="text-[9px] font-mono fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent hideIndicator labelFormatter={(l) => `Date: ${l}`} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#c9a96e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </section>

      {/* Order pipeline */}
      <section className="space-y-4">
        <p className="eyebrow">Order Pipeline</p>
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
        <section className="bg-background border border-amber-200/70 shadow-xs overflow-hidden rounded-xs">
          <div className="bg-amber-500/5 border-b border-amber-200/70 px-5 py-4.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-800 shrink-0">
                <AlertCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-serif text-lg text-amber-950 font-medium">Needs Attention</h2>
                <p className="text-[10px] text-amber-800/80 mt-0.5 font-sans uppercase tracking-wider">
                  {metrics.pendingCount} pending · {metrics.actionCount} awaiting fulfilment
                </p>
              </div>
            </div>
            <Link
              to="/admin/orders"
              search={{ filter: "pending" }}
              className="text-[10px] uppercase tracking-[0.15em] font-semibold text-amber-900 hover:text-amber-750 flex items-center gap-1 transition-colors cursor-pointer"
            >
              Open Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-amber-200/30 px-5">
            {metrics.needsAction.slice(0, 5).map((o) => (
              <PendingOrderRow key={o.id} order={o} onStatusChange={setOrderStatus} />
            ))}
          </ul>
          {metrics.needsAction.length > 5 && (
            <div className="text-[10px] uppercase tracking-wider text-amber-800/70 px-5 py-3 border-t border-amber-200/20 bg-amber-500/2 flex items-center justify-between">
              <span>+{metrics.needsAction.length - 5} more orders requiring action</span>
              <Link to="/admin/orders" search={{ filter: "pending" }} className="underline hover:text-amber-950">View all</Link>
            </div>
          )}
        </section>
      )}

      {/* Recent orders & Low stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <section className="bg-background border border-border shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-serif text-lg font-medium text-foreground">Recent Orders</h2>
            </div>
            <Link
              to="/admin/orders"
              search={{ filter: undefined }}
              className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5">
            {metrics.recent.length === 0 ? (
              <p className="text-xs text-muted-foreground py-10 text-center">No orders registered yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {metrics.recent.map((o) => {
                  const orderInitials = o.customerName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <li key={o.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center text-[10px] font-semibold text-[#c9a96e] shrink-0 font-sans">
                          {orderInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-mono font-medium text-foreground truncate">{o.id}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-1">
                            {o.customerName} · {new Date(o.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold tabular-nums text-foreground">{formatPrice(o.total)}</p>
                        <StatusBadge status={o.status} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Low stock */}
        <section className="bg-background border border-border shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-serif text-lg font-medium text-foreground">Low Stock Alerts</h2>
            </div>
            <Link
              to="/admin/inventory"
              className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5">
            {lowStock.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-xs text-muted-foreground">All products are healthy and well stocked.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.slice(0, 5).map((p) => {
                  const row = inventory[p.id];
                  const currentStock = row?.stock ?? 0;
                  const threshold = row?.lowStockThreshold ?? 4;
                  // Calculate width percentage for the bar
                  const percent = Math.min(100, Math.max(0, (currentStock / (threshold || 1)) * 100));
                  return (
                    <li key={p.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-muted-foreground capitalize shrink-0">{p.category}</p>
                          {/* Miniature stock level bar */}
                          <div className="w-24 h-1 bg-black/5 rounded-full overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full ${currentStock === 0 ? "bg-rose-500" : "bg-amber-500"}`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 shrink-0 ${
                        currentStock === 0 
                          ? "text-rose-800 bg-rose-500/10 border border-rose-500/20" 
                          : "text-amber-800 bg-amber-500/10 border border-amber-500/20"
                      }`}>
                        {currentStock} units left
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
      className={`relative overflow-hidden border p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group ${
        highlight
          ? "border-[#c9a96e]/30 bg-[#0d0c0b] text-white"
          : "border-border bg-background"
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a96e]/5 rounded-full blur-2xl -mr-8 -mt-8" />
      )}
      <div className="flex items-start justify-between mb-3.5 relative z-10">
        <p className={`text-[10px] tracking-[0.2em] uppercase font-semibold ${highlight ? "text-[#c9a96e]" : "text-muted-foreground"}`}>
          {label}
        </p>
        <div className={`p-1.5 rounded-full transition-colors ${
          highlight 
            ? "bg-white/5 text-[#c9a96e] group-hover:bg-[#c9a96e]/20" 
            : "bg-[#c9a96e]/10 text-[#c9a96e] group-hover:bg-[#c9a96e]/20"
        }`}>
          <Icon className="w-3.5 h-3.5 shrink-0" />
        </div>
      </div>
      <div className="relative z-10 flex items-baseline justify-between gap-2">
        <div>
          <p className={`font-serif text-2xl md:text-3xl tracking-tight tabular-nums font-medium ${highlight ? "text-white" : "text-foreground"}`}>
            {value}
          </p>
          {hint && (
            <p className={`text-[9px] mt-2 flex items-center gap-1 uppercase tracking-wider ${highlight ? "text-white/40" : "text-muted-foreground/60"}`}>
              {hint}
            </p>
          )}
        </div>
        {highlight && (
          <div className="flex items-center gap-0.5 text-xs text-emerald-400 font-sans font-semibold mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12%</span>
          </div>
        )}
      </div>
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
  const colorMap = () => {
    if (accent && count > 0) return "border-amber-200 bg-amber-500/5 text-amber-900 border-l-2 border-l-amber-500";
    if (positive && count > 0) return "border-emerald-200 bg-emerald-500/5 text-emerald-900 border-l-2 border-l-emerald-500";
    if (muted) return "border-black/5 bg-black/2 text-muted-foreground opacity-60";
    return "border-border bg-background hover:border-black/15";
  };

  return (
    <div
      className={`border px-4 py-3.5 transition-all duration-200 hover:shadow-xs group ${colorMap()}`}
    >
      <p className="text-[9px] tracking-[0.2em] uppercase font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{label}</p>
      <p
        className={`font-serif text-2xl mt-2.5 tabular-nums font-semibold ${
          accent && count > 0 ? "text-amber-800" : positive && count > 0 ? "text-emerald-800" : "text-foreground"
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
  const initials = order.customerName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <li className="py-4.5 flex flex-wrap items-center justify-between gap-4 transition-colors hover:bg-amber-500/2">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Customer initials avatar */}
        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-semibold text-amber-800 font-sans shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-medium text-amber-900 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">{order.id}</span>
            <span className="text-sm font-semibold text-foreground">{order.customerName}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {new Date(order.createdAt).toLocaleString()} · {order.items.length} item
            {order.items.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <p className="text-xs font-semibold text-foreground tabular-nums">{formatPrice(order.total)}</p>
        <div className="relative">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className="appearance-none bg-background border border-border pl-3 pr-8 py-2 text-[10px] uppercase tracking-wider rounded-sm focus:outline-none focus:border-amber-500 text-foreground cursor-pointer"
            aria-label={`Update status for ${order.id}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    pending: "bg-amber-500/10 text-amber-800 border-amber-500/20",
    confirmed: "bg-sky-500/10 text-sky-800 border-sky-500/20",
    processing: "bg-blue-500/10 text-blue-800 border-blue-500/20",
    shipped: "bg-indigo-500/10 text-indigo-800 border-indigo-500/20",
    delivered: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-800 border-rose-500/20",
  };
  return (
    <span
      className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold border rounded-sm ${map[status]}`}
    >
      {status}
    </span>
  );
}
