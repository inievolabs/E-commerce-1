import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { MobileBottomNav } from "../components/MobileBottomNav";

import { CartProvider } from "../lib/cart";
import { AuthProvider } from "../lib/auth";
import { WishlistProvider } from "../lib/wishlist";

const LOGO_URL =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781984765/velin_studio_logo_zujxjx.svg";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-serif text-5xl">Page not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for is no longer here.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-foreground text-background px-6 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Please try again or return to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-foreground px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Velin Studio — Quietly Considered Leather Goods" },
      {
        name: "description",
        content:
          "Velin Studio crafts minimalist leather handbags, luggage, wallets and slippers — designed in Paris, made by hand in Italy.",
      },
      { name: "author", content: "Velin Studio" },
      { property: "og:title", content: "Velin Studio" },
      {
        property: "og:description",
        content: "Quietly considered leather goods, designed in Paris and crafted by hand in Italy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Velin Studio" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: LOGO_URL },
      { rel: "apple-touch-icon", href: LOGO_URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="animate-route-fade">
      {children}
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Header />
              <main className="flex-1">
                <RouteTransition>
                  <Outlet />
                </RouteTransition>
              </main>
              <Footer />
              {/* Spacer so fixed mobile bottom nav doesn't overlap footer content */}
              <div
                className="md:hidden"
                aria-hidden="true"
                style={{ height: "calc(60px + env(safe-area-inset-bottom))" }}
              />
              <CartDrawer />
              <MobileBottomNav />
            </div>

          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
