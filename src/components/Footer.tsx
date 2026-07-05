import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

const LOGO =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781984765/velin_studio_logo_zujxjx.svg";
const INTACTIC =
  "https://res.cloudinary.com/det1qnlrh/image/upload/v1782432654/Intactic_ltgcnt.png";

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
    <footer className="mt-32 border-t border-gold/15 bg-card text-card-foreground">
      {/* Upper Footer: Main columns */}
      <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-16 lg:py-24 grid gap-12 lg:grid-cols-[1.1fr_2.2fr_1.1fr]">
        
        {/* Brand identity column */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-3xl md:text-4xl tracking-wide text-foreground font-light">Velin Studio</h3>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Quietly considered leather goods, designed in Paris and crafted by hand in Florence, Italy.
            </p>
          </div>
          
          {/* Circular Hover Animated Social Icons */}
          <div className="mt-8 flex gap-3 text-foreground/75">
            <a 
              href="#" 
              aria-label="Instagram" 
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background/10 transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold hover:scale-105"
            >
              <Instagram className="h-4 w-4 transition-transform duration-300 group-hover:rotate-6" />
            </a>
            <a 
              href="#" 
              aria-label="Facebook" 
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background/10 transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold hover:scale-105"
            >
              <Facebook className="h-4 w-4 transition-transform duration-300 group-hover:scale-105" />
            </a>
            <a 
              href="#" 
              aria-label="Youtube" 
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background/10 transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold hover:scale-105"
            >
              <Youtube className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-6" />
            </a>
          </div>
        </div>

        {/* Link grid columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {cols.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-gold font-medium tracking-[0.25em] mb-6 relative inline-block after:absolute after:bottom-[-4px] after:left-0 after:w-4 after:h-px after:bg-gold/40">
                {col.title}
              </p>
              <ul className="space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      search={(l as { search?: Record<string, string> }).search as never}
                      className="text-[13.5px] text-muted-foreground hover:text-gold/90 transition-all duration-300 hover:pl-0.5 link-underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter column */}
        <div className="flex flex-col justify-start">
          <p className="eyebrow text-gold font-medium tracking-[0.25em] mb-6 relative inline-block after:absolute after:bottom-[-4px] after:left-0 after:w-4 after:h-px after:bg-gold/40">
            Newsletter
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Private invitations, seasonal previews, and the slow stories behind each piece.
          </p>
          <div className="mt-2">
            <NewsletterForm source="footer" className="focus-within:border-gold transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* Lower Footer: COD Badge, Logo, Copyright, and Builder */}
      <div className="border-t border-border bg-background/30">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10">
          
          {/* Elegant COD Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 py-8 border-b border-border/30">
            <span className="px-4 py-2 border border-gold/25 bg-background/40 text-[9.5px] tracking-[0.3em] text-gold/85 uppercase font-medium rounded-sm backdrop-blur-sm">
              Cash on delivery only
            </span>
          </div>

          {/* Logo & Copyright */}
          <div className="flex flex-col items-center py-12 text-center">
            <img src={LOGO} alt="Velin Studio" className="h-8 opacity-90 transition-opacity hover:opacity-100 duration-300" />
            <p className="mt-5 text-[10px] tracking-[0.24em] uppercase text-muted-foreground/60">
              © {new Date().getFullYear()} Velin Studio · All rights reserved
            </p>
          </div>

          {/* Builder Badge (Intactic) */}
          <div className="flex justify-center pb-10">
            <a
              href="https://intactic.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Built by Intactic — visit intactic.tech"
              className="group relative inline-flex items-center gap-5 px-8 py-4 transition-all duration-500 hover:-translate-y-0.5 shadow-sm rounded-sm hover:shadow-md"
            >
              <span
                className="pointer-events-none absolute inset-0 border border-border/50 bg-card/45 transition-colors duration-500 group-hover:border-gold/40 group-hover:bg-card/95 rounded-sm"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />

              <span className="relative text-[10px] font-bold tracking-[0.24em] uppercase text-muted-foreground/60 transition-colors duration-500 group-hover:text-muted-foreground/80">
                Built by
              </span>

              <span className="relative h-4 w-px bg-gold/40" aria-hidden />

              <img
                src={INTACTIC}
                alt="Intactic"
                className="relative h-[18px] w-auto transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
