import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Velin Studio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/inbox", label: "Newsletter & Contact" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/posts", label: "Posts" },
  { to: "/admin/post-categories", label: "Post categories" },
  { to: "/admin/settings", label: "Settings" },
];

function AdminLayout() {
  const { isReady, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/admin" } });
    }
  }, [isReady, isAuthenticated, navigate]);

  if (!isReady) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary px-5">
        <p className="text-sm text-muted-foreground">Loading admin…</p>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary px-5">
        <div className="w-full max-w-md bg-background p-8 border border-border text-center">
          <p className="eyebrow">Velin Studio</p>
          <h1 className="font-serif text-3xl mt-2">Access denied</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Your account does not have admin privileges.
          </p>
          <Link to="/" className="mt-6 inline-block eyebrow link-underline">Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <Shell
      onSignOut={async () => {
        await logout();
        navigate({ to: "/login", search: { redirect: "/admin" } });
      }}
    />
  );
}

function Shell({ onSignOut }: { onSignOut: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-8 h-14">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden -ml-2 p-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className="block w-5 h-px bg-foreground mb-1" />
              <span className="block w-5 h-px bg-foreground mb-1" />
              <span className="block w-5 h-px bg-foreground" />
            </button>
            <Link to="/admin" className="font-serif text-lg leading-none">
              Velin <span className="text-muted-foreground">/ Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:inline eyebrow link-underline">View store</Link>
            <button onClick={onSignOut} className="eyebrow link-underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-background min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
          <nav className="p-4 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`block px-3 py-2 text-sm rounded transition-colors ${
                  isActive(n.to, n.exact)
                    ? "bg-foreground text-background"
                    : "hover:bg-secondary"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <nav className="absolute top-14 left-0 right-0 bg-background border-b border-border p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`block px-3 py-3 text-sm rounded ${
                    isActive(n.to, n.exact) ? "bg-foreground text-background" : "hover:bg-secondary"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
