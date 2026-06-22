import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { mergeWishlistIds } from "@/lib/user-sync";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface WishlistContextValue {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "velin:wishlist";

function readLocalWishlist(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user, isReady: authReady } = useAuth();
  const syncedUserIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIds(readLocalWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [ids, hydrated]);

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
      const local = readLocalWishlist();
      const { data, error } = await supabase
        .from("user_wishlists")
        .select("product_ids")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("[wishlist sync]", error);
        syncedUserIdRef.current = user.id;
        return;
      }

      const remote = data?.product_ids ?? [];
      const merged = mergeWishlistIds(local, remote);
      setIds(merged);
      syncedUserIdRef.current = user.id;

      if (merged.length > 0) {
        await supabase.from("user_wishlists").upsert({
          user_id: user.id,
          product_ids: merged,
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
      void supabase.from("user_wishlists").upsert({
        user_id: user.id,
        product_ids: ids,
        updated_at: new Date().toISOString(),
      });
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [ids, hydrated, user?.id]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.length,
      has: (id) => ids.includes(id),
      toggle: (id) =>
        setIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])),
      remove: (id) => setIds((prev) => prev.filter((p) => p !== id)),
      clear: () => setIds([]),
    }),
    [ids],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
