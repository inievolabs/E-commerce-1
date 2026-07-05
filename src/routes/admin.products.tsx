import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { useAdminStore, type Product, type Category, type Gender } from "@/lib/admin-store";
import { formatPrice } from "@/lib/cart";
import { productImageUrl } from "@/lib/cloudinary-image";
import {
  DEFAULT_RETURNS_INFO,
  DEFAULT_SHIPPING_INFO,
  DEFAULT_SIZE_GUIDE,
  DEFAULT_SIZE_GUIDE_TITLE,
  DEFAULT_TAX_LABEL,
  DEFAULT_TRUST_BADGES,
  defaultShowSizeGuide,
  defaultSizesForCategory,
  type SizeGuideRow,
  type TrustBadge,
} from "@/lib/product-defaults";

export const Route = createFileRoute("/admin/products")({
  ssr: false,
  component: AdminProducts,
});

function emptyProduct(categories: { id: Category }[]): Product {
  const category = categories[0]?.id ?? "bags";
  return {
    id: "",
    name: "",
    price: 0,
    category,
    gender: "women",
    color: "",
    colorHex: "#000000",
    images: [],
    description: "",
    materials: "",
    sizes: defaultSizesForCategory(category),
    taxIncluded: true,
    taxLabel: DEFAULT_TAX_LABEL,
    shippingInfo: DEFAULT_SHIPPING_INFO,
    returnsInfo: DEFAULT_RETURNS_INFO,
    sizeGuide: [...DEFAULT_SIZE_GUIDE],
    sizeGuideTitle: DEFAULT_SIZE_GUIDE_TITLE,
    showSizeGuide: defaultShowSizeGuide(category),
    trustBadges: [...DEFAULT_TRUST_BADGES],
    stock: 12,
  };
}

function AdminProducts() {
  const { products, categories, inventory, upsertProduct, deleteProduct } = useAdminStore();
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

  if (editing) {
    return (
      <ProductEditor
        initial={editing}
        categories={categories.map((c) => c.id)}
        onClose={() => setEditing(null)}
        onSave={(p) => {
          upsertProduct(p);
          setEditing(null);
        }}
      />
    );
  }

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
              <th className="px-4 py-3 font-medium text-right">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
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
                      <p className="text-xs text-muted-foreground font-mono">{p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3 capitalize">{p.gender}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {p.stock ?? inventory[p.id]?.stock ?? 0}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() =>
                      setEditing({
                        ...p,
                        stock: p.stock ?? inventory[p.id]?.stock ?? 0,
                      })
                    }
                    className="eyebrow link-underline mr-4"
                  >
                    Edit
                  </button>
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
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  No products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  const [images, setImages] = useState<string[]>(initial.images);
  const [sizesText, setSizesText] = useState((initial.sizes ?? []).join(", "));
  const [imagesUploading, setImagesUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isNew = !initial.id;

  const update = <K extends keyof Product>(k: K, v: Product[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const updateSizeGuideRow = (index: number, field: keyof SizeGuideRow, value: string) => {
    const rows = [...(p.sizeGuide ?? [])];
    rows[index] = { ...rows[index], [field]: value };
    update("sizeGuide", rows);
  };

  const updateTrustBadge = (index: number, field: keyof TrustBadge, value: string) => {
    const badges = [...(p.trustBadges ?? [])];
    badges[index] = { ...badges[index], [field]: value };
    update("trustBadges", badges);
  };
  return (
    <div>
      {/* Sticky top bar with back navigation */}
      <div className="sticky top-14 z-10 bg-secondary border-b border-border -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="eyebrow link-underline shrink-0 flex items-center gap-1"
            aria-label="Back to products"
          >
            ← Back
          </button>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <h2 className="font-serif text-lg sm:text-2xl truncate hidden sm:block">
            {isNew ? "New product" : "Edit product"}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="border border-foreground px-4 py-2 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-editor-form"
            disabled={imagesUploading}
            className="bg-foreground text-background px-4 py-2 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-50"
          >
            {imagesUploading ? "Uploading…" : "Save"}
          </button>
        </div>
      </div>

      <h2 className="font-serif text-2xl sm:hidden mb-6">{isNew ? "New product" : "Edit product"}</h2>

      <form
        id="product-editor-form"
        onSubmit={(e) => {
          e.preventDefault();
          setFormError(null);
          if (imagesUploading) {
            setFormError("Please wait for image uploads to finish.");
            return;
          }
          if (images.length === 0) {
            setFormError("Add at least one product image.");
            return;
          }
          const id = p.id || `p-${Date.now().toString(36)}`;
          const sizes = sizesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onSave({
            ...p,
            id,
            images,
            sizes,
            price: Number(p.price) || 0,
            stock: Math.max(0, Number(p.stock) || 0),
          });
        }}
        className="space-y-8 max-w-3xl"
      >
        <section className="bg-background border border-border p-4 sm:p-6">
          <h3 className="eyebrow mb-4">Basics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Name" value={p.name} onChange={(v) => update("name", v)} required />
            <Field
              label="ID (slug)"
              value={p.id}
              onChange={(v) => update("id", v)}
              placeholder="auto-generated"
              disabled={!isNew}
            />
            <Field
              label="Price (৳)"
              type="number"
              value={String(p.price)}
              onChange={(v) => update("price", Number(v))}
              required
            />
            <Field
              label="Stock quantity"
              type="number"
              value={String(p.stock ?? 0)}
              onChange={(v) => update("stock", Number(v))}
              min={0}
            />
            <Select
              label="Category"
              value={p.category}
              options={categories}
              onChange={(v) => {
                const category = v as Category;
                update("category", category);
                if (!sizesText.trim()) {
                  setSizesText(defaultSizesForCategory(category).join(", "));
                }
                if (!p.showSizeGuide) {
                  update("showSizeGuide", defaultShowSizeGuide(category));
                }
              }}
            />
            <Select
              label="Gender"
              value={p.gender}
              options={["women", "men"]}
              onChange={(v) => update("gender", v as Gender)}
            />
            <Field label="Color name" value={p.color} onChange={(v) => update("color", v)} />
            <label className="block col-span-1 sm:col-span-2">
              <span className="eyebrow block mb-2">Color hex</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={p.colorHex}
                  onChange={(e) => update("colorHex", e.target.value)}
                  className="h-10 w-14 border border-border bg-transparent shrink-0"
                />
                <input
                  value={p.colorHex}
                  onChange={(e) => update("colorHex", e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground font-mono"
                />
              </div>
            </label>
            <div className="col-span-1 sm:col-span-2">
              <ProductImageUploader
                value={images}
                onChange={setImages}
                onUploadingChange={setImagesUploading}
              />
            </div>
            <label className="block col-span-1 sm:col-span-2">
              <span className="eyebrow block mb-2">Description</span>
              <textarea
                rows={3}
                value={p.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-foreground"
              />
            </label>
            <label className="block col-span-1 sm:col-span-2">
              <span className="eyebrow block mb-2">Materials</span>
              <input
                value={p.materials}
                onChange={(e) => update("materials", e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!p.isNew}
                onChange={(e) => update("isNew", e.target.checked)}
              />
              Mark as New
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!p.isBestseller}
                onChange={(e) => update("isBestseller", e.target.checked)}
              />
              Mark as Bestseller
            </label>
          </div>
        </section>

        <section className="bg-background border border-border p-4 sm:p-6">
          <h3 className="eyebrow mb-4">Pricing &amp; sizes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex items-center gap-2 text-sm col-span-1 sm:col-span-2">
              <input
                type="checkbox"
                checked={p.taxIncluded ?? true}
                onChange={(e) => update("taxIncluded", e.target.checked)}
              />
              Show tax included
            </label>
            <Field
              label="Tax label"
              value={p.taxLabel ?? DEFAULT_TAX_LABEL}
              onChange={(v) => update("taxLabel", v)}
            />
            <Field
              label="Sizes (comma-separated, leave empty for one-size)"
              value={sizesText}
              onChange={setSizesText}
              placeholder="36, 37, 38"
            />
            <label className="flex items-center gap-2 text-sm col-span-1 sm:col-span-2">
              <input
                type="checkbox"
                checked={p.showSizeGuide ?? false}
                onChange={(e) => update("showSizeGuide", e.target.checked)}
              />
              Show size guide link &amp; modal
            </label>
            <Field
              label="Size guide title"
              value={p.sizeGuideTitle ?? DEFAULT_SIZE_GUIDE_TITLE}
              onChange={(v) => update("sizeGuideTitle", v)}
            />
          </div>

          <div className="mt-4 border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[340px]">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">EU</th>
                  <th className="px-3 py-2 font-medium">UK</th>
                  <th className="px-3 py-2 font-medium">US</th>
                  <th className="px-3 py-2 font-medium">CM</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(p.sizeGuide ?? []).map((row, i) => (
                  <tr key={i}>
                    {(["eu", "uk", "us", "cm"] as const).map((field) => (
                      <td key={field} className="px-2 py-1">
                        <input
                          value={row[field]}
                          onChange={(e) => updateSizeGuideRow(i, field, e.target.value)}
                          className="w-full bg-transparent border-b border-foreground/20 py-1 text-sm focus:outline-none focus:border-foreground"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "sizeGuide",
                            (p.sizeGuide ?? []).filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-xs text-destructive"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() =>
                update("sizeGuide", [
                  ...(p.sizeGuide ?? []),
                  { eu: "", uk: "", us: "", cm: "" },
                ])
              }
              className="w-full py-2 text-xs tracking-widest uppercase border-t border-border hover:bg-muted"
            >
              + Add size row
            </button>
          </div>
        </section>

        <section className="bg-background border border-border p-4 sm:p-6">
          <h3 className="eyebrow mb-4">Trust badges</h3>
          <div className="space-y-4">
            {(p.trustBadges ?? []).map((badge, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-3 items-end">
                <Select
                  label="Icon"
                  value={badge.icon}
                  options={["truck", "hammer", "rotate-ccw", "package", "shield", "heart"]}
                  onChange={(v) => updateTrustBadge(i, "icon", v)}
                />
                <Field
                  label="Label"
                  value={badge.label}
                  onChange={(v) => updateTrustBadge(i, "label", v)}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "trustBadges",
                      (p.trustBadges ?? []).filter((_, idx) => idx !== i),
                    )
                  }
                  className="text-xs text-destructive pb-2 text-left sm:text-right"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update("trustBadges", [...(p.trustBadges ?? []), { icon: "truck", label: "" }])
              }
              className="text-xs tracking-widest uppercase link-underline"
            >
              + Add badge
            </button>
          </div>
        </section>

        <section className="bg-background border border-border p-4 sm:p-6">
          <h3 className="eyebrow mb-4">Shipping &amp; returns</h3>
          <div className="grid gap-5">
            <label className="block">
              <span className="eyebrow block mb-2">Shipping info</span>
              <textarea
                rows={2}
                value={p.shippingInfo ?? DEFAULT_SHIPPING_INFO}
                onChange={(e) => update("shippingInfo", e.target.value)}
                className="w-full bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-foreground"
              />
            </label>
            <label className="block">
              <span className="eyebrow block mb-2">Returns info</span>
              <textarea
                rows={2}
                value={p.returnsInfo ?? DEFAULT_RETURNS_INFO}
                onChange={(e) => update("returnsInfo", e.target.value)}
                className="w-full bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-foreground"
              />
            </label>
          </div>
        </section>

        {formError && (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}

        {/* Bottom save/cancel row (visible without scrolling to sticky bar on very long forms) */}
        <div className="flex flex-wrap justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={onClose}
            className="border border-foreground px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={imagesUploading}
            className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-50"
          >
            {imagesUploading ? "Uploading…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
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
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
