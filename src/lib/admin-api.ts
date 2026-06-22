import type { Product, Category } from "@/data/products";
import type { Database, Tables } from "./database.types";
import { mapDbProduct } from "./catalog";
import { createSupabaseBrowserClient } from "./supabase";
import type {
  CategoryDef,
  InventoryRecord,
  MediaItem,
  Order,
  OrderLine,
  OrderStatus,
  Post,
  PostCategory,
} from "./admin-types";

type DbOrderStatus = Database["public"]["Enums"]["order_status"];

export function productToDbRow(p: Product): Database["public"]["Tables"]["products"]["Insert"] {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category_id: p.category,
    gender: p.gender,
    color: p.color,
    color_hex: p.colorHex,
    images: p.images,
    description: p.description,
    materials: p.materials,
    is_new: p.isNew ?? false,
    is_bestseller: p.isBestseller ?? false,
    sizes: p.sizes ?? [],
    tax_included: p.taxIncluded ?? true,
    tax_label: p.taxLabel ?? "Tax included",
    shipping_info: p.shippingInfo ?? "",
    returns_info: p.returnsInfo ?? "",
    size_guide: p.sizeGuide ?? [],
    size_guide_title: p.sizeGuideTitle ?? "European sizing",
    show_size_guide: p.showSizeGuide ?? false,
    trust_badges: p.trustBadges ?? [],
  };
}

export function mapCategory(row: Tables<"categories">): CategoryDef {
  return {
    id: row.id as Category,
    label: row.label,
    description: row.description ?? undefined,
  };
}

export function categoryToDbRow(c: CategoryDef): Database["public"]["Tables"]["categories"]["Insert"] {
  return {
    id: c.id,
    label: c.label,
    description: c.description ?? null,
  };
}

export function mapInventory(row: Tables<"inventory">): InventoryRecord {
  return {
    productId: row.product_id,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
  };
}

export function mapPost(row: Tables<"posts">): Post {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    cover: row.cover ?? undefined,
    categoryId: row.category_id,
    tags: row.tags ?? [],
    author: row.author,
    published: row.published,
    publishedAt: row.published_at ?? new Date().toISOString(),
  };
}

export function postToDbRow(p: Post): Database["public"]["Tables"]["posts"]["Insert"] {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    cover: p.cover ?? null,
    category_id: p.categoryId,
    tags: p.tags,
    author: p.author,
    published: p.published,
    published_at: p.publishedAt,
  };
}

export function mapPostCategory(row: Tables<"post_categories">): PostCategory {
  return {
    id: row.id,
    label: row.label,
    description: row.description ?? undefined,
  };
}

export function postCategoryToDbRow(
  c: PostCategory,
): Database["public"]["Tables"]["post_categories"]["Insert"] {
  return {
    id: c.id,
    label: c.label,
    description: c.description ?? null,
  };
}

export function mapMedia(row: Tables<"media_assets">): MediaItem {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    productIds: row.product_ids ?? [],
  };
}

function mapOrderStatus(status: DbOrderStatus): OrderStatus {
  return status as OrderStatus;
}

function mapOrderLine(row: Tables<"order_items">): OrderLine {
  return {
    productId: row.product_id ?? "",
    name: row.name,
    price: Number(row.price),
    qty: row.qty,
    color: row.color ?? undefined,
    size: row.size ?? undefined,
  };
}

export function mapOrder(
  row: Tables<"orders">,
  items: Tables<"order_items">[],
): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    shippingAddress: row.shipping_address,
    items: items.map(mapOrderLine),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: mapOrderStatus(row.status),
  };
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("products")
    .select("*, inventory(stock)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapDbProduct(row));
}

export async function fetchAdminCategories(): Promise<CategoryDef[]> {
  const { data, error } = await createSupabaseBrowserClient().from("categories").select("*");
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function fetchAdminInventory(): Promise<Record<string, InventoryRecord>> {
  const { data, error } = await createSupabaseBrowserClient().from("inventory").select("*");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((row) => [row.product_id, mapInventory(row)]));
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) =>
    mapOrder(row, (row.order_items ?? []) as Tables<"order_items">[]),
  );
}

export async function fetchAdminPosts(): Promise<Post[]> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPost);
}

export async function fetchAdminPostCategories(): Promise<PostCategory[]> {
  const { data, error } = await createSupabaseBrowserClient().from("post_categories").select("*");
  if (error) throw error;
  return (data ?? []).map(mapPostCategory);
}

export async function fetchAdminMedia(): Promise<MediaItem[]> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapMedia);
}
