import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAdminStore, type Product, type Category, type Gender } from "@/lib/admin-store";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/admin/products")({
  ssr: false,
  component: AdminProducts,
});

const emptyProduct = (categories: { id: Category }[]): Product => ({
  id: "",
  name: "",
  price: 0,
  category: categories[0]?.id ?? "bags",
  gender: "women",
  color: "",
  colorHex: "#000000",
  images: [],
  description: "",
  materials: "",
});

function AdminProducts() {
  const { products, categories, upsertProduct, deleteProduct } = useAdminStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} total</p>
        </div>
        <button
          onClick={() => setEditing(emptyProduct(categories))}
          className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
        >
          + New product
        </button>
      </header>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full sm:w-80 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
        />
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="w-10 h-12 object-cover bg-muted" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3 capitalize">{p.gender}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="eyebrow link-underline mr-4">Edit</button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                    }}
                    className="eyebrow text-destructive link-underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">No products.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditor
          initial={editing}
          categories={categories.map((c) => c.id)}
          onClose={() => setEditing(null)}
          onSave={(p) => { upsertProduct(p); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ProductEditor({
  initial,
  categories,
  onClose,
  onSave,
}: {
  initial: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [p, setP] = useState<Product>(initial);
  const [imagesText, setImagesText] = useState(initial.images.join("\n"));
  const isNew = !initial.id;

  const update = <K extends keyof Product>(k: K, v: Product[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-full grid place-items-center p-4">
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => {
            e.preventDefault();
            const id = p.id || `p-${Date.now().toString(36)}`;
            const images = imagesText.split("\n").map((s) => s.trim()).filter(Boolean);
            if (images.length === 0) {
              images.push("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80");
            }
            onSave({ ...p, id, images, price: Number(p.price) || 0 });
          }}
          className="bg-background border border-border w-full max-w-3xl p-6 lg:p-8"
        >
          <header className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">{isNew ? "New product" : "Edit product"}</h2>
            <button type="button" onClick={onClose} className="eyebrow link-underline">Close</button>
          </header>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" value={p.name} onChange={(v) => update("name", v)} required />
            <Field label="ID (slug)" value={p.id} onChange={(v) => update("id", v)} placeholder="auto-generated" disabled={!isNew} />
            <Field label="Price (BDT)" type="number" value={String(p.price)} onChange={(v) => update("price", Number(v))} required />
            <Select label="Category" value={p.category} options={categories} onChange={(v) => update("category", v as Category)} />
            <Select label="Gender" value={p.gender} options={["women", "men"]} onChange={(v) => update("gender", v as Gender)} />
            <Field label="Color name" value={p.color} onChange={(v) => update("color", v)} />
            <label className="block sm:col-span-2">
              <span className="eyebrow block mb-2">Color hex</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={p.colorHex}
                  onChange={(e) => update("colorHex", e.target.value)}
                  className="h-10 w-14 border border-border bg-transparent"
                />
                <input
                  value={p.colorHex}
                  onChange={(e) => update("colorHex", e.target.value)}
                  className="flex-1 bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground font-mono"
                />
              </div>
            </label>
            <label className="block sm:col-span-2">
              <span className="eyebrow block mb-2">Images (one URL per line)</span>
              <textarea
                rows={3}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                className="w-full bg-transparent border border-border p-3 text-sm font-mono focus:outline-none focus:border-foreground"
                placeholder="https://…"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="eyebrow block mb-2">Description</span>
              <textarea
                rows={3}
                value={p.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-foreground"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="eyebrow block mb-2">Materials</span>
              <input
                value={p.materials}
                onChange={(e) => update("materials", e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!p.isNew} onChange={(e) => update("isNew", e.target.checked)} />
              Mark as New
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!p.isBestseller} onChange={(e) => update("isBestseller", e.target.checked)} />
              Mark as Bestseller
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="border border-foreground px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background">
              Cancel
            </button>
            <button type="submit" className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", ...rest
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
        className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground disabled:opacity-50"
      />
    </label>
  );
}

function Select({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void; }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground capitalize"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
