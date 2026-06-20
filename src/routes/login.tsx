import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Velin Studio" },
      { name: "description", content: "Sign in to your Velin Studio account to view orders, wishlist and addresses." },
      { property: "og:title", content: "Sign in — Velin Studio" },
      { property: "og:url", content: "/login" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-md px-5 lg:px-10 py-20 lg:py-28">
      <header className="text-center mb-12">
        <p className="eyebrow">Account</p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">Sign in</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Welcome back to Velin Studio.
        </p>
      </header>

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);
          const res = await login(email, password);
          setSubmitting(false);
          if (!res.ok) setError(res.error ?? "Unable to sign in.");
          else navigate({ to: "/account" });
        }}
      >
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="accent-foreground" />
            Remember me
          </label>
          <button type="button" className="link-underline text-foreground/80" onClick={() => alert("A reset link would be sent in a live store.")}>
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        New to Velin Studio?{" "}
        <Link to="/signup" className="text-foreground link-underline">Create an account</Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block eyebrow mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-foreground"
      />
    </label>
  );
}
