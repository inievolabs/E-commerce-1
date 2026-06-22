import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { productImageUrl } from "@/lib/cloudinary-image";

export const Route = createFileRoute("/admin/inventory")({
  ssr: false,
  component: AdminInventory,
});

function AdminInventory() {
  const { products, inventory, setStock, setThreshold, adjustStock } = useAdminStore();
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .map((p) => ({ p, r: inventory[p.id] ?? { productId: p.id, stock: 0, lowStockThreshold: 4 } }))
      .filter(({ p }) => (q ? p.name.toLowerCase().includes(q) || p.id.includes(q) : true))
      .filter(({ r }) => {
        if (filter === "low") return r.stock > 0 && r.stock <= r.lowStockThreshold;
        if (filter === "out") return r.stock === 0;
        return true;
      });
  }, [products, inventory, filter, search]);

  const totals = useMemo(() => {
    let units = 0, low = 0, out = 0;
    for (const p of products) {
      const r = inventory[p.id];
      if (!r) { out++; continue; }
      units += r.stock;
      if (r.stock === 0) out++;
      else if (r.stock <= r.lowStockThreshold) low++;
    }
    return { units, low, out };
  }, [products, inventory]);

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow">Stock</p>
        <h1 className="font-serif text-3xl md:text-4xl mt-2">Inventory</h1>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Total units" value={totals.units} />
        <Stat label="Low stock" value={totals.low} />
        <Stat label="Out of stock" value={totals.out} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground flex-1 min-w-[200px]"
        />
        <div className="inline-flex border border-border bg-background">
          {(["all", "low", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs uppercase tracking-wider ${
                filter === f ? "bg-foreground text-background" : "hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Low-stock at</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ p, r }) => {
              const isOut = r.stock === 0;
              const isLow = !isOut && r.stock <= r.lowStockThreshold;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={productImageUrl(p.images[0], "thumb")}
                        alt=""
                        className="w-10 h-12 object-cover bg-muted"
                      />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.category} · {p.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjustStock(p.id, -1)} className="w-7 h-7 border border-border hover:bg-secondary">−</button>
                      <input
                        type="number"
                        value={r.stock}
                        onChange={(e) => setStock(p.id, Number(e.target.value))}
                        className="w-16 bg-transparent border border-border px-2 py-1 text-sm text-center tabular-nums focus:outline-none focus:border-foreground"
                      />
                      <button onClick={() => adjustStock(p.id, 1)} className="w-7 h-7 border border-border hover:bg-secondary">+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={r.lowStockThreshold}
                      onChange={(e) => setThreshold(p.id, Number(e.target.value))}
                      className="w-16 bg-transparent border border-border px-2 py-1 text-sm text-center tabular-nums focus:outline-none focus:border-foreground"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {isOut ? (
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-rose-100 text-rose-900">Out</span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-amber-100 text-amber-900">Low</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-900">In stock</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground text-sm">No items.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background border border-border p-4">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="font-serif text-2xl mt-2 tabular-nums">{value}</p>
    </div>
  );
}
