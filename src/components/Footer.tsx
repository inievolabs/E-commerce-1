import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

const LOGO =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781984765/velin_studio_logo_zujxjx.svg";
const INIEVO =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781425405/Inievo_ujfqno.png";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "Women", to: "/shop", search: { gender: "women" } },
      { label: "Men", to: "/shop", search: { gender: "men" } },
      { label: "Luggage", to: "/shop", search: { category: "luggage" } },
      { label: "New arrivals", to: "/shop", search: { sort: "newest" } },
    ],
  },
  {
    title: "Customer care",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Shipping & returns", to: "/shipping-returns" },
      { label: "Care guide", to: "/about" },
    ],
  },
  {
    title: "Maison",
    links: [
      { label: "Our story", to: "/about" },
      { label: "Craftsmanship", to: "/about" },
      { label: "Boutiques", to: "/contact" },
      { label: "Journal", to: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Shipping & Returns", to: "/shipping-returns" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-16 lg:py-20 grid gap-12 lg:grid-cols-[1fr_2.4fr_1fr]">
        <div>
          <h3 className="font-serif text-3xl">Velin Studio</h3>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Quietly considered leather goods, designed in Paris and crafted by hand in Italy.
          </p>
          <div className="mt-6 flex gap-4 text-foreground/70">
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Youtube" className="hover:text-foreground"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {cols.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      search={(l as { search?: Record<string, string> }).search as never}
                      className="text-sm text-foreground/80 hover:text-foreground link-underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="eyebrow mb-5">Newsletter</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Private invitations, new arrivals and the slow stories behind each piece.
          </p>
          <NewsletterForm source="footer" />
        </div>
      </div>

      <div className="border-t border-border bg-background/25">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-2 py-8 border-b border-border/50">
            <span className="px-3 py-1.5 border border-border/60 text-[9px] tracking-[0.28em] text-muted-foreground/65 uppercase">
              Cash on delivery only
            </span>
          </div>

          <div className="flex flex-col items-center py-12 text-center">
            <img src={LOGO} alt="Velin Studio" className="h-8 opacity-90" />
            <p className="mt-5 text-[10px] tracking-[0.24em] uppercase text-muted-foreground/55">
              © {new Date().getFullYear()} Velin Studio · All rights reserved
            </p>
          </div>

          <div className="flex justify-center pb-10">
            <a
              href="https://inievo.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Built by Inievo — visit inievo.com"
              className="group relative inline-flex items-center gap-5 px-8 py-4 transition-all duration-500 hover:-translate-y-px"
            >
              <span
                className="pointer-events-none absolute inset-0 border border-border/50 bg-card/40 transition-colors duration-500 group-hover:border-gold/35 group-hover:bg-card/70"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />

              <span className="relative text-[10px] font-bold tracking-[0.24em] uppercase text-muted-foreground/55 transition-colors duration-500 group-hover:text-muted-foreground/75">
                Built by
              </span>

              <span className="relative h-4 w-px bg-gold/35" aria-hidden />

              <img
                src={INIEVO}
                alt="Inievo"
                className="relative h-[18px] w-auto transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
