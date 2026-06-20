import { createFileRoute, Link } from "@tanstack/react-router";
import { craftImage, editorialImages } from "@/data/products";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our story — Velin Studio" },
      { name: "description", content: "Velin Studio is a quiet maison of leather goods designed in Paris and crafted by hand in Italy." },
      { property: "og:title", content: "Our story — Velin Studio" },
      { property: "og:url", content: "/about" },
      { property: "og:image", content: craftImage },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 lg:px-10 pt-20 pb-12 text-center">
        <p className="eyebrow">The Maison</p>
        <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[1.02]">
          A practice of patience, in leather.
        </h1>
        <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed">
          Velin Studio was founded in 2017 between a small studio in the Marais and a family atelier
          outside Florence. We make leather goods the slow way — pieces that age, soften, and become
          a part of a life.
        </p>
      </section>

      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <img src={craftImage} alt="Atelier" className="absolute inset-0 h-full w-full object-cover" />
      </section>

      <section className="mx-auto max-w-3xl px-5 lg:px-10 py-20 lg:py-28">
        <p className="eyebrow text-center">Our craft</p>
        <h2 className="mt-4 font-serif text-3xl md:text-5xl text-center">Five hands, one piece.</h2>
        <div className="mt-10 space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p>
            Each bag passes through five artisans before it leaves our workshop. The leather is
            selected by hand from a tannery we have worked with for over twenty years, then cut,
            skived, stitched, and finished — edges painted in seven careful passes, then polished
            with beeswax until they glow.
          </p>
          <p>
            We refuse trends. We refuse seasonal change for the sake of change. Our collection grows
            slowly, by addition, and almost never by subtraction. A Velin piece purchased today will
            still be sold five years from now, and worn for far longer.
          </p>
          <p>
            We design in Paris, in a small studio with a single window. We make in Tuscany, in a
            workshop our friends still call "the small one." We hope, when you hold a piece, you
            feel both places.
          </p>
        </div>
      </section>

      <section className="bg-secondary py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-5 lg:px-10 text-center">
          <p className="eyebrow">A note from the founder</p>
          <p className="mt-6 font-serif text-2xl md:text-4xl leading-tight">
            "We wanted to make objects that ask nothing of you — that simply, quietly, last."
          </p>
          <p className="mt-6 text-sm tracking-widest uppercase">— Camille Vélin, Founder</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 lg:px-10 py-20 grid grid-cols-2 md:grid-cols-3 gap-1">
        {editorialImages.slice(0, 6).map((src, i) => (
          <div key={i} className="aspect-square overflow-hidden bg-muted">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </section>

      <section className="bg-foreground text-background py-20 text-center">
        <h2 className="font-serif text-3xl md:text-5xl">Visit the collection.</h2>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center justify-center bg-background text-foreground px-8 py-4 text-xs tracking-[0.22em] uppercase"
        >
          Shop now
        </Link>
      </section>
    </div>
  );
}
