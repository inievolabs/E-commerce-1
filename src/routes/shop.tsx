import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { products, type Category, type Gender } from "@/data/products";

const searchSchema = z.object({
  gender: z.enum(["women", "men"]).optional(),
  category: z.enum(["bags", "luggage", "slippers", "wallets"]).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — Velin Studio" },
      { name: "description", content: "Browse the full Velin Studio collection of handbags, luggage, wallets and slippers." },
      { property: "og:title", content: "Shop — Velin Studio" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: Shop,
});

const CATEGORIES: Category[] = ["bags", "luggage", "slippers", "wallets"];
const GENDERS: Gender[] = ["women", "men"];
const COLORS = ["Noir", "Ivory", "Camel", "Cognac", "Burgundy", "Olive"];

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [priceMax, setPriceMax] = useState(3500);
  const [color, setColor] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.gender) list = list.filter((p) => p.gender === search.gender);
    if (search.category) list = list.filter((p) => p.category === search.category);
    if (color) list = list.filter((p) => p.color === color);
    list = list.filter((p) => p.price <= priceMax);
    if (search.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (search.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (search.sort === "newest") list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
    return list;
  }, [search, color, priceMax]);

  const title = search.gender
    ? search.gender === "women" ? "Women" : "Men"
    : search.category
    ? search.category[0].toUpperCase() + search.category.slice(1)
    : "All Collection";

  const Filters = (
    <div className="space-y-10">
      <div>
        <p className="eyebrow mb-4">Gender</p>
        <ul className="space-y-2">
          {GENDERS.map((g) => (
            <li key={g}>
              <button
                onClick={() =>
                  navigate({ search: { ...search, gender: search.gender === g ? undefined : g } })
                }
                className={`text-sm capitalize ${search.gender === g ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {g}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-4">Category</p>
        <ul className="space-y-2">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <button
                onClick={() =>
                  navigate({ search: { ...search, category: search.category === c ? undefined : c } })
                }
                className={`text-sm capitalize ${search.category === c ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-4">Price · up to ${priceMax}</p>
        <input
          type="range"
          min={200}
          max={3500}
          step={50}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-foreground"
        />
      </div>

      <div>
        <p className="eyebrow mb-4">Colour</p>
        <ul className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const active = color === c;
            return (
              <li key={c}>
                <button
                  onClick={() => setColor(active ? null : c)}
                  className={`px-3 py-1.5 text-xs border ${active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-10 lg:py-16">
      <header className="mb-10">
        <p className="eyebrow">Collection</p>
        <h1 className="mt-3 font-serif text-4xl md:text-6xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{filtered.length} pieces</p>
      </header>

      <div className="flex items-center justify-between border-y border-border py-3 mb-10 lg:hidden">
        <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 text-xs tracking-widest uppercase">
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </button>
        <SortSelect value={search.sort} onChange={(v) => navigate({ search: { ...search, sort: v } })} />
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
        <aside className="hidden lg:block">{Filters}</aside>

        <div>
          <div className="hidden lg:flex items-center justify-end mb-8">
            <SortSelect value={search.sort} onChange={(v) => navigate({ search: { ...search, sort: v } })} />
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-20 text-center">No pieces match your selection.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 lg:gap-x-8 lg:gap-y-16">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden overflow-y-auto">
          <div className="flex items-center justify-between px-5 h-16 border-b border-border">
            <p className="eyebrow">Filter</p>
            <button onClick={() => setFiltersOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{Filters}</div>
          <div className="p-6 border-t border-border sticky bottom-0 bg-background">
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value?: "newest" | "price-asc" | "price-desc";
  onChange: (v: "newest" | "price-asc" | "price-desc") => void;
}) {
  return (
    <label className="relative inline-flex items-center gap-2 text-xs tracking-widest uppercase">
      Sort
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as "newest" | "price-asc" | "price-desc")}
        className="appearance-none bg-transparent border-b border-foreground/40 pr-6 pl-2 py-1.5 focus:outline-none cursor-pointer"
      >
        <option value="">Featured</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price · Low to high</option>
        <option value="price-desc">Price · High to low</option>
      </select>
      <ChevronDown className="h-3 w-3 absolute right-0 pointer-events-none" />
    </label>
  );
}
