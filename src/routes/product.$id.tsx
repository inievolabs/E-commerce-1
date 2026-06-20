import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Heart, Star } from "lucide-react";
import { getProduct, products, type Product } from "@/data/products";
import { formatPrice, useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }): { product: Product } => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Velin Studio` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — Velin Studio` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.images[0] },
          { property: "og:url", content: `/product/${loaderData.product.id}` },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/product/${loaderData.product.id}` }] : [],
  }),
  notFoundComponent: () => (
    <div className="px-5 py-32 text-center">
      <h1 className="font-serif text-4xl">Piece not found</h1>
      <Link to="/shop" className="mt-6 inline-block eyebrow link-underline">Return to shop</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="px-5 py-32 text-center">
      <h1 className="font-serif text-3xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

const SIZES = ["S", "M", "L"];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add, open } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [accordion, setAccordion] = useState<string | null>("desc");
  const [zoomed, setZoomed] = useState(false);

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-8 lg:py-12">
      <nav className="mb-8 text-xs tracking-widest uppercase text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_460px] gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="grid grid-cols-[64px_1fr] gap-4">
          <div className="hidden lg:flex flex-col gap-2">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-[3/4] overflow-hidden bg-muted border ${activeImage === i ? "border-foreground" : "border-transparent"}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div>
            <div
              className="relative overflow-hidden bg-muted aspect-[3/4] cursor-zoom-in"
              onClick={() => setZoomed((z) => !z)}
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700"
                style={{ transform: zoomed ? "scale(1.8)" : "scale(1)" }}
              />
            </div>
            <div className="flex lg:hidden gap-2 mt-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-1 aspect-[3/4] overflow-hidden bg-muted border ${activeImage === i ? "border-foreground" : "border-transparent"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info — sticky */}
        <div className="lg:sticky lg:top-28 self-start">
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-lg tabular-nums">{formatPrice(product.price)}</p>
            <span className="text-xs text-muted-foreground">· Tax included</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-foreground/70">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">128 reviews</span>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <p className="eyebrow mb-3">Colour · {product.color}</p>
            <div className="flex gap-2">
              <button
                className="h-9 w-9 rounded-full border-2 border-foreground p-0.5"
                aria-label={product.color}
              >
                <span className="block h-full w-full rounded-full" style={{ background: product.colorHex }} />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">Size</p>
              <button className="text-xs tracking-widest uppercase link-underline">Size guide</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-3 text-sm border ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3">−</button>
              <span className="px-4 text-sm tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-3">+</button>
            </div>
            <button className="p-3 border border-border" aria-label="Save">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                add(product.id, qty, { color: product.color, size });
                open();
              }}
              className="w-full bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
            >
              Add to bag
            </button>
            <Link
              to="/checkout"
              onClick={() => add(product.id, qty, { color: product.color, size })}
              className="block text-center border border-foreground py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              Buy now
            </Link>
          </div>

          <div className="mt-10 divide-y divide-border border-y border-border">
            {[
              { id: "desc", label: "Description", body: product.description },
              { id: "mat", label: "Materials & care", body: product.materials },
              {
                id: "ship",
                label: "Shipping & returns",
                body: "Complimentary express shipping worldwide. Free 30-day returns on unworn pieces.",
              },
            ].map((row) => {
              const open = accordion === row.id;
              return (
                <div key={row.id}>
                  <button
                    onClick={() => setAccordion(open ? null : row.id)}
                    className="w-full flex items-center justify-between py-5 text-sm"
                  >
                    <span className="tracking-widest uppercase text-xs">{row.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{row.body}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24 border-t border-border pt-16">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">What our clients say</h2>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex text-foreground">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm">4.9 · 128 reviews</span>
            </div>
          </div>
          <div className="space-y-8">
            {[
              { name: "Élise R.", t: "An everyday piece", q: "Beautifully made — the leather has softened gracefully and the proportions are perfect." },
              { name: "Marc H.", t: "Worth every penny", q: "Quietly luxurious. You feel the care in the stitching the moment you hold it." },
              { name: "Naomi K.", t: "Timeless", q: "Nothing about it shouts, which is exactly what I wanted." },
            ].map((r) => (
              <article key={r.name} className="border-b border-border pb-8">
                <div className="flex text-foreground/70 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p className="font-serif text-xl">"{r.t}"</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.q}</p>
                <p className="mt-3 text-xs tracking-widest uppercase">— {r.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <div className="mb-10">
            <p className="eyebrow">You may also like</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Complementary pieces</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12 lg:gap-x-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
