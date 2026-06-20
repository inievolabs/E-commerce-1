import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

interface Props {
  productId: string;
  className?: string;
  size?: number;
  label?: boolean;
}

export function WishlistButton({ productId, className = "", size = 16, label = false }: Props) {
  const { has, toggle } = useWishlist();
  const active = has(productId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <Heart
        style={{ width: size, height: size }}
        className={`transition-colors ${active ? "fill-current text-foreground" : ""}`}
      />
      {label && (
        <span className="text-xs tracking-[0.22em] uppercase">
          {active ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
