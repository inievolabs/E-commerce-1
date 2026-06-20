import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";

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
      { label: "Shipping", to: "/contact" },
      { label: "Returns", to: "/contact" },
      { label: "Care guide", to: "/about" },
    ],
  },
  {
    title: "Maison",
    links: [
      { label: "Our story", to: "/about" },
      { label: "Craftsmanship", to: "/about" },
      { label: "Boutiques", to: "/contact" },
      { label: "Journal", to: "/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-16 lg:py-20 grid gap-12 lg:grid-cols-[1.2fr_2fr_1fr]">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
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
          <form className="mt-5 flex border-b border-foreground/30" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent py-2 text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            <button className="text-xs tracking-[0.2em] uppercase">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-8 flex flex-col items-center gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-3 opacity-70">
            <span className="px-2 py-1 border border-border text-[10px] tracking-widest">VISA</span>
            <span className="px-2 py-1 border border-border text-[10px] tracking-widest">MC</span>
            <span className="px-2 py-1 border border-border text-[10px] tracking-widest">AMEX</span>
            <span className="px-2 py-1 border border-border text-[10px] tracking-widest">PAYPAL</span>
            <span className="px-2 py-1 border border-border text-[10px] tracking-widest">APPLE PAY</span>
          </div>
          <img src={LOGO} alt="Velin Studio" className="h-6 mt-2 opacity-80" />
          <p>© {new Date().getFullYear()} Velin Studio. All rights reserved.</p>
          <div className="flex items-center gap-2 opacity-70">
            <span>Developed by</span>
            <img src={INIEVO} alt="Inievo" className="h-5 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}
