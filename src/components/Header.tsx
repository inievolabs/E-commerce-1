import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { SearchOverlay } from "@/components/SearchOverlay";

const LOGO =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781984765/velin_studio_logo_zujxjx.svg";

const NAV: { label: string; to: string; search?: Record<string, string> }[] = [
  { label: "Women", to: "/shop", search: { gender: "women" } },
  { label: "Men", to: "/shop", search: { gender: "men" } },
  { label: "Luggage", to: "/shop", search: { category: "luggage" } },
  { label: "About", to: "/about" },
];

const ICON_SIZE = "h-[18px] w-[18px] md:h-[22px] md:w-[22px]";

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute top-0 right-0 bg-foreground text-background text-[10px] h-4 min-w-4 px-1 rounded-full grid place-items-center">
      {count}
    </span>
  );
}

export function Header() {
  const { count, open } = useCart();
  const { isAuthenticated } = useAuth();
  const { count: wishCount } = useWishlist();
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
        FREE DELIVERY ON ALL ORDERS (LIMITED TIME)
      </div>
      <header
        className={`sticky top-0 z-40 border-b border-border/60 transition-colors duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur" : "bg-background"
        }`}
      >
        <div className="mx-auto max-w-[1500px] px-5 lg:px-10 h-16 md:h-20">
          {/* Mobile: hamburger + centered logo only (icons moved to bottom nav) */}
          <div className="flex md:hidden items-center h-full">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid place-items-center w-10 h-10 shrink-0 -ml-2 text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 flex justify-center min-w-0 px-2">
              <Link
                to="/"
                className="flex items-center transition-opacity duration-150 hover:opacity-70 active:scale-95 active:opacity-80"
                aria-label="Velin Studio — home"
              >
                <img src={LOGO} alt="Velin Studio" className="h-6 w-auto max-w-full" />
              </Link>
            </div>

            <Link
              to="/cart"
              className="relative grid place-items-center w-10 h-10 shrink-0 -mr-2 text-foreground"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-foreground text-background text-[10px] h-4 min-w-4 px-1 rounded-full grid place-items-center">
                  {count}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop: grid layout with centered logo */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-full">
            <nav className="flex items-center gap-6 text-[12px] tracking-[0.18em] uppercase">
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

            <Link
              to="/"
              className="flex items-center transition-opacity duration-150 hover:opacity-70 active:scale-95"
              aria-label="Velin Studio — home"
            >
              <img src={LOGO} alt="Velin Studio" className="h-9 lg:h-10 w-auto" />
            </Link>

            <div className="flex items-center justify-self-end gap-5 lg:gap-6">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="relative grid place-items-center w-10 h-10 shrink-0 text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search className={ICON_SIZE} />
              </button>
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="relative grid place-items-center w-10 h-10 shrink-0 text-foreground/80 hover:text-foreground transition-colors"
                aria-label={isAuthenticated ? "My account" : "Sign in"}
              >
                <User className={ICON_SIZE} />
              </Link>
              <Link
                to="/wishlist"
                className="relative grid place-items-center w-10 h-10 shrink-0 text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={ICON_SIZE} />
                {wishCount > 0 && <Badge count={wishCount} />}
              </Link>
              <button
                type="button"
                onClick={open}
                className="relative grid place-items-center w-10 h-10 shrink-0 text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className={ICON_SIZE} />
                {count > 0 && <Badge count={count} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background animate-fade-in-slow">
          <div className="flex items-center justify-between px-5 h-16 border-b border-border/60">
            <img src={LOGO} alt="Velin Studio" className="h-8" />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid place-items-center w-10 h-10 -mr-2"
            >
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
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="eyebrow text-foreground"
            >
              {isAuthenticated ? "My account" : "Sign in"}
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="eyebrow text-foreground"
            >
              Wishlist {wishCount > 0 && `(${wishCount})`}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="eyebrow text-foreground"
            >
              Bag
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="eyebrow text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
