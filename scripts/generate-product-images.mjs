import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(rootDir, "public", "products");

/** Curated Unsplash photo IDs — one pair per product, category-matched. */
const PRODUCT_PHOTOS = {
  "w-bag-01": ["photo-1584917865442-de89df76afd3", "photo-1596552639068-99bd471b579c"],
  "w-bag-02": ["photo-1591561954557-26941169b49e", "photo-1566150905458-1bf1fc113f0d"],
  "w-bag-03": ["photo-1611688599669-e0d5a0497670", "photo-1548036328-c9fa89d128fa"],
  "w-bag-04": ["photo-1606522754091-a3bbf9ad4cb3", "photo-1559563458-527698bf5295"],
  "w-lug-01": ["photo-1572276596237-5db2c3e16c5d", "photo-1553062407-98eeb64c6a62"],
  "w-lug-02": ["photo-1565026057447-bc90a3dceb87", "photo-1581553680321-4fffae59fccd"],
  "w-slp-01": ["photo-1543163521-1bf539c55dd2", "photo-1603487742131-4160ec999306"],
  "w-slp-02": ["photo-1518049362265-d5b2a6467637", "photo-1535043934128-cf0b28d52f95"],
  "w-slp-03": ["photo-1549298916-b41d501d3772", "photo-1606107557195-0e29a4b5b4aa"],
  "m-bag-01": ["photo-1591348122449-02525d70379b", "photo-1547949003-9792a18a2601"],
  "m-bag-02": ["photo-1517612228538-cefdbc2c01e7", "photo-1622560480605-d83c853bc5c3"],
  "m-bag-03": ["photo-1553062407-98eeb64c6a62", "photo-1572276596237-5db2c3e16c5d"],
  "m-wal-01": ["photo-1627123424574-724758594e93", "photo-1604644401890-0bd678c83788"],
  "m-wal-02": ["photo-1558618666-fcd25c85cd64", "photo-1627123424574-724758594e93"],
  "m-wal-03": ["photo-1604644401890-0bd678c83788", "photo-1558618666-fcd25c85cd64"],
  "m-wal-04": ["photo-1627123424574-724758594e93", "photo-1558618666-fcd25c85cd64"],
};

const unsplashUrl = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

await mkdir(outDir, { recursive: true });

let ok = 0;
let fail = 0;

for (const [productId, photoIds] of Object.entries(PRODUCT_PHOTOS)) {
  for (let i = 0; i < photoIds.length; i++) {
    const filename = `${productId}-${i + 1}.jpg`;
    const dest = join(outDir, filename);
    const url = unsplashUrl(photoIds[i]);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      ok++;
      console.log(`✓ ${filename}`);
    } catch (err) {
      fail++;
      console.error(`✗ ${filename}: ${err.message}`);
    }
  }
}

console.log(`\nDone: ${ok} saved, ${fail} failed → ${outDir}`);
