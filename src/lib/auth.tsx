import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: "Delivered" | "In transit" | "Processing" | "Cancelled";
  total: number;
  items: OrderItem[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  orders: Order[];
  addresses: Address[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "velin:auth";

const MOCK_ORDERS: Order[] = [
  {
    id: "VS-10428",
    date: "2026-05-12",
    status: "Delivered",
    total: 1480,
    items: [
      {
        productId: "w-bag-01",
        name: "Marais Shoulder Bag",
        qty: 1,
        price: 1480,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "VS-10302",
    date: "2026-03-04",
    status: "Delivered",
    total: 340,
    items: [
      {
        productId: "m-wallet-01",
        name: "Cardholder",
        qty: 1,
        price: 340,
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "VS-10571",
    date: "2026-06-18",
    status: "In transit",
    total: 2200,
    items: [
      {
        productId: "w-luggage-01",
        name: "Voyage Weekender",
        qty: 1,
        price: 2200,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
];

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    line1: "12 Rue des Archives",
    city: "Paris",
    postalCode: "75004",
    country: "France",
    isDefault: true,
  },
];

interface Persisted {
  user: User | null;
  addresses: Address[];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Persisted = JSON.parse(raw);
        setUser(parsed.user);
        if (parsed.addresses) setAddresses(parsed.addresses);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, addresses } satisfies Persisted),
      );
    } catch {}
  }, [user, addresses, hydrated]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isReady: hydrated,
      orders: user ? MOCK_ORDERS : [],
      addresses,
      login: async (email, password) => {
        const e = email.trim();
        if (!e || !password) return { ok: false, error: "Please enter both email and password." };
        if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: "Please enter a valid email address." };
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        setUser({ id: "u-1", name: e.split("@")[0] || "Client", email: e });
        return { ok: true };
      },
      signup: async (name, email, password) => {
        const n = name.trim();
        const e = email.trim();
        if (!n || !e || !password) return { ok: false, error: "All fields are required." };
        if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: "Please enter a valid email address." };
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        setUser({ id: "u-1", name: n, email: e });
        return { ok: true };
      },
      logout: () => setUser(null),
      updateUser: (patch) => setUser((u) => (u ? { ...u, ...patch } : u)),
      addAddress: (a) => setAddresses((prev) => [...prev, { ...a, id: `addr-${Date.now()}` }]),
      removeAddress: (id) => setAddresses((prev) => prev.filter((a) => a.id !== id)),
    }),
    [user, addresses, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
