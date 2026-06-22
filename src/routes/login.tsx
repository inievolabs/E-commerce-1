import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordField } from "@/components/PasswordField";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
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
  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-md px-5 lg:px-10 py-20 lg:py-28">
      <header className="text-center mb-12">
        <p className="eyebrow">Account</p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">
          {forgotOpen ? "Reset password" : "Sign in"}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {forgotOpen
            ? "Enter your email and we will send you a reset link."
            : "Welcome back to Velin Studio."}
        </p>
      </header>

      {forgotOpen ? (
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setResetSubmitting(true);
            const res = await requestPasswordReset(resetEmail || email);
            setResetSubmitting(false);
            if (!res.ok) {
              toast.error("Could not send reset link", { description: res.error });
              return;
            }
            toast.success("Reset link sent", {
              description: "Check your inbox for a password reset email.",
            });
            setForgotOpen(false);
          }}
        >
          <Field
            label="Email"
            type="email"
            value={resetEmail || email}
            onChange={(v) => {
              setResetEmail(v);
              setEmail(v);
            }}
            required
          />

          <button
            type="submit"
            disabled={resetSubmitting}
            className="w-full bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-60"
          >
            {resetSubmitting ? "Sending…" : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={() => setForgotOpen(false)}
            className="w-full text-xs tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            const res = await login(email, password);
            setSubmitting(false);
            if (!res.ok) setError(res.error ?? "Unable to sign in.");
            else navigate({ to: redirect ?? "/account" });
          }}
        >
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" required />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="accent-foreground" />
              Remember me
            </label>
            <button
              type="button"
              className="link-underline text-foreground/80"
              onClick={() => {
                setResetEmail(email);
                setForgotOpen(true);
              }}
            >
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
      )}

      {!forgotOpen && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          New to Velin Studio?{" "}
          <Link to="/signup" className="text-foreground link-underline">Create an account</Link>
        </p>
      )}
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
