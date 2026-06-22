/**
 * Re-seed Supabase products from src/data/products.ts.
 * Requires SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL in .env.local
 *
 * Usage: npm run seed:supabase
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  try {
    const envPath = join(root, ".env.local");
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const { products } = await import(pathToFileURL(join(root, "src/data/products.ts")).href);

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = products.map((p) => ({
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
}));

const { error: productError } = await supabase.from("products").upsert(rows, { onConflict: "id" });
if (productError) {
  console.error("Product seed failed:", productError.message);
  process.exit(1);
}

const inventory = products.map((p) => ({
  product_id: p.id,
  stock: 12,
  low_stock_threshold: 4,
}));

const { error: inventoryError } = await supabase
  .from("inventory")
  .upsert(inventory, { onConflict: "product_id" });
if (inventoryError) {
  console.error("Inventory seed failed:", inventoryError.message);
  process.exit(1);
}

console.log(`Seeded ${products.length} products + inventory rows.`);
