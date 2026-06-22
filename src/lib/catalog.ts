import type { Category, Gender, Product } from "@/data/products";
import type { SizeGuideRow, TrustBadge } from "@/lib/product-defaults";
import {
  DEFAULT_RETURNS_INFO,
  DEFAULT_SHIPPING_INFO,
  DEFAULT_SIZE_GUIDE,
  DEFAULT_SIZE_GUIDE_TITLE,
  DEFAULT_TAX_LABEL,
  DEFAULT_TRUST_BADGES,
  defaultShowSizeGuide,
  defaultSizesForCategory,
} from "@/lib/product-defaults";
import type { Database } from "./database.types";
import { createSupabaseBrowserClient, createSupabaseClient } from "./supabase";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductWithInventory = DbProduct & {
  inventory?: { stock: number } | { stock: number }[] | null;
};

function parseImages(images: DbProduct["images"]): string[] {
  if (Array.isArray(images)) return images as string[];
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images) as unknown;
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseSizeGuide(value: DbProduct["size_guide"]): SizeGuideRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row): row is Record<string, string> => typeof row === "object" && row !== null)
    .map((row) => ({
      eu: String(row.eu ?? ""),
      uk: String(row.uk ?? ""),
      us: String(row.us ?? ""),
      cm: String(row.cm ?? ""),
    }))
    .filter((row) => row.eu || row.uk || row.us || row.cm);
}

function parseTrustBadges(value: DbProduct["trust_badges"]): TrustBadge[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row): row is Record<string, string> => typeof row === "object" && row !== null)
    .map((row) => ({
      icon: String(row.icon ?? "truck"),
      label: String(row.label ?? ""),
    }))
    .filter((row) => row.label);
}

function inventoryStock(row: DbProductWithInventory): number | undefined {
  const inv = row.inventory;
  if (!inv) return undefined;
  if (Array.isArray(inv)) return inv[0]?.stock;
  return inv.stock;
}

export function mapDbProduct(row: DbProductWithInventory): Product {
  const category = row.category_id as Category;

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category,
    gender: row.gender as Gender,
    color: row.color,
    colorHex: row.color_hex,
    images: parseImages(row.images),
    description: row.description,
    materials: row.materials,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    sizes: row.sizes ?? defaultSizesForCategory(category),
    taxIncluded: row.tax_included,
    taxLabel: row.tax_label || DEFAULT_TAX_LABEL,
    shippingInfo: row.shipping_info || DEFAULT_SHIPPING_INFO,
    returnsInfo: row.returns_info || DEFAULT_RETURNS_INFO,
    sizeGuide: Array.isArray(row.size_guide) ? parseSizeGuide(row.size_guide) : DEFAULT_SIZE_GUIDE,
    sizeGuideTitle: row.size_guide_title || DEFAULT_SIZE_GUIDE_TITLE,
    showSizeGuide: row.show_size_guide,
    trustBadges: Array.isArray(row.trust_badges)
      ? parseTrustBadges(row.trust_badges)
      : DEFAULT_TRUST_BADGES,
    stock: inventoryStock(row),
  };
}

const PRODUCT_SELECT = "*, inventory(stock)";

async function queryProducts(client = createSupabaseClient()) {
  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapDbProduct(row as DbProductWithInventory));
}

export async function fetchCatalogProducts(): Promise<Product[]> {
  return queryProducts(createSupabaseBrowserClient());
}

export async function fetchCatalogProduct(id: string): Promise<Product | null> {
  const client = createSupabaseBrowserClient();
  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDbProduct(data as DbProductWithInventory) : null;
}

/** Server / loader context — uses anon key from process.env */
export async function fetchCatalogProductsServer(): Promise<Product[]> {
  return queryProducts();
}

export async function fetchCatalogProductServer(id: string): Promise<Product | null> {
  const { data, error } = await createSupabaseClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDbProduct(data as DbProductWithInventory) : null;
}

export function getProductById(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
