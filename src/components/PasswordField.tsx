import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  variant?: "underline" | "boxed";
};

export function PasswordField({
  label,
  value,
  onChange,
  required,
  autoComplete,
  hint,
  variant = "underline",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const inputClass =
    variant === "boxed"
      ? "w-full bg-transparent border border-border px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-foreground"
      : "w-full bg-transparent border-b border-foreground/30 py-3 pr-10 text-base focus:outline-none focus:border-foreground";

  return (
    <label className="block">
      <span className="block eyebrow mb-2">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          className={inputClass}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      {hint && <span className="block mt-1.5 text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
