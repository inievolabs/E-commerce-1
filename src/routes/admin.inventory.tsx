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
      .map((p) => ({
        p,
        r: inventory[p.id] ?? { productId: p.id, stock: 0, lowStockThreshold: 4 },
      }))
      .filter(({ p }) => (q ? p.name.toLowerCase().includes(q) || p.id.includes(q) : true))
      .filter(({ r }) => {
        if (filter === "low") return r.stock > 0 && r.stock <= r.lowStockThreshold;
        if (filter === "out") return r.stock === 0;
        return true;
      });
  }, [products, inventory, filter, search]);

  const totals = useMemo(() => {
    let units = 0,
      low = 0,
      out = 0;
    for (const p of products) {
      const r = inventory[p.id];
      if (!r) {
        out++;
        continue;
      }
      units += r.stock;
      if (r.stock === 0) out++;
      else if (r.stock <= r.lowStockThreshold) low++;
    }
    return { units, low, out };
  }, [products, inventory]);

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="mb-6">
        <p className="eyebrow">Stock</p>
        <h1 className="font-serif text-3xl md:text-4xl mt-1.5">Inventory</h1>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Total units" value={totals.units} />
        <Stat label="Low stock items" value={totals.low} />
        <Stat label="Out of stock items" value={totals.out} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory…"
            className="w-full bg-background border border-border pl-9 pr-4 py-2.5 text-xs uppercase tracking-wider focus:outline-none focus:border-foreground transition-colors"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/60">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex bg-[#131210]/5 p-0.5 rounded-sm border border-black/5 shrink-0">
          {(["all", "low", "out"] as const).map((f) => (
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
      </div>

      <div className="bg-background border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-xs min-w-[700px]">
          <thead className="bg-[#131210]/5 text-left border-b border-border text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Product</th>
              <th className="px-5 py-3.5 font-semibold">Stock Level</th>
              <th className="px-5 py-3.5 font-semibold">Low-stock Alert At</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ p, r }) => {
              const isOut = r.stock === 0;
              const isLow = !isOut && r.stock <= r.lowStockThreshold;
              return (
                <tr key={p.id} className="hover:bg-black/1 transition-all duration-150">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={productImageUrl(p.images[0], "thumb")}
                        alt=""
                        className="w-10 h-13 object-cover bg-muted border border-black/5"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1 capitalize">
                          {p.category} · {p.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustStock(p.id, -1)}
                        className="w-8 h-8 flex items-center justify-center border border-border bg-background hover:bg-[#0d0c0b] hover:text-white transition-colors cursor-pointer text-xs font-semibold rounded-sm shrink-0"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={r.stock}
                        onChange={(e) => setStock(p.id, Number(e.target.value))}
                        className="w-16 bg-background border border-border px-2 py-1.5 text-xs text-center font-mono font-semibold text-foreground focus:outline-none focus:border-foreground"
                      />
                      <button
                        onClick={() => adjustStock(p.id, 1)}
                        className="w-8 h-8 flex items-center justify-center border border-border bg-background hover:bg-[#0d0c0b] hover:text-white transition-colors cursor-pointer text-xs font-semibold rounded-sm shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      value={r.lowStockThreshold}
                      onChange={(e) => setThreshold(p.id, Number(e.target.value))}
                      className="w-16 bg-background border border-border px-2.5 py-1.5 text-xs text-center font-mono font-semibold text-foreground focus:outline-none focus:border-foreground"
                    />
                  </td>
                  <td className="px-5 py-3">
                    {isOut ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-rose-500/10 text-rose-800 border border-rose-500/20 rounded-sm">
                        <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                        Out of stock
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-sm animate-pulse">
                        <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                        Low stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 rounded-sm">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                        In stock
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-sm font-medium bg-black/1">
                  No items match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background border border-border p-5 transition-all duration-300 hover:shadow-xs group">
      <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{label}</p>
      <p className="font-serif text-2xl md:text-3xl mt-2.5 font-medium tabular-nums text-foreground">{value}</p>
    </div>
  );
}
