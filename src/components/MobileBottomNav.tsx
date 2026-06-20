import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { SearchOverlay } from "@/components/SearchOverlay";

function NavBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-2 bg-[hsl(var(--accent-gold,38_55%_45%))] text-background text-[9px] font-medium h-[15px] min-w-[15px] px-1 rounded-full grid place-items-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function MobileBottomNav() {
  const { count, open: openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { count: wishCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const accountTo = isAuthenticated ? "/account" : "/login";

  const items: {
    key: string;
    label: string;
    icon: typeof Home;
    active: boolean;
    onClick?: () => void;
    to?: string;
    badge?: number;
  }[] = [
    { key: "home", label: "Home", icon: Home, to: "/", active: isActive("/") && pathname === "/" },
    {
      key: "search",
      label: "Search",
      icon: Search,
      active: searchOpen,
      onClick: () => setSearchOpen(true),
    },
    {
      key: "wishlist",
      label: "Wishlist",
      icon: Heart,
      to: "/wishlist",
      active: isActive("/wishlist"),
      badge: wishCount,
    },
    {
      key: "cart",
      label: "Bag",
      icon: ShoppingBag,
      active: isActive("/cart"),
      onClick: openCart,
      badge: count,
    },
    {
      key: "account",
      label: "Account",
      icon: User,
      to: accountTo,
      active: isActive("/account") || isActive("/login"),
    },
  ];

  return (
    <>
      <nav
        aria-label="Primary mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60 shadow-[0_-4px_20px_-12px_rgba(0,0,0,0.15)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="flex items-stretch justify-around h-[60px]">
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="relative flex flex-col items-center justify-center gap-1 h-full w-full">
                <div className="relative">
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors ${
                      item.active ? "text-foreground" : "text-foreground/45"
                    }`}
                    strokeWidth={item.active ? 2.2 : 1.6}
                    fill={item.active && (item.key === "wishlist" || item.key === "home") ? "currentColor" : "none"}
                  />
                  {item.badge && item.badge > 0 ? <NavBadge count={item.badge} /> : null}
                </div>
                <span
                  className={`text-[9.5px] tracking-[0.14em] uppercase leading-none ${
                    item.active ? "text-foreground font-medium" : "text-foreground/55 font-light"
                  }`}
                >
                  {item.label}
                </span>
                {item.active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 bg-foreground rounded-full" />
                )}
              </div>
            );

            return (
              <li key={item.key} className="flex-1">
                {item.to ? (
                  <Link to={item.to} className="block h-full w-full" aria-label={item.label}>
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="block h-full w-full"
                    aria-label={item.label}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
