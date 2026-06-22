import { useState } from "react";
import { toast } from "sonner";

type NewsletterFormProps = {
  source: "home" | "footer";
  variant?: "light" | "dark";
  className?: string;
};

export function NewsletterForm({ source, variant = "light", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const isDark = variant === "dark";

  if (subscribed) {
    return (
      <p className={`text-sm ${isDark ? "text-background/90" : "text-muted-foreground"}`}>
        Thank you — you&apos;re on the list. We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form
      className={`mt-5 flex border-b ${isDark ? "border-background/40" : "border-foreground/30"} ${className}`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;
        const trimmed = email.trim();
        if (!trimmed) {
          toast.error("Please enter your email address.");
          return;
        }
        setSubmitting(true);
        try {
          const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: trimmed, source }),
          });
          const result = (await res.json()) as {
            ok: boolean;
            error?: string;
            alreadySubscribed?: boolean;
          };
          if (!result.ok) {
            toast.error(result.error ?? "Unable to subscribe.");
            return;
          }
          setSubscribed(true);
          setEmail("");
          toast.success(
            result.alreadySubscribed
              ? "You're already subscribed — thank you."
              : "Thank you for subscribing.",
          );
        } catch {
          toast.error("Unable to subscribe. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        disabled={submitting}
        className={`flex-1 bg-transparent py-2 text-sm focus:outline-none disabled:opacity-60 ${
          isDark
            ? "text-background placeholder:text-background/60 py-3"
            : "placeholder:text-muted-foreground"
        }`}
      />
      <button
        type="submit"
        disabled={submitting}
        className={`text-xs tracking-[0.2em] uppercase disabled:opacity-60 ${
          isDark ? "tracking-[0.22em]" : ""
        }`}
      >
        {submitting ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
