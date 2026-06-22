import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronDown, X, Truck, Hammer, RotateCcw, Heart, Package, Shield } from "lucide-react";
import { type Product } from "@/data/products";
import { fetchCatalogProductServer } from "@/lib/catalog";
import { productImageUrl } from "@/lib/cloudinary-image";
import { useCatalog } from "@/lib/use-catalog";
import { formatPrice, useCart } from "@/lib/cart";
import { absoluteUrl } from "@/lib/site-url";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/ProductCard";
import type { TrustBadge } from "@/lib/product-defaults";
export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }): Promise<{ product: Product }> => {
    const product = await fetchCatalogProductServer(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const pageUrl = product ? absoluteUrl(`/product/${product.id}`) : "";
    const imageUrl = product?.images[0] ? productImageUrl(product.images[0], "card") : "";
    return {
      meta: product
        ? [
            { title: `${product.name} — Velin Studio` },
            { name: "description", content: product.description },
            { property: "og:title", content: `${product.name} — Velin Studio` },
            { property: "og:description", content: product.description },
            { property: "og:image", content: imageUrl },
            { property: "og:url", content: pageUrl },
            { property: "og:type", content: "product" },
          ]
        : [],
      links: product ? [{ rel: "canonical", href: pageUrl }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="px-5 py-32 text-center">
      <h1 className="font-serif text-4xl">Piece not found</h1>
      <Link to="/shop" className="mt-6 inline-block eyebrow link-underline">
        Return to shop
      </Link>
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

const TRUST_ICON_MAP: Record<
  string,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  truck: Truck,
  hammer: Hammer,
  "rotate-ccw": RotateCcw,
  package: Package,
  shield: Shield,
  heart: Heart,
};

function TrustIcon({ badge }: { badge: TrustBadge }) {
  const Icon = TRUST_ICON_MAP[badge.icon] ?? Truck;
  return <Icon className="h-5 w-5 text-foreground/80" strokeWidth={1.25} />;
}

function stockLabel(stock: number | undefined): string | null {
  if (stock === undefined) return null;
  if (stock <= 0) return "Out of stock";
  if (stock <= 4) return `Only ${stock} left`;
  return "In stock";
}

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { data: catalogProducts = [] } = useCatalog();
  const { add, open, count: cartCount } = useCart();
  const wishlist = useWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const sizes = product.sizes ?? [];
  const [size, setSize] = useState<string>(sizes[Math.floor(sizes.length / 2)] ?? "");
  const [qty, setQty] = useState(1);
  const [accordion, setAccordion] = useState<string | null>("desc");
  const [lightbox, setLightbox] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setQty(1);
    const nextSizes = product.sizes ?? [];
    setSize(nextSizes[Math.floor(nextSizes.length / 2)] ?? "");
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [product.id, product.sizes]);
  // Mobile carousel — track active dot via scroll
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setActiveImage(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [product.id]);

  const related = catalogProducts
    .filter(
      (p) => p.id !== product.id && p.category === product.category && p.gender === product.gender,
    )
    .slice(0, 6);
  const completeTheLook = catalogProducts
    .filter((p) => p.category !== product.category && p.gender === product.gender)
    .slice(0, 3);

  const isWished = wishlist.has(product.id);
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const stockStatus = stockLabel(product.stock);
  const trustBadges = product.trustBadges ?? [];
  const shippingReturnsBody = [product.shippingInfo, product.returnsInfo].filter(Boolean).join(" ");
  const deliveryImages = {
    thumb: product.images.map((src) => productImageUrl(src, "thumb")),
    gallery: product.images.map((src) => productImageUrl(src, "gallery")),
    full: product.images.map((src) => productImageUrl(src, "full")),
  };

  const handleAddToCart = () => {
    if (outOfStock) return;
    if (sizes.length > 0 && !size) return;
    add(product.id, qty, { color: product.color, size: size || undefined });
    open();
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: deliveryImages.gallery,
    sku: product.id,
    brand: { "@type": "Brand", name: "Velin Studio" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: "BDT",
      price: product.price,
      availability:
        product.stock === undefined || product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="bg-background pb-28 md:pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mx-auto max-w-[1500px] px-5 lg:px-10 pt-6 lg:pt-10">
        {/* Breadcrumb */}
        <nav className="mb-6 lg:mb-10 text-[11px] tracking-widest uppercase text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2 opacity-60">/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors capitalize">
            {product.category}
          </Link>
          <span className="mx-2 opacity-60">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="lg:grid lg:grid-cols-[1fr_minmax(360px,440px)] lg:gap-16 lg:items-start">
          {/* GALLERY */}
          <div className="lg:sticky lg:top-24 self-start">
            {/* Desktop gallery */}
            <div className="hidden lg:grid grid-cols-[72px_1fr] gap-4">
              <div className="flex flex-col gap-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`shrink-0 aspect-[3/4] overflow-hidden bg-muted border transition-all duration-200 ${
                      activeImage === i
                        ? "border-foreground opacity-100"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={deliveryImages.thumb[i]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setLightbox(true)}
                className="relative overflow-hidden bg-muted aspect-[3/4] cursor-zoom-in group"
                aria-label="Open image gallery"
              >
                {product.images.map((src, i) => (
                  <img
                    key={i}
                    src={deliveryImages.gallery[i]}
                    alt={i === activeImage ? product.name : ""}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out"
                    style={{ opacity: i === activeImage ? 1 : 0 }}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                ))}
              </button>
            </div>

            {/* Tablet gallery */}
            <div className="hidden md:block lg:hidden">
              <button
                onClick={() => setLightbox(true)}
                className="relative w-full overflow-hidden bg-muted aspect-[3/4]"
                aria-label="Open image gallery"
              >
                {product.images.map((src, i) => (
                  <img
                    key={i}
                    src={deliveryImages.gallery[i]}
                    alt={i === activeImage ? product.name : ""}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                    style={{ opacity: i === activeImage ? 1 : 0 }}
                  />
                ))}
              </button>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-[3/4] overflow-hidden bg-muted border ${
                      activeImage === i ? "border-foreground" : "border-transparent opacity-70"
                    }`}
                  >
                    <img
                      src={deliveryImages.thumb[i]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile swipeable carousel */}
            <div className="md:hidden -mx-5">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: "none" }}
              >
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightbox(true)}
                    className="relative shrink-0 w-screen snap-center aspect-[3/4] bg-muted"
                    aria-label={`Open image ${i + 1}`}
                  >
                    <img
                      src={deliveryImages.gallery[i]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </button>
                ))}
              </div>
              {product.images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const el = carouselRef.current;
                        if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                      }}
                      aria-label={`Go to image ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        i === activeImage ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INFO */}
          <div className="mt-8 md:mt-10 lg:mt-0">
            <p className="eyebrow">{product.category}</p>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl lg:text-[2.5rem] leading-tight">
              {product.name}
            </h1>
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <p className="text-xl tabular-nums">{formatPrice(product.price)}</p>
              {product.taxIncluded !== false && (
                <span className="text-xs text-muted-foreground">
                  {product.taxLabel ?? "Tax included"}
                </span>
              )}
              {stockStatus && (
                <span
                  className={`text-xs ${outOfStock ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {stockStatus}
                </span>
              )}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Color */}
            <div className="mt-8">
              <p className="eyebrow mb-3">
                Colour · <span className="text-foreground">{product.color}</span>
              </p>
              <div className="flex gap-2.5">
                <button
                  className="h-10 w-10 rounded-full border-2 border-foreground p-0.5 transition-transform hover:scale-105"
                  aria-label={product.color}
                  aria-pressed
                >
                  <span
                    className="block h-full w-full rounded-full"
                    style={{ background: product.colorHex }}
                  />
                </button>
              </div>
            </div>

            {/* Size */}
            {sizes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="eyebrow">
                    Size · <span className="text-foreground">EU</span>
                  </p>
                  {product.showSizeGuide && (product.sizeGuide?.length ?? 0) > 0 && (
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[11px] tracking-widest uppercase link-underline"
                    >
                      Size guide
                    </button>
                  )}
                </div>{" "}
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-3 text-sm rounded-full border transition-all duration-150 ${
                        size === s
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-8">
              <p className="eyebrow mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-5 py-2.5 text-lg hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-5 text-sm tabular-nums min-w-[2.5rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-5 py-2.5 text-lg hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex items-stretch gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="flex-1 bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {outOfStock ? "Out of stock" : "Add to bag"}
              </button>{" "}
              <button
                onClick={() => wishlist.toggle(product.id)}
                aria-pressed={isWished}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                className={`w-14 grid place-items-center border transition-all duration-200 active:scale-95 ${
                  isWished
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                    : "border-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                <Heart
                  className="h-5 w-5"
                  fill={isWished ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {trustBadges.length > 0 && (
              <div className="mt-8 grid grid-cols-3 gap-4 border-y border-border py-5">
                {trustBadges.map((badge) => (
                  <div
                    key={`${badge.icon}-${badge.label}`}
                    className="flex flex-col items-center text-center gap-2"
                  >
                    <TrustIcon badge={badge} />
                    <p className="text-[10.5px] leading-snug tracking-wide text-muted-foreground">
                      {badge.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {/* Accordion */}
            <div className="mt-2 divide-y divide-border">
              {[
                { id: "desc", label: "Description", body: product.description },
                { id: "mat", label: "Materials & care", body: product.materials },
                {
                  id: "ship",
                  label: "Shipping & returns",
                  body: shippingReturnsBody,
                },
              ].map((row) => {
                const isOpen = accordion === row.id;
                return (
                  <div key={row.id}>
                    <button
                      onClick={() => setAccordion(isOpen ? null : row.id)}
                      className="w-full flex items-center justify-between py-5"
                      aria-expanded={isOpen}
                    >
                      <span className="tracking-widest uppercase text-[11px]">{row.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className="grid transition-[grid-template-rows] duration-200 ease-out"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
                          {row.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Complete the Look */}
        {completeTheLook.length > 0 && (
          <section className="mt-20 lg:mt-28">
            <div className="mb-8 lg:mb-10">
              <p className="eyebrow">Complete the look</p>
              <h2 className="mt-2 font-serif text-2xl md:text-3xl">Pair it with</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 lg:gap-x-8">
              {completeTheLook.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* You may also like */}
        {related.length > 0 && (
          <section className="mt-20 lg:mt-28">
            <div className="mb-8 lg:mb-10 flex items-end justify-between">
              <div>
                <p className="eyebrow">You may also like</p>
                <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                  More from {product.category}
                </h2>
              </div>
            </div>
            {/* Mobile: horizontal scroll. Desktop: grid */}
            <div
              className="md:hidden -mx-5 overflow-x-auto no-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex gap-4 px-5 snap-x snap-mandatory">
                {related.map((p) => (
                  <div key={p.id} className="shrink-0 w-[62vw] max-w-[260px] snap-start">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12 lg:gap-x-8">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky bottom bar (sits above MobileBottomNav) */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border"
        style={{ bottom: "calc(60px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
              {product.color}
            </span>
            <span className="text-base tabular-nums">{formatPrice(product.price)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="ml-auto flex-1 max-w-[60%] bg-foreground text-background py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {outOfStock ? "Out of stock" : `Add to bag ${cartCount > 0 ? `· ${cartCount}` : ""}`}
          </button>{" "}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-background animate-route-fade"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 z-10 h-10 w-10 grid place-items-center bg-background/70 backdrop-blur rounded-full"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-full w-full overflow-auto" style={{ touchAction: "pinch-zoom" }}>
            <div className="flex flex-col gap-2 p-2 md:gap-4 md:p-6 max-w-5xl mx-auto">
              {product.images.map((src, i) => (
                <img
                  key={i}
                  src={deliveryImages.full[i]}
                  alt={`${product.name} ${i + 1}`}
                  className="w-full h-auto object-contain"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Size guide modal */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm grid place-items-center p-4 animate-route-fade"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="bg-background max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-3 right-3 h-9 w-9 grid place-items-center hover:bg-muted rounded-full"
              aria-label="Close size guide"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="eyebrow">Size guide</p>
            <h3 className="mt-2 font-serif text-2xl">
              {product.sizeGuideTitle ?? "European sizing"}
            </h3>
            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="py-2">EU</th>
                  <th className="py-2">UK</th>
                  <th className="py-2">US</th>
                  <th className="py-2">CM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(product.sizeGuide ?? []).map((row) => (
                  <tr key={row.eu} className="tabular-nums">
                    <td className="py-2.5">{row.eu}</td>
                    <td className="py-2.5">{row.uk}</td>
                    <td className="py-2.5">{row.us}</td>
                    <td className="py-2.5">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>{" "}
          </div>
        </div>
      )}
    </div>
  );
}
