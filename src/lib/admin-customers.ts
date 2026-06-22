import type { Customer } from "./admin-types";

export interface AdminCustomersResponse {
  ok: true;
  customers: Customer[];
}

export interface AdminCustomersFailure {
  ok: false;
  error: string;
}

export type AdminCustomersResult = AdminCustomersResponse | AdminCustomersFailure;

export async function fetchAdminCustomers(): Promise<Customer[]> {
  const res = await fetch("/api/admin/customers", {
    method: "GET",
    credentials: "include",
  });

  const data = (await res.json()) as AdminCustomersResult;
  if (!data.ok) {
    throw new Error(data.error || "Unable to load customers.");
  }
  return data.customers;
}
