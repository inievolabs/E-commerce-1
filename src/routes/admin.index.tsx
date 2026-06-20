import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminStore } from "@/lib/admin-store";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: AdminOverview,
});

function AdminOverview() {
  const { products, categories, inventory, orders } = useAdminStore();
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => {
    const r = inventory[p.id];
    return r && r.stock <= r.lowStockThreshold;
  });

  const stats = [
    { label: "Products", value: products.length, to: "/admin/products" },
    { label: "Categories", value: categories.length, to: "/admin/categories" },
    { label: "Pending orders", value: pending, to: "/admin/orders" },
    { label: "Revenue (all time)", value: formatPrice(revenue), to: "/admin/orders" },
  ];

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Dashboard</p>
        <h1 className="font-serif text-3xl md:text-4xl mt-2">Overview</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="bg-background border border-border p-5 hover:border-foreground transition-colors"
          >
            <p className="eyebrow text-muted-foreground">{s.label}</p>
            <p className="font-serif text-3xl mt-3 tabular-nums">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <section className="bg-background border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl">Recent orders</h2>
            <Link to="/admin/orders" className="eyebrow link-underline">View all</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{o.id} · {o.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
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
            <Link to="/admin/inventory" className="eyebrow link-underline">Manage</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All items healthy.</p>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map((p) => {
                const r = inventory[p.id];
                return (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.images[0]} alt="" className="w-10 h-12 object-cover bg-muted" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.category} · {p.gender}</p>
                      </div>
                    </div>
                    <p className="text-sm tabular-nums">{r.stock} left</p>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    processing: "bg-blue-100 text-blue-900",
    shipped: "bg-indigo-100 text-indigo-900",
    delivered: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-rose-100 text-rose-900",
  };
  return (
    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider ${map[status] ?? "bg-secondary"}`}>
      {status}
    </span>
  );
}
