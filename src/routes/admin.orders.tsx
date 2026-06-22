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

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

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
        <h1 className="font-serif text-3xl md:text-4xl mt-2">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} total</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", ...STATUSES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
              filter === f
                ? "bg-foreground text-background border-foreground"
                : "border-border bg-background hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="bg-transparent border border-border px-2 py-1 text-xs uppercase tracking-wider focus:outline-none focus:border-foreground"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setSelected(o)} className="eyebrow link-underline mr-3">View</button>
                  <button
                    onClick={() => { if (confirm(`Delete ${o.id}?`)) deleteOrder(o.id); }}
                    className="eyebrow text-destructive link-underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No orders.</td></tr>
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
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-full grid place-items-center p-4">
        <div onClick={(e) => e.stopPropagation()} className="bg-background border border-border w-full max-w-2xl p-6 lg:p-8">
          <header className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow">Order</p>
              <h2 className="font-serif text-2xl mt-1">{order.id}</h2>
              <p className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="eyebrow link-underline">Close</button>
          </header>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="eyebrow text-muted-foreground mb-2">Customer</p>
              <p className="text-sm">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground mb-2">Ship to</p>
              <p className="text-sm whitespace-pre-line">{order.shippingAddress}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="eyebrow text-muted-foreground mb-3">Items</p>
            <ul className="divide-y divide-border">
              {order.items.map((it, i) => (
                <li key={i} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {it.qty}{it.color ? ` · ${it.color}` : ""}{it.size ? ` · ${it.size}` : ""}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">{formatPrice(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd></div>
            <div className="flex justify-between text-base pt-2 border-t border-border">
              <dt>Total</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
