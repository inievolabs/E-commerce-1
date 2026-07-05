import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCatalog } from "@/lib/use-catalog";
import { useAuth } from "@/lib/auth";
import { mergeCartItems } from "@/lib/user-sync";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export interface CartItem {
  productId: string;
  qty: number;
  color?: string;
  size?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  catalogLoading: boolean;
  add: (productId: string, qty?: number, opts?: { color?: string; size?: string }) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "velin:cart";

function readLocalCart(): CartItem[] {
  try {
    const raw = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch {
    /* ignore */
  }
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { data: catalogProducts = [], isLoading: catalogLoading } = useCatalog();
  const { user, isReady: authReady } = useAuth();
  const syncedUserIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readLocalCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!authReady || !hydrated) return;

    if (!user?.id) {
      syncedUserIdRef.current = null;
      return;
    }

    if (syncedUserIdRef.current === user.id) return;

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    void (async () => {
      const local = readLocalCart();
      const { data, error } = await supabase
        .from("user_carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("[cart sync]", error);
        syncedUserIdRef.current = user.id;
        return;
      }

      const remote = (data?.items as CartItem[] | null) ?? [];
      const merged = mergeCartItems(local, remote);
      setItems(merged);
      syncedUserIdRef.current = user.id;

      if (merged.length > 0) {
        await supabase.from("user_carts").upsert({
          user_id: user.id,
          items: merged as unknown as import("@/lib/database.types").Json,
          updated_at: new Date().toISOString(),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, hydrated, user?.id]);

  useEffect(() => {
    if (!hydrated || !user?.id || syncedUserIdRef.current !== user.id) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const supabase = createSupabaseBrowserClient();
      void supabase.from("user_carts").upsert({
        user_id: user.id,
        items: items as unknown as import("@/lib/database.types").Json,
        updated_at: new Date().toISOString(),
      });
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [items, hydrated, user?.id]);

  const value = useMemo<CartContextValue>(() => {
    const map = new Map(catalogProducts.map((p) => [p.id, p]));
    const subtotal = items.reduce((sum, it) => {
      const p = map.get(it.productId);
      return p ? sum + p.price * it.qty : sum;
    }, 0);
    const count = items.reduce((n, it) => n + it.qty, 0);
    return {
      items,
      count,
      subtotal,
      catalogLoading,
      add: (productId, qty = 1, opts) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing) {
            return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
          }
          return [...prev, { productId, qty, ...opts }];
        }),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      setQty: (productId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        ),
      clear: () => setItems([]),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, isOpen, catalogProducts, catalogLoading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const formatPrice = (n: number) =>
  `৳${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;
