import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ADMIN_PASSCODE,
  isAdminAuthed,
  setAdminAuthed,
} from "@/lib/admin-store";

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
  { to: "/admin/media", label: "Media" },
];

function AdminLayout() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(isAdminAuthed());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!authed) return <PasscodeGate onPass={() => setAuthed(true)} />;

  return <Shell onSignOut={() => { setAdminAuthed(false); setAuthed(false); }} />;
}

function PasscodeGate({ onPass }: { onPass: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="min-h-screen grid place-items-center bg-secondary px-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code === ADMIN_PASSCODE) {
            setAdminAuthed(true);
            onPass();
          } else {
            setErr("Incorrect passcode.");
          }
        }}
        className="w-full max-w-sm bg-background p-8 border border-border"
      >
        <p className="eyebrow">Velin Studio</p>
        <h1 className="font-serif text-3xl mt-2">Admin access</h1>
        <p className="text-xs text-muted-foreground mt-2">
          Mock dashboard. Default passcode: <code className="font-mono">admin</code>
        </p>
        <label className="block mt-6">
          <span className="eyebrow block mb-2">Passcode</span>
          <input
            type="password"
            autoFocus
            value={code}
            onChange={(e) => { setCode(e.target.value); setErr(""); }}
            className="w-full bg-transparent border-b border-foreground/30 py-3 text-sm focus:outline-none focus:border-foreground"
          />
        </label>
        {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
        <button
          type="submit"
          className="mt-6 w-full bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
        >
          Enter
        </button>
        <Link to="/" className="block mt-4 text-center eyebrow link-underline">Back to store</Link>
      </form>
    </div>
  );
}

function Shell({ onSignOut }: { onSignOut: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      {/* Top bar */}
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
            <button onClick={() => { onSignOut(); navigate({ to: "/admin" }); }} className="eyebrow link-underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
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

        {/* Sidebar (mobile drawer) */}
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
