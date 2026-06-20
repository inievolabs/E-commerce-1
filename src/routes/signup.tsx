import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Velin Studio" },
      { name: "description", content: "Create a Velin Studio account to track orders, save pieces and check out faster." },
      { property: "og:title", content: "Create account — Velin Studio" },
      { property: "og:url", content: "/signup" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/signup" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-md px-5 lg:px-10 py-20 lg:py-28">
      <header className="text-center mb-12">
        <p className="eyebrow">Account</p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">Create account</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Join the Velin Studio circle.
        </p>
      </header>

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (password.length < 6) return setError("Password must be at least 6 characters.");
          if (password !== confirm) return setError("Passwords do not match.");
          setSubmitting(true);
          const res = await signup(name, email, password);
          setSubmitting(false);
          if (!res.ok) setError(res.error ?? "Unable to create account.");
          else navigate({ to: "/account" });
        }}
      >
        <Field label="Full name" value={name} onChange={setName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground leading-relaxed">
          By creating an account you agree to our{" "}
          <Link to="/terms" className="link-underline text-foreground">Terms</Link> and{" "}
          <Link to="/privacy" className="link-underline text-foreground">Privacy Policy</Link>.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Already with us?{" "}
        <Link to="/login" className="text-foreground link-underline">Sign in</Link>
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
