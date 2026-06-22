import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

import { assertPasswordNotPwned, LEAKED_PASSWORD_MESSAGE } from "./hibp-password";
import type { Tables } from "./database.types";
import { mapOrderStatusForCustomer, type OrderStatusLabel } from "./order-status";
import { getSiteUrl } from "./site-url";
import { createSupabaseBrowserClient } from "./supabase";

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
  color?: string | null;
  size?: string | null;
}

export type { OrderStatusLabel };

export interface Order {
  id: string;
  date: string;
  status: OrderStatusLabel;
  total: number;
  subtotal: number;
  shipping: number;
  shippingAddress: string;
  customerPhone?: string | null;
  paymentMethod: string;
  items: OrderItem[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isReady: boolean;
  orders: Order[];
  ordersLoading: boolean;
  addresses: Address[];
  addressesLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (patch: Partial<User>) => Promise<{ ok: boolean; error?: string }>;
  addAddress: (a: Omit<Address, "id">) => Promise<{ ok: boolean; error?: string }>;
  removeAddress: (id: string) => Promise<{ ok: boolean; error?: string }>;
  refreshOrders: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfileUser(sbUser: SupabaseUser, profile: Tables<"profiles"> | null): User {
  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name:
      profile?.full_name?.trim() ||
      (sbUser.user_metadata?.full_name as string | undefined)?.trim() ||
      sbUser.email?.split("@")[0] ||
      "Client",
  };
}

function mapAddress(row: Tables<"addresses">): Address {
  return {
    id: row.id,
    label: row.label,
    line1: row.line1,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

function mapOrderStatus(status: Tables<"orders">["status"]): OrderStatusLabel {
  return mapOrderStatusForCustomer(status);
}

async function fetchProfile(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchUserOrders(userId: string): Promise<Order[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.created_at,
    status: mapOrderStatus(row.status),
    total: Number(row.total),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    shippingAddress: row.shipping_address,
    customerPhone: row.customer_phone,
    paymentMethod: row.payment_method,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id ?? "",
      name: item.name,
      qty: item.qty,
      price: Number(item.price),
      color: item.color,
      size: item.size,
    })),
  }));
}

async function fetchUserAddresses(userId: string): Promise<Address[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapAddress);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  const userId = session?.user?.id ?? null;

  const ordersQuery = useQuery({
    queryKey: ["user-orders", userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId,
  });

  const addressesQuery = useQuery({
    queryKey: ["user-addresses", userId],
    queryFn: () => fetchUserAddresses(userId!),
    enabled: !!userId,
  });

  const loadProfile = useCallback(async (sbUser: SupabaseUser) => {
    try {
      const row = await fetchProfile(sbUser.id);
      setProfile(row);
      return row;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setProfileReady(true);
    }
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await loadProfile(data.session.user);
      } else {
        setProfileReady(true);
      }
      setSessionReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        setProfileReady(false);
        void loadProfile(nextSession.user);
      } else {
        setProfile(null);
        setProfileReady(true);
        queryClient.removeQueries({ queryKey: ["user-orders"] });
        queryClient.removeQueries({ queryKey: ["user-addresses"] });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, queryClient]);

  const user = useMemo(
    () => (session?.user ? mapProfileUser(session.user, profile) : null),
    [session, profile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: profile?.role === "admin",
      isReady: sessionReady && profileReady,
      orders: ordersQuery.data ?? [],
      ordersLoading: ordersQuery.isLoading,
      addresses: addressesQuery.data ?? [],
      addressesLoading: addressesQuery.isLoading,
      login: async (email, password) => {
        const e = email.trim();
        if (!e || !password) return { ok: false, error: "Please enter both email and password." };
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({ email: e, password });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      signup: async (name, email, password) => {
        const n = name.trim();
        const e = email.trim();
        if (!n || !e || !password) return { ok: false, error: "All fields are required." };
        if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
        try {
          await assertPasswordNotPwned(password);
        } catch (err) {
          const message = err instanceof Error ? err.message : LEAKED_PASSWORD_MESSAGE;
          return { ok: false, error: message };
        }
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signUp({
          email: e,
          password,
          options: { data: { full_name: n } },
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      logout: async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      },
      changePassword: async (currentPassword, newPassword) => {
        if (!session?.user?.email) return { ok: false, error: "Not signed in." };
        if (!currentPassword) return { ok: false, error: "Please enter your current password." };
        if (newPassword.length < 8) {
          return { ok: false, error: "New password must be at least 8 characters." };
        }
        try {
          await assertPasswordNotPwned(newPassword);
        } catch (err) {
          const message = err instanceof Error ? err.message : LEAKED_PASSWORD_MESSAGE;
          return { ok: false, error: message };
        }
        const supabase = createSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: currentPassword,
        });
        if (signInError) return { ok: false, error: "Current password is incorrect." };
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      requestPasswordReset: async (email) => {
        const e = email.trim();
        if (!e) return { ok: false, error: "Please enter your email address." };
        const siteUrl = getSiteUrl() || "https://velinstudiobd.com";
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.resetPasswordForEmail(e, {
          redirectTo: `${siteUrl}/reset-password`,
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      updateUser: async (patch) => {
        if (!session?.user) return { ok: false, error: "Not signed in." };
        const supabase = createSupabaseBrowserClient();
        const updates: { full_name?: string } = {};
        if (patch.name != null) updates.full_name = patch.name;
        if (Object.keys(updates).length) {
          const { error } = await supabase.from("profiles").update(updates).eq("id", session.user.id);
          if (error) return { ok: false, error: error.message };
          setProfile((p) => (p ? { ...p, ...updates } : p));
        }
        if (patch.email && patch.email !== session.user.email) {
          const { error } = await supabase.auth.updateUser({ email: patch.email });
          if (error) return { ok: false, error: error.message };
        }
        return { ok: true };
      },
      addAddress: async (a) => {
        if (!session?.user) return { ok: false, error: "Not signed in." };
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.from("addresses").insert({
          user_id: session.user.id,
          label: a.label,
          line1: a.line1,
          city: a.city,
          postal_code: a.postalCode,
          country: a.country,
          is_default: a.isDefault ?? false,
        });
        if (error) return { ok: false, error: error.message };
        void queryClient.invalidateQueries({ queryKey: ["user-addresses", session.user.id] });
        return { ok: true };
      },
      removeAddress: async (id) => {
        if (!session?.user) return { ok: false, error: "Not signed in." };
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.from("addresses").delete().eq("id", id);
        if (error) return { ok: false, error: error.message };
        void queryClient.invalidateQueries({ queryKey: ["user-addresses", session.user.id] });
        return { ok: true };
      },
      refreshOrders: () => {
        if (userId) void queryClient.invalidateQueries({ queryKey: ["user-orders", userId] });
      },
    }),
    [
      user,
      profile,
      sessionReady,
      profileReady,
      ordersQuery.data,
      ordersQuery.isLoading,
      addressesQuery.data,
      addressesQuery.isLoading,
      session,
      userId,
      queryClient,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
