import { Link } from "@tanstack/react-router";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const LOGO =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781984765/velin_studio_logo_zujxjx.svg";

const NAV: { label: string; to: string; search?: Record<string, string> }[] = [
  { label: "Women", to: "/shop", search: { gender: "women" } },
  { label: "Men", to: "/shop", search: { gender: "men" } },
  { label: "Luggage", to: "/shop", search: { category: "luggage" } },
  { label: "About", to: "/about" },
];

export function Header() {
  const { count, open } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-foreground text-background text-[10.5px] tracking-[0.22em] uppercase py-2 text-center">
        Complimentary shipping on all orders · Hand-finished in Italy
      </div>
      <header
        className={`sticky top-0 z-40 border-b border-border/60 transition-colors duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur" : "bg-background"
        }`}
      >
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10 h-16 lg:h-20 grid grid-cols-[1fr_auto_1fr] items-center">
          <nav className="hidden lg:flex items-center gap-8 text-[12px] tracking-[0.18em] uppercase">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search as never}
                className="link-underline text-foreground/80 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden justify-self-start p-2 -ml-2 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="justify-self-center flex items-center">
            <img src={LOGO} alt="Velin Studio" className="h-8 lg:h-10 w-auto" />
          </Link>

          <div className="justify-self-end flex items-center gap-1 lg:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-foreground/80 hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button className="hidden lg:inline-flex p-2 text-foreground/80 hover:text-foreground" aria-label="Account">
              <User className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={open}
              className="relative p-2 text-foreground/80 hover:text-foreground"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-foreground text-background text-[10px] h-4 min-w-4 px-1 rounded-full grid place-items-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background animate-fade-in-slow">
          <div className="flex items-center justify-between px-5 h-16 border-b border-border/60">
            <img src={LOGO} alt="Velin Studio" className="h-8" />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 -mr-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-10 gap-6">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search as never}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-3xl text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-border my-4" />
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="eyebrow text-foreground">
              Contact
            </Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="eyebrow text-foreground">
              Bag
            </Link>
          </nav>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur animate-fade-in-slow">
          <div className="flex items-center justify-end px-5 h-16">
            <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mx-auto max-w-3xl px-6 mt-20">
            <p className="eyebrow mb-6">Search</p>
            <input
              autoFocus
              placeholder="What are you looking for?"
              className="w-full bg-transparent border-b border-foreground/40 py-4 text-2xl md:text-4xl font-serif placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground"
            />
            <p className="eyebrow mt-8">Popular</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Shoulder bag", "Weekender", "Cardholder", "Mule"].map((t) => (
                <button
                  key={t}
                  className="border border-border px-4 py-2 text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
