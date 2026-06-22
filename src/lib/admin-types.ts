import type { Product, Category, Gender } from "@/data/products";

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

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  id: string;
  title: string;
  excerpt: string;
  body: string;
  cover?: string;
  categoryId: string;
  tags: string[];
  author: string;
  published: boolean;
  publishedAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  /** Cloudinary HTTPS URL, legacy data URL, or static /products/ path */
  url: string;
  width: number;
  height: number;
  createdAt: string;
  productIds: string[];
}

export type CustomerType = "registered" | "guest";

export interface CustomerAddress {
  id: string;
  label: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerOrderSummary {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string | null;
  type: CustomerType;
  name: string;
  email: string;
  phone: string | null;
  registeredAt: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  addressCount: number;
  addresses: CustomerAddress[];
  orders: CustomerOrderSummary[];
}

export const ADMIN_QUERY_KEYS = {
  products: ["admin", "products"] as const,
  categories: ["admin", "categories"] as const,
  inventory: ["admin", "inventory"] as const,
  orders: ["admin", "orders"] as const,
  customers: ["admin", "customers"] as const,
  posts: ["admin", "posts"] as const,
  postCategories: ["admin", "post-categories"] as const,
  media: ["admin", "media"] as const,
};

export const CATALOG_QUERY_KEY = ["catalog", "products"] as const;
