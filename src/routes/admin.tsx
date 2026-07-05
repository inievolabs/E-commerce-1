import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Boxes,
  ClipboardList,
  Users,
  Inbox,
  Image,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Admin — Velin Studio" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLayout,
});

const LOGO =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781984765/velin_studio_logo_zujxjx.svg";

const NAV = [
  { to: "/admin", label: "Overview", exact: true, icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/inbox", label: "Newsletter & Contact", icon: Inbox },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/posts", label: "Posts", icon: FileText },
  { to: "/admin/post-categories", label: "Post categories", icon: FolderOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
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
      <div className="min-h-screen grid place-items-center bg-[#0f0e0c] px-5">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO} alt="Velin Studio" className="h-8 w-auto brightness-0 invert opacity-60" />
          <p className="text-xs tracking-[0.2em] uppercase text-white/40">Loading admin…</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0f0e0c] px-5">
        <div className="w-full max-w-md bg-[#1a1815] border border-white/10 p-10 text-center">
          <img src={LOGO} alt="Velin Studio" className="h-7 w-auto mx-auto mb-6 brightness-0 invert opacity-80" />
          <p className="text-xs tracking-[0.22em] uppercase text-white/40 mb-3">Access Denied</p>
          <h1 className="font-serif text-3xl text-white">Restricted Area</h1>
          <p className="text-sm text-white/50 mt-3">Your account does not have admin privileges.</p>
          <Link
            to="/"
            className="mt-8 inline-block text-xs tracking-[0.22em] uppercase text-[#c9a96e] hover:text-[#e8c98a] transition-colors"
          >
            ← Back to store
          </Link>
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
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const currentPage = NAV.find((n) => isActive(n.to, n.exact));

  return (
    <div className="min-h-screen flex bg-[#f5f2ed] text-foreground">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#131210] min-h-screen sticky top-0 self-start border-r border-white/5 shadow-2xl">
        {/* Brand */}
        <div className="px-6 pt-8 pb-6 border-b border-white/8">
          <Link to="/admin" className="block">
            <img
              src={LOGO}
              alt="Velin Studio"
              className="h-7 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
            />
            <p className="mt-2 text-[9px] tracking-[0.28em] uppercase text-white/30">
              Admin Console
            </p>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => {
            const active = isActive(n.to, n.exact);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-150 ${
                  active
                    ? "bg-[#c9a96e]/15 text-[#c9a96e] font-medium"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                    active ? "text-[#c9a96e]" : "text-white/30 group-hover:text-white/60"
                  }`}
                />
                <span className="truncate">{n.label}</span>
                {active && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-[#c9a96e] shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-3 pb-6 pt-3 border-t border-white/8 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all group"
          >
            <ExternalLink className="w-[17px] h-[17px] text-white/25 group-hover:text-white/50" />
            <span>View store</span>
          </Link>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-red-400/80 hover:bg-red-500/8 rounded-lg transition-all group"
          >
            <LogOut className="w-[17px] h-[17px] text-white/25 group-hover:text-red-400/50" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE OVERLAY NAV ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-72 bg-[#131210] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/8">
              <div>
                <img
                  src={LOGO}
                  alt="Velin Studio"
                  className="h-6 w-auto brightness-0 invert opacity-90"
                />
                <p className="mt-1.5 text-[9px] tracking-[0.25em] uppercase text-white/30">
                  Admin Console
                </p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid place-items-center w-9 h-9 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {NAV.map((n) => {
                const active = isActive(n.to, n.exact);
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`group flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all ${
                      active
                        ? "bg-[#c9a96e]/15 text-[#c9a96e] font-medium"
                        : "text-white/50 hover:text-white/90 hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        active ? "text-[#c9a96e]" : "text-white/30 group-hover:text-white/60"
                      }`}
                    />
                    <span className="flex-1">{n.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-[#c9a96e]/60" />}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile footer */}
            <div className="px-3 pb-8 pt-3 border-t border-white/8 space-y-0.5">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all group"
              >
                <ExternalLink className="w-[17px] h-[17px]" />
                <span>View store</span>
              </Link>
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-all group"
              >
                <LogOut className="w-[17px] h-[17px]" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-black/6 shadow-sm">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden grid place-items-center w-9 h-9 rounded-lg text-foreground/60 hover:text-foreground hover:bg-black/5 transition-colors -ml-1"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile logo (centered on mobile) */}
            <div className="lg:hidden flex-1 flex justify-center">
              <img src={LOGO} alt="Velin Studio" className="h-5 w-auto" />
            </div>

            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium">Admin</span>
              {currentPage && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="font-medium text-foreground">{currentPage.label}</span>
                </>
              )}
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-3">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Store
              </Link>
              <div className="hidden sm:block h-4 w-px bg-border" />
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
