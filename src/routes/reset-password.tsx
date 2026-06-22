import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PasswordField } from "@/components/PasswordField";
import { assertPasswordNotPwned, LEAKED_PASSWORD_MESSAGE } from "@/lib/hibp-password";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Velin Studio" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/reset-password" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setInvalidLink(false);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
        setInvalidLink(false);
      } else {
        const hash = window.location.hash;
        const hasRecoveryToken =
          hash.includes("type=recovery") || hash.includes("access_token=");
        if (!hasRecoveryToken) {
          setInvalidLink(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready && !invalidLink) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center text-sm text-muted-foreground">
        Verifying reset link…
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="mx-auto max-w-md px-5 lg:px-10 py-20 lg:py-28 text-center">
        <p className="eyebrow">Account</p>
        <h1 className="mt-4 font-serif text-4xl">Link expired</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Request a new one from the sign-in page.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block bg-foreground text-background px-6 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 lg:px-10 py-20 lg:py-28">
      <header className="text-center mb-12">
        <p className="eyebrow">Account</p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">New password</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Choose a new password for your Velin Studio account.
        </p>
      </header>

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
          }
          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
          }
          setError(null);
          setSubmitting(true);
          try {
            await assertPasswordNotPwned(password);
          } catch (err) {
            const message = err instanceof Error ? err.message : LEAKED_PASSWORD_MESSAGE;
            setError(message);
            setSubmitting(false);
            return;
          }
          const supabase = createSupabaseBrowserClient();
          const { error: updateError } = await supabase.auth.updateUser({ password });
          setSubmitting(false);
          if (updateError) {
            setError(updateError.message);
            toast.error("Could not reset password", { description: updateError.message });
            return;
          }
          toast.success("Password reset", { description: "You can now sign in with your new password." });
          navigate({ to: "/login" });
        }}
      >
        <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" required />
        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          required
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
