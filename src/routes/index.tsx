import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import {
  craftImage,
  editorialImages,
  heroImage,
  menBannerImage,
  products,
  womenBannerImage,
} from "@/data/products";

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
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroImage },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const newArrivals = products.filter((p) => p.isNew);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Velin Studio Autumn collection"
          className="absolute inset-0 h-full w-full object-cover animate-fade-in-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-foreground/40" />
        <div className="relative z-10 h-full mx-auto max-w-[1500px] px-5 lg:px-10 flex flex-col justify-end pb-16 lg:pb-24">
          <div className="max-w-xl text-background animate-fade-up">
            <p className="eyebrow text-background/80">The Autumn Collection</p>
            <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
              A quieter form of luxury.
            </h1>
            <p className="mt-6 text-sm md:text-base text-background/90 max-w-md leading-relaxed">
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

      {/* Split banner */}
      <section className="mx-auto max-w-[1500px] px-5 lg:px-10 py-20 lg:py-28 grid md:grid-cols-2 gap-4 lg:gap-6">
        {[
          { img: womenBannerImage, label: "Women", search: { gender: "women" } },
          { img: menBannerImage, label: "Men", search: { gender: "men" } },
        ].map((b) => (
          <Link
            key={b.label}
            to="/shop"
            search={b.search as never}
            className="group relative block aspect-[4/5] overflow-hidden bg-muted"
          >
            <img
              src={b.img}
              alt={`Shop ${b.label}`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-background">
              <h2 className="font-serif text-4xl md:text-6xl">{b.label}</h2>
              <span className="mt-3 eyebrow text-background/90 link-underline">Shop now</span>
            </div>
          </Link>
        ))}
      </section>

      {/* New arrivals carousel */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10 flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow">Just arrived</p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">New arrivals</h2>
          </div>
          <Link to="/shop" search={{ sort: "newest" } as never} className="hidden md:inline-block eyebrow link-underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-5 lg:gap-8 px-5 lg:px-10 pb-4 snap-x snap-mandatory">
            {newArrivals.map((p) => (
              <div key={p.id} className="shrink-0 w-[78%] sm:w-[44%] lg:w-[24%] snap-start">
                <ProductCard product={p} />
              </div>
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
              Every Velin piece is finished by a small atelier outside Florence — leather selected by hand,
              edges painted in seven passes, hardware cast in solid brass. We measure time in care, not output.
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

      {/* Lookbook */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10 mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">Lookbook</p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">@velin.studio</h2>
          </div>
        </div>
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
          {editorialImages.map((src, i) => (
            <a key={i} href="#" className="block aspect-square overflow-hidden bg-muted">
              <img src={src} alt="Editorial" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </a>
          ))}
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
          <form
            className="mt-8 flex border-b border-background/40 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent py-3 text-sm text-background placeholder:text-background/60 focus:outline-none"
            />
            <button className="text-xs tracking-[0.22em] uppercase">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
