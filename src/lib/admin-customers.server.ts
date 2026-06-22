import { createSupabaseAdminClient, createSupabaseServerClient } from "./supabase-server";
import type { Customer, CustomerAddress, CustomerOrderSummary, OrderStatus } from "./admin-types";

type CustomerRow = {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  phone: string | null;
  type: "registered" | "guest";
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
  first_seen_at: string;
};

type OrderRow = {
  id: string;
  user_id: string | null;
  customer_email: string;
  total: number;
  status: OrderStatus;
  created_at: string;
};

type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapAddress(row: AddressRow): CustomerAddress {
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

function mapOrderSummary(row: OrderRow): CustomerOrderSummary {
  return {
    id: row.id,
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
  };
}

function ordersForCustomer(row: CustomerRow, orders: OrderRow[]): CustomerOrderSummary[] {
  const emailKey = normalizeEmail(row.email);
  return orders
    .filter(
      (o) =>
        (row.user_id && o.user_id === row.user_id) || normalizeEmail(o.customer_email) === emailKey,
    )
    .map(mapOrderSummary);
}

export async function requireAdmin(
  request: Request,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const supabase = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Authentication required.", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Admin access required.", status: 403 };
  }

  return { ok: true };
}

/** Load customers from the `customers` table (auto-synced on signup & orders). */
export async function fetchAdminCustomers(): Promise<Customer[]> {
  const admin = createSupabaseAdminClient();

  const [customersRes, ordersRes, addressesRes] = await Promise.all([
    admin
      .from("customers")
      .select(
        "id, user_id, email, name, phone, type, order_count, total_spent, last_order_at, first_seen_at",
      )
      .order("updated_at", { ascending: false }),
    admin
      .from("orders")
      .select("id, user_id, customer_email, total, status, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("addresses")
      .select("id, user_id, label, line1, city, postal_code, country, is_default"),
  ]);

  if (customersRes.error) throw customersRes.error;
  if (ordersRes.error) throw ordersRes.error;
  if (addressesRes.error) throw addressesRes.error;

  const customers = (customersRes.data ?? []) as CustomerRow[];
  const orders = (ordersRes.data ?? []) as OrderRow[];
  const addresses = (addressesRes.data ?? []) as AddressRow[];

  const addressesByUserId = new Map<string, AddressRow[]>();
  for (const address of addresses) {
    const list = addressesByUserId.get(address.user_id) ?? [];
    list.push(address);
    addressesByUserId.set(address.user_id, list);
  }

  return customers.map((row) => {
    const userAddresses = row.user_id ? (addressesByUserId.get(row.user_id) ?? []) : [];
    const customerOrders = ordersForCustomer(row, orders);

    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      name: row.name,
      email: row.email,
      phone: row.phone,
      registeredAt: row.type === "registered" ? row.first_seen_at : null,
      orderCount: row.order_count,
      totalSpent: Number(row.total_spent),
      lastOrderAt: row.last_order_at,
      addressCount: userAddresses.length,
      addresses: userAddresses.map(mapAddress),
      orders: customerOrders,
    };
  });
}
