import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { Product } from "@/data/products";
import { formatPrice, useCart } from "@/lib/cart";
import { WishlistButton } from "@/components/WishlistButton";

interface Props {
  product: Product;
  aspect?: "portrait" | "square";
}

export function ProductCard({ product, aspect = "portrait" }: Props) {
  const { add, open } = useCart();
  const [hover, setHover] = useState(false);
  const second = product.images[1] ?? product.images[0];

  return (
    <div
      className="group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block relative overflow-hidden bg-muted"
      >
        <div className={aspect === "portrait" ? "aspect-[3/4]" : "aspect-square"}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: hover ? 0 : 1 }}
          />
          <img
            src={second}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out"
            style={{ opacity: hover ? 1 : 0, transform: hover ? "scale(1.04)" : "scale(1)" }}
          />
        </div>

        {(product.isNew || product.isBestseller) && (
          <div className="absolute top-3 left-3 eyebrow text-foreground/80 bg-background/80 backdrop-blur px-2 py-1">
            {product.isNew ? "New" : "Bestseller"}
          </div>
        )}

        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur rounded-full p-2 text-foreground/80 hover:text-foreground">
          <WishlistButton productId={product.id} size={16} />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            add(product.id, 1, { color: product.color });
            open();
          }}
          className="absolute bottom-0 left-0 right-0 bg-foreground/95 text-background py-3 text-xs tracking-[0.22em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-500 hidden md:block cursor-pointer hover:bg-foreground"
        >
          Quick add
        </button>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Link to="/product/$id" params={{ id: product.id }} className="link-underline">
            <h3 className="text-base font-normal text-foreground">{product.name}</h3>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{product.color}</p>
        </div>
        <p className="text-sm text-foreground tabular-nums">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
