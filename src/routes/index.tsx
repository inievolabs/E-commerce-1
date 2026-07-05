import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductCard } from "@/components/ProductCard";
import {
  craftImage,
  heroImage,
  menBannerImage,
  womenBannerImage,
} from "@/data/products";
import { useCatalog } from "@/lib/use-catalog";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velin Studio — Quietly Considered Leather Goods" },
      {
        name: "description",
        content:
          "Discover handcrafted handbags, luggage, slippers and wallets from Velin Studio — designed in Paris, made in Italy.",
      },
      { property: "og:title", content: "Velin Studio" },
      { property: "og:url", content: absoluteUrl("/") },
      {
        property: "og:image",
        content:
          typeof heroImage === "string" && heroImage.startsWith("http")
            ? heroImage
            : absoluteUrl(heroImage),
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: Home,
});

function Home() {
  const { data: products = [] } = useCatalog();
  const newArrivals = products.filter((p) => p.isNew).slice(0, 6);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-muted">
        <img
          src={heroImage}
          alt="Velin Studio leather collection"
          className="absolute inset-0 h-full w-full object-cover object-[center_42%] animate-fade-in-slow"
        />
        <div className="absolute inset-0 bg-foreground/20" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/45 to-foreground/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-foreground/55 via-foreground/20 to-transparent lg:from-foreground/45"
          aria-hidden
        />
        <div className="relative z-10 h-full mx-auto max-w-[1500px] px-5 lg:px-10 flex flex-col justify-end pb-16 lg:pb-24">
          <div className="max-w-xl text-background animate-fade-up drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
            <p className="eyebrow text-background/95">The Autumn Collection</p>
            <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight text-background">
              A quieter form of luxury.
            </h1>
            <p className="mt-6 text-sm md:text-base text-background/95 max-w-md leading-relaxed">
              Pieces shaped by patience, finished by hand, and made to be carried for years.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 text-xs tracking-[0.22em] uppercase hover:bg-background/90 transition-colors"
            >
              Discover the collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Split banner — Women & Men side by side on all breakpoints */}
      <section className="mx-auto max-w-[1500px] px-5 lg:px-10 py-20 lg:py-28">
        <div className="text-center mb-12">
          <p className="eyebrow">THE COLLECTIONS</p>
          <h2 className="mt-3 font-serif text-3xl md:text-5xl">Explore curated essentials for Men and Women</h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Time-honoured leather craftsmanship, tailored for distinct sensibilities and everyday elegance.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {[
            {
              img: womenBannerImage,
              label: "Women",
              search: { gender: "women" },
              objectPosition: "center",
            },
            {
              img: menBannerImage,
              label: "Men",
              search: { gender: "men" },
              objectPosition: "center 55%",
            },
          ].map((b) => (
            <Link
              key={b.label}
              to="/shop"
              search={b.search as never}
              className="group relative block aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-muted"
            >
              <img
                src={b.img}
                alt={`Shop ${b.label}`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                style={{ objectPosition: b.objectPosition }}
              />
              <div className="absolute inset-0 bg-foreground/15" aria-hidden />
              <div
                className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/55 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-10 lg:pb-12 text-background drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
                <h2 className="font-serif text-2xl sm:text-4xl lg:text-6xl text-background">
                  {b.label}
                </h2>
                <span className="mt-2 sm:mt-3 text-[9px] sm:text-[0.7rem] font-medium tracking-[0.22em] uppercase text-background link-underline">
                  Shop now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10">
          <div className="text-center mb-12">
            <p className="eyebrow">Just arrived</p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">New arrivals</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 lg:gap-x-8 lg:gap-y-16">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10">
          <div className="text-center mb-12">
            <p className="eyebrow">Maison favourites</p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">Bestsellers</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 lg:gap-x-8 lg:gap-y-16">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Our craft */}
      <section className="py-20 lg:py-32 bg-secondary">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="aspect-[4/5] overflow-hidden order-2 lg:order-1">
            <img src={craftImage} alt="Atelier" className="h-full w-full object-cover" />
          </div>
          <div className="order-1 lg:order-2 max-w-md">
            <p className="eyebrow">Our craft</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">
              Made slowly, in the hands of a few.
            </h2>
            <p className="mt-6 text-sm md:text-base text-muted-foreground leading-relaxed">
              Every Velin piece is finished by a small atelier outside Florence — leather selected
              by hand, edges painted in seven passes, hardware cast in solid brass. We measure time
              in care, not output.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-3 text-xs tracking-[0.22em] uppercase link-underline"
            >
              Read our story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter band */}
      <section className="bg-foreground text-background py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <p className="eyebrow text-background/70">Maison correspondence</p>
          <h2 className="mt-4 font-serif text-3xl md:text-5xl">Stay quietly informed.</h2>
          <p className="mt-4 text-sm text-background/80">
            Private previews, slow stories, and seasonal invitations — never more than once a month.
          </p>
          <NewsletterForm source="home" variant="dark" className="mt-8 max-w-md mx-auto" />
        </div>
      </section>
    </div>
  );
}
