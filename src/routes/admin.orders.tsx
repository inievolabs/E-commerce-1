import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAdminStore, type Order, type OrderStatus } from "@/lib/admin-store";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    filter: typeof search.filter === "string" ? search.filter : undefined,
  }),
  component: AdminOrders,
});

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const { orders, setOrderStatus, deleteOrder } = useAdminStore();
  const { filter: initialFilter } = Route.useSearch();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (initialFilter && STATUSES.includes(initialFilter as OrderStatus)) {
      setFilter(initialFilter as OrderStatus);
    }
  }, [initialFilter]);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow">Operations</p>
        <h1 className="font-serif text-3xl md:text-4xl mt-1.5">Orders</h1>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{orders.length} total orders</p>
      </header>

      <div className="flex flex-wrap gap-1 mb-5 bg-[#131210]/5 p-0.5 rounded-sm border border-black/5 w-fit">
        {(["all", ...STATUSES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-[9px] uppercase tracking-widest font-semibold transition-all duration-150 cursor-pointer ${
              filter === f
                ? "bg-[#0d0c0b] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-background border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-xs min-w-[760px]">
          <thead className="bg-[#131210]/5 text-left border-b border-border text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Order</th>
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 font-semibold text-right">Total</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-black/1 transition-all duration-150">
                <td className="px-5 py-3 font-mono text-xs font-medium text-[#c9a96e]">{o.id}</td>
                <td className="px-5 py-3">
                  <p className="font-semibold text-foreground">{o.customerName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{o.customerEmail}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-medium">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-foreground tabular-nums">{formatPrice(o.total)}</td>
                <td className="px-5 py-3">
                  <div className="relative inline-block w-32">
                    <select
                      value={o.status}
                      onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="w-full appearance-none bg-background border border-border pl-3 pr-8 py-2 text-[10px] uppercase tracking-wider rounded-sm focus:outline-none focus:border-foreground text-foreground cursor-pointer"
                    >
                      {STATUSES.map((s) => (
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
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setSelected(o)} className="eyebrow link-underline mr-5 cursor-pointer font-semibold text-foreground/70 hover:text-foreground">
                    View
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${o.id}?`)) deleteOrder(o.id);
                    }}
                    className="eyebrow text-destructive link-underline cursor-pointer font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm font-medium bg-black/1">
                  No orders matched this status filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center p-0 sm:p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#f5f2ed] w-full min-h-screen sm:min-h-0 sm:max-w-2xl p-6 sm:p-8 sm:my-8 border border-[#0d0c0b]/10 shadow-2xl relative"
        >
          <header className="flex items-start justify-between gap-4 mb-6 border-b border-black/5 pb-4">
            <div>
              <p className="eyebrow">Order Details</p>
              <h2 className="font-serif text-2xl mt-1.5 font-medium text-foreground">{order.id}</h2>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <button onClick={onClose} className="eyebrow link-underline cursor-pointer font-semibold">
              Close
            </button>
          </header>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-background border border-border p-4.5">
              <p className="eyebrow text-muted-foreground/60 mb-2">Customer Profile</p>
              <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{order.customerEmail}</p>
            </div>
            <div className="bg-background border border-border p-4.5">
              <p className="eyebrow text-muted-foreground/60 mb-2">Shipping Address</p>
              <p className="text-sm whitespace-pre-line text-foreground/80 leading-relaxed font-medium">{order.shippingAddress}</p>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4">
            <p className="eyebrow text-muted-foreground/60 mb-3.5">Ordered Items</p>
            <ul className="divide-y divide-border border border-border bg-background px-4">
              {order.items.map((it, i) => (
                <li key={i} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{it.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Quantity: <span className="font-mono text-foreground">{it.qty}</span>
                      {it.color ? ` · Color: ${it.color}` : ""}
                      {it.size ? ` · Size: ${it.size}` : ""}
                    </p>
                  </div>
                  <p className="text-xs font-mono font-semibold text-foreground tabular-nums">{formatPrice(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-6 pt-4 border-t border-black/5 space-y-2 text-xs font-medium text-muted-foreground">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums font-mono text-foreground">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="tabular-nums font-mono text-foreground">
                {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
              </dd>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-black/5 text-foreground">
              <dt className="font-semibold uppercase tracking-wider text-[10px]">Total Amount</dt>
              <dd className="tabular-nums font-mono font-bold">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
