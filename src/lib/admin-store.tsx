import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as seedProducts, type Product, type Category, type Gender } from "@/data/products";

export type { Product, Category, Gender };

export interface CategoryDef {
  id: Category;
  label: string;
  description?: string;
}

export interface InventoryRecord {
  productId: string;
  stock: number;
  lowStockThreshold: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
}

export interface PostCategory {
  id: string;
  label: string;
  description?: string;
}

export interface Post {
  id: string; // slug
  title: string;
  excerpt: string;
  body: string;
  cover?: string;
  categoryId: string;
  tags: string[];
  author: string;
  published: boolean;
  publishedAt: string; // ISO
}

export interface MediaItem {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
  productIds: string[];
}

interface AdminState {
  products: Product[];
  categories: CategoryDef[];
  inventory: Record<string, InventoryRecord>;
  orders: Order[];
  media: MediaItem[];
}

interface AdminContextValue extends AdminState {
  // products
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  setProductImages: (id: string, images: string[]) => void;
  // categories
  upsertCategory: (c: CategoryDef) => void;
  deleteCategory: (id: string) => void;
  // inventory
  setStock: (productId: string, stock: number) => void;
  setThreshold: (productId: string, threshold: number) => void;
  adjustStock: (productId: string, delta: number) => void;
  // orders
  addOrder: (o: Omit<Order, "id" | "createdAt" | "status"> & { status?: OrderStatus }) => Order;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  // media
  addMedia: (m: Omit<MediaItem, "id" | "createdAt" | "productIds"> & { productIds?: string[] }) => MediaItem;
  deleteMedia: (id: string) => void;
  renameMedia: (id: string, name: string) => void;
  setMediaProducts: (id: string, productIds: string[]) => void;
}

const STORAGE_KEY = "velin:admin:v1";
const MEDIA_STORAGE_KEY = "velin:admin:media:v1";

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: "bags", label: "Bags", description: "Shoulder bags, totes, hobos and crossbodies." },
  { id: "luggage", label: "Luggage", description: "Weekenders and cabin trunks." },
  { id: "slippers", label: "Slippers", description: "Mules, flats and loungewear." },
  { id: "wallets", label: "Wallets", description: "Bifolds, cardholders and pouches." },
];

const DEFAULT_INVENTORY = (list: Product[]): Record<string, InventoryRecord> =>
  Object.fromEntries(
    list.map((p) => [p.id, { productId: p.id, stock: 12, lowStockThreshold: 4 }]),
  );

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-1042",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    customerName: "Amelia Chen",
    customerEmail: "amelia@example.com",
    shippingAddress: "12 Rue de Rivoli, Paris, 75001, France",
    items: [
      { productId: "w-bag-01", name: "Marais Shoulder Bag", price: 1480, qty: 1, color: "Camel" },
      { productId: "m-wal-02", name: "Cardholder", price: 240, qty: 1, color: "Cognac" },
    ],
    subtotal: 1720,
    shipping: 0,
    total: 1720,
    status: "processing",
  },
  {
    id: "ORD-1041",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    customerName: "Rahim Hossain",
    customerEmail: "rahim@example.com",
    shippingAddress: "House 4, Road 12, Dhanmondi, Dhaka, Bangladesh",
    items: [
      { productId: "m-bag-01", name: "Atlas Briefcase", price: 1890, qty: 1, color: "Noir" },
    ],
    subtotal: 1890,
    shipping: 25,
    total: 1915,
    status: "shipped",
  },
  {
    id: "ORD-1040",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    customerName: "Sofia Rinaldi",
    customerEmail: "sofia@example.com",
    shippingAddress: "Via Montenapoleone 8, Milano, 20121, Italy",
    items: [
      { productId: "w-slp-02", name: "Velvet Lounge Slipper", price: 480, qty: 2, color: "Burgundy" },
    ],
    subtotal: 960,
    shipping: 0,
    total: 960,
    status: "delivered",
  },
  {
    id: "ORD-1039",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    customerName: "Noah Bennett",
    customerEmail: "noah@example.com",
    shippingAddress: "221B Baker Street, London, NW1 6XE, UK",
    items: [
      { productId: "w-lug-01", name: "Voyage Weekender", price: 2480, qty: 1, color: "Cognac" },
    ],
    subtotal: 2480,
    shipping: 0,
    total: 2480,
    status: "pending",
  },
];

const defaultState = (): AdminState => ({
  products: seedProducts,
  categories: DEFAULT_CATEGORIES,
  inventory: DEFAULT_INVENTORY(seedProducts),
  orders: DEFAULT_ORDERS,
  media: [],
});

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
      const rawMedia = typeof window !== "undefined" && window.localStorage.getItem(MEDIA_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<AdminState>) : {};
      const parsedMedia = rawMedia ? (JSON.parse(rawMedia) as MediaItem[]) : null;
      setState((prev) => ({
        products: parsed.products ?? prev.products,
        categories: parsed.categories ?? prev.categories,
        inventory: parsed.inventory ?? prev.inventory,
        orders: parsed.orders ?? prev.orders,
        media: parsedMedia ?? parsed.media ?? prev.media,
      }));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist non-media state. Kept small so quota errors from media uploads
  // never block product order, inventory, or order persistence.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const { media, ...rest } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {}
  }, [state.products, state.categories, state.inventory, state.orders, hydrated]);

  // Persist media separately — large data URLs may exceed quota; failures here
  // must not prevent the rest of the admin state from being saved.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(state.media));
    } catch (err) {
      console.warn("[admin] media storage quota exceeded; media library not persisted", err);
    }
  }, [state.media, hydrated]);

  const value = useMemo<AdminContextValue>(
    () => ({
      ...state,
      upsertProduct: (p) =>
        setState((s) => {
          const exists = s.products.some((x) => x.id === p.id);
          const products = exists
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [p, ...s.products];
          const inventory = s.inventory[p.id]
            ? s.inventory
            : { ...s.inventory, [p.id]: { productId: p.id, stock: 0, lowStockThreshold: 4 } };
          return { ...s, products, inventory };
        }),
      deleteProduct: (id) =>
        setState((s) => {
          const { [id]: _, ...rest } = s.inventory;
          return { ...s, products: s.products.filter((p) => p.id !== id), inventory: rest };
        }),
      setProductImages: (id, images) =>
        setState((s) => ({
          ...s,
          products: s.products.map((p) => (p.id === id ? { ...p, images } : p)),
        })),
      upsertCategory: (c) =>
        setState((s) => {
          const exists = s.categories.some((x) => x.id === c.id);
          return {
            ...s,
            categories: exists
              ? s.categories.map((x) => (x.id === c.id ? c : x))
              : [...s.categories, c],
          };
        }),
      deleteCategory: (id) =>
        setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) })),
      setStock: (productId, stock) =>
        setState((s) => ({
          ...s,
          inventory: {
            ...s.inventory,
            [productId]: {
              ...(s.inventory[productId] ?? { productId, lowStockThreshold: 4, stock: 0 }),
              stock: Math.max(0, stock),
            },
          },
        })),
      setThreshold: (productId, threshold) =>
        setState((s) => ({
          ...s,
          inventory: {
            ...s.inventory,
            [productId]: {
              ...(s.inventory[productId] ?? { productId, stock: 0, lowStockThreshold: 0 }),
              lowStockThreshold: Math.max(0, threshold),
            },
          },
        })),
      adjustStock: (productId, delta) =>
        setState((s) => {
          const cur = s.inventory[productId] ?? { productId, stock: 0, lowStockThreshold: 4 };
          return {
            ...s,
            inventory: {
              ...s.inventory,
              [productId]: { ...cur, stock: Math.max(0, cur.stock + delta) },
            },
          };
        }),
      addOrder: (o) => {
        const order: Order = {
          ...o,
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date().toISOString(),
          status: o.status ?? "pending",
        };
        setState((s) => ({ ...s, orders: [order, ...s.orders] }));
        return order;
      },
      setOrderStatus: (id, status) =>
        setState((s) => ({
          ...s,
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      deleteOrder: (id) =>
        setState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) })),
      addMedia: (m) => {
        const item: MediaItem = {
          id: `med-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
          productIds: m.productIds ?? [],
          name: m.name,
          dataUrl: m.dataUrl,
          width: m.width,
          height: m.height,
        };
        setState((s) => {
          const media = [item, ...s.media];
          const products = item.productIds.length
            ? s.products.map((p) =>
                item.productIds.includes(p.id) && !p.images.includes(item.dataUrl)
                  ? { ...p, images: [...p.images, item.dataUrl] }
                  : p,
              )
            : s.products;
          return { ...s, media, products };
        });
        return item;
      },
      deleteMedia: (id) =>
        setState((s) => {
          const item = s.media.find((m) => m.id === id);
          const media = s.media.filter((m) => m.id !== id);
          const products = item
            ? s.products.map((p) =>
                p.images.includes(item.dataUrl)
                  ? { ...p, images: p.images.filter((u) => u !== item.dataUrl) }
                  : p,
              )
            : s.products;
          return { ...s, media, products };
        }),
      renameMedia: (id, name) =>
        setState((s) => ({
          ...s,
          media: s.media.map((m) => (m.id === id ? { ...m, name } : m)),
        })),
      setMediaProducts: (id, productIds) =>
        setState((s) => {
          const item = s.media.find((m) => m.id === id);
          if (!item) return s;
          const media = s.media.map((m) => (m.id === id ? { ...m, productIds } : m));
          const products = s.products.map((p) => {
            const has = p.images.includes(item.dataUrl);
            const should = productIds.includes(p.id);
            if (should && !has) return { ...p, images: [...p.images, item.dataUrl] };
            if (!should && has) return { ...p, images: p.images.filter((u) => u !== item.dataUrl) };
            return p;
          });
          return { ...s, media, products };
        }),
    }),
    [state],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return ctx;
}

// Simple mock admin auth gate (localStorage flag). Default passcode: "admin".
const AUTH_KEY = "velin:admin:auth";
export const ADMIN_PASSCODE = "admin";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "1";
}
export function setAdminAuthed(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) window.localStorage.setItem(AUTH_KEY, "1");
  else window.localStorage.removeItem(AUTH_KEY);
}
