import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordField } from "@/components/PasswordField";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/settings")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Settings — Velin Studio Admin" }],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!currentPassword) return "Please enter your current password.";
    if (newPassword.length < 6) return "New password must be at least 6 characters.";
    if (newPassword !== confirmPassword) return "New passwords do not match.";
    if (currentPassword === newPassword)
      return "New password must be different from your current password.";
    return null;
  };

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Admin</p>
        <h1 className="font-serif text-3xl md:text-4xl mt-2">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your admin account security.</p>
      </header>

      <section className="bg-background border border-border p-6 max-w-lg">
        <h2 className="font-serif text-xl mb-1">Security</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Change the password for <span className="text-foreground">{user?.email}</span>.
        </p>

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const validationError = validate();
            if (validationError) {
              setFieldError(validationError);
              return;
            }
            setFieldError(null);
            setSubmitting(true);
            const res = await changePassword(currentPassword, newPassword);
            setSubmitting(false);
            if (!res.ok) {
              toast.error("Password update failed", { description: res.error });
              return;
            }
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated", {
              description: "Your admin password has been changed successfully.",
            });
          }}
        >
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            variant="boxed"
            required
          />
          <PasswordField
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            hint="At least 6 characters"
            variant="boxed"
            required
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            variant="boxed"
            required
          />

          {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
