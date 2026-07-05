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
  const { isReady, isAuthenticated, isAdmin, logout, user } = useAuth();
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
      user={user}
      onSignOut={async () => {
        await logout();
        navigate({ to: "/login", search: { redirect: "/admin" } });
      }}
    />
  );
}

function Shell({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const currentPage = NAV.find((n) => isActive(n.to, n.exact));

  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "AD";

  return (
    <div className="min-h-screen flex bg-[#f5f2ed] text-foreground">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0d0c0b] min-h-screen sticky top-0 self-start border-r border-[#c9a96e]/10 shadow-2xl">
        {/* Brand */}
        <div className="px-6 pt-8 pb-5 border-b border-white/5">
          <Link to="/admin" className="block group">
            <img
              src={LOGO}
              alt="Velin Studio"
              className="h-6 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-[9px] tracking-[0.25em] uppercase text-white/30">
                Admin Console
              </span>
              <span className="text-[8px] font-mono px-1 py-0.2 bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20 rounded-sm">
                v2.0
              </span>
            </div>
          </Link>
        </div>

        {/* User profile */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center text-[11px] font-semibold text-[#c9a96e] shrink-0 font-sans">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white/90 truncate">{user?.name || "Administrator"}</p>
            <p className="text-[9px] tracking-wide text-white/40 truncate mt-0.5">{user?.email || "admin@velinstudio.com"}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto no-scrollbar">
          {NAV.map((n) => {
            const active = isActive(n.to, n.exact);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group flex items-center gap-3 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.18em] rounded-md transition-all duration-200 ${
                  active
                    ? "bg-[#c9a96e]/10 text-[#c9a96e] font-semibold border-l-2 border-[#c9a96e]"
                    : "text-white/40 hover:text-white/90 hover:bg-white/5 hover:translate-x-1"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    active ? "text-[#c9a96e]" : "text-white/20 group-hover:text-white/50"
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
        <div className="px-3 pb-6 pt-3 border-t border-white/5 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-white/30 hover:text-white/80 hover:bg-white/5 rounded-md transition-all group"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
            <span>View store</span>
          </Link>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-white/30 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-all group cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-white/20 group-hover:text-red-400/40" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE OVERLAY NAV ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-72 bg-[#0d0c0b] flex flex-col shadow-2xl border-r border-[#c9a96e]/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5">
              <div>
                <img
                  src={LOGO}
                  alt="Velin Studio"
                  className="h-5.5 w-auto brightness-0 invert opacity-90"
                />
                <p className="mt-1.5 text-[8px] tracking-[0.25em] uppercase text-white/30">
                  Admin Console
                </p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid place-items-center w-8 h-8 rounded-md text-white/40 hover:text-white/85 hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile User Profile */}
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-3 bg-white/2">
              <div className="w-8 h-8 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center text-xs font-semibold text-[#c9a96e] shrink-0 font-sans">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white/90 truncate">{user?.name || "Administrator"}</p>
                <p className="text-[9px] text-white/40 truncate mt-0.5">{user?.email || "admin@velinstudio.com"}</p>
              </div>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
              {NAV.map((n) => {
                const active = isActive(n.to, n.exact);
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`group flex items-center gap-3 px-3.5 py-3 text-[10px] uppercase tracking-[0.18em] rounded-md transition-all ${
                      active
                        ? "bg-[#c9a96e]/10 text-[#c9a96e] font-semibold border-l-2 border-[#c9a96e]"
                        : "text-white/40 hover:text-white/90 hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-[#c9a96e]" : "text-white/20 group-hover:text-white/50"
                      }`}
                    />
                    <span className="flex-1">{n.label}</span>
                    {active && <ChevronRight className="w-3 h-3 text-[#c9a96e]" />}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile footer */}
            <div className="px-3 pb-8 pt-3 border-t border-white/5 space-y-0.5">
              <Link
                to="/"
                className="flex items-center gap-3 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-white/30 hover:text-white/80 hover:bg-white/5 rounded-md transition-all group"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View store</span>
              </Link>
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-white/30 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-all group text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[#f5f2ed]/85 backdrop-blur-md border-b border-[#131210]/5 shadow-xs">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden grid place-items-center w-8 h-8 rounded-md text-foreground/70 hover:text-foreground hover:bg-black/5 transition-colors -ml-1 cursor-pointer"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Mobile logo (centered on mobile) */}
            <div className="lg:hidden flex-1 flex justify-center -ml-8">
              <img src={LOGO} alt="Velin Studio" className="h-5 w-auto" />
            </div>

            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
              <span className="text-muted-foreground/60">Admin Console</span>
              {currentPage && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/35" />
                  <span className="font-semibold text-foreground tracking-widest">{currentPage.label}</span>
                </>
              )}
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-3">
              {/* Server Status Light */}
              <div className="hidden sm:flex items-center gap-1.5 text-[9px] tracking-widest uppercase text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Live Mode
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-black/8" />
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Store
              </Link>
              <div className="hidden sm:block h-3.5 w-px bg-black/8" />
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 animate-route-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
