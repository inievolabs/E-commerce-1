# Velin Studio — লাইভ রোডম্যাপ

> **লক্ষ্য:** ডেমো প্রোটোটাইপকে সম্পূর্ণ ফাংশনাল, সিকিউর, প্রোডাকশন-রেডি ই-কমার্সে রূপান্তর।  
> **নিয়ম:** প্রতিটি ধাপ শেষ হলে ✅ চেক করুন, তারপর পরের ধাপে যান।  
> **আনুমানিক সময়:** ৪–৬ সপ্তাহ

---

## সিদ্ধান্ত (নিশ্চিত)

| বিষয় | সিদ্ধান্ত |
|--------|----------|
| Payment | **COD only** (আপাতত) — Stripe/bKash পরে |
| Hosting | **Vercel** |
| Database | **Supabase** (Postgres + Auth) |
| Image CDN | **Cloudinary** (লোগোতে ইতিমধ্যে ব্যবহার) |
| Email | **Resend** (অর্ডার কনফার্মেশন, ঐচ্ছিক) |

---

## কাজের ক্রম (সংক্ষেপ)

```
ধাপ ০ → প্রস্তুতি ও অ্যাকাউন্ট সেটআপ
    ↓
ধাপ ১ → কোডবেস ফিক্স (ডেটা একীভূত)     ← এখান থেকে শুরু
    ↓
ধাপ ২ → Supabase DB স্কিমা + seed
    ↓
ধাপ ৩ → API + ফ্রন্টএন্ড সংযোগ
    ↓
ধাপ ৪ → Authentication (কাস্টমার + অ্যাডমিন)
    ↓
ধাপ ৫ → COD Checkout
    ↓
ধাপ ৬ → Admin Panel প্রোডাকশন-রেডি
    ↓
ধাপ ৭ → SEO, PWA ও পারফরম্যান্স
    ↓
ধাপ ৮ → টেস্টিং ও সিকিউরিটি
    ↓
ধাপ ৯ → Vercel Deploy
    ↓
ধাপ ১০ → Launch ✅
```

---

## ধাপ ০ — প্রস্তুতি (১ দিন)

### ০.১ অ্যাকাউন্ট ও টুল

- [ ] Vercel অ্যাকাউন্ট তৈরি / লগইন
- [ ] GitHub রিপো Vercel-এ কানেক্ট করার পরিকল্পনা
- [ ] Supabase প্রজেক্ট তৈরি (ফ্রি টিয়ার)
- [ ] Cloudinary অ্যাকাউন্ট (মিডিয়া আপলোডের জন্য)
- [ ] (ঐচ্ছিক) Resend — ইমেইলের জন্য
- [ ] ডোমেইন — কিনা বা পরে সংযুক্ত

### ০.২ Environment variables প্ল্যান

```env
# Client (VITE_ prefix)
VITE_SITE_URL=https://velinstudiobd.com
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Server only (Vercel env — কখনো client-এ expose নয়)
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
```

### ০.৩ মুদ্রা সিদ্ধান্ত

- [x] মুদ্রা: বাংলাদেশি টাকা (`৳` / BDT) — `formatPrice()`-এ প্রয়োগিত

### ০.৪ ডেলিভারেবল

- [ ] উপরের অ্যাকাউন্টগুলো তৈরি
- [ ] `.env.local` টেমপ্লেট প্রজেক্টে (`.env.example` — secrets ছাড়া)

---

## ধাপ ১ — কোডবেস ফিক্স (৩–৫ দিন)

> **লক্ষ্য:** বর্তমান ডেমো একসাথে কাজ করবে; ব্র্যান্ডিং ঠিক হবে।  
> **সবচেয়ে জরুরি ধাপ** — না করলে পরের সব ধাপে বারবার সমস্যা।

### ১.১ ডুয়াল ডেটা সোর্স একীভূত

**সমস্যা:** শপ `src/data/products.ts` পড়ে; অ্যাডমিন `admin-store` পড়ে — অ্যাডমিন এডিট শপে দেখা যায় না।

**কাজ:**

- [ ] `useCatalog()` বা `useProducts()` হুক — এক জায়গা থেকে প্রোডাক্ট
- [ ] আপডেট ফাইল: `shop.tsx`, `index.tsx`, `SearchOverlay.tsx`, `cart.tsx`, `wishlist.tsx`, `product.$id.tsx`
- [ ] `admin-store` প্রোডাক্ট লিস্ট = অস্থায়ী সোর্স অফ ট্রুথ (ধাপ ৩-এ DB)
- [ ] `getProductById()` কার্ট মডিউল থেকে ক্যাটালগ হুকে সরান

### ১.২ ব্র্যান্ডিং ও UI

- [x] `src/lib/cart.tsx` — `formatPrice()` বাংলাদেশি টাকা (`৳` / BDT)
- [ ] `src/lib/pwa-config.ts` — `theme-color` ব্র্যান্ড প্যালেটে (লাল `#E42328` বাদ)
- [ ] হিরো/ব্যানার — `public/` বা `src/assets/` লোকাল ইমেজ ওয়্যার
- [ ] `products.ts` — Unsplash URL কমিয়ে `/products/` লোকাল পাথ

### ১.৩ ছোট ফিক্স

- [ ] React Query — ধাপ ৩-এ ব্যবহার না হলে সরানোর সিদ্ধান্ত
- [ ] `src/routes/sitemap[.]xml.ts` — `BASE_URL` → `import.meta.env.VITE_SITE_URL`
- [ ] `dev-dist/` → `.gitignore`
- [ ] Windows path ডুপ্লিকেট (`src\routes` vs `src/routes`) পরিষ্কার

### ১.৪ ডেলিভারেবল

- [ ] লোকাল `npm run dev` — শপ ও অ্যাডমিন একই প্রোডাক্ট দেখায়
- [ ] `npm run build` সফল
- [ ] `npm run lint` পাস

---

## ধাপ ২ — Supabase DB (২–৩ দিন)

### ২.১ টেবিল

```
categories
├── id (text, PK)
├── label
└── description

products
├── id (text, PK)
├── name, price, category_id, gender, color, color_hex
├── images (jsonb)
├── description, materials
├── is_new, is_bestseller
└── created_at, updated_at

inventory
├── product_id (FK)
├── stock
└── low_stock_threshold

orders
├── id (text, PK)          — VS-XXXXX
├── user_id (FK, nullable) — গেস্ট অর্ডার
├── customer_name, customer_email, customer_phone
├── shipping_address (text)
├── payment_method         — 'cod' (default)
├── status                 — pending | confirmed | processing | shipped | delivered | cancelled
├── subtotal, shipping, total
└── created_at

order_items
├── order_id (FK)
├── product_id, name, price, qty, color, size

addresses (লগইন ইউজার)
├── user_id, label, line1, city, postal_code, country, is_default

posts, post_categories (ব্লগ/CMS)
media_assets (Cloudinary URL — dataUrl নয়)
```

### ২.২ COD অর্ডার স্ট্যাটাস ফ্লো

```
placed (COD, status: pending)
    → confirmed → processing → shipped → delivered
    → cancelled (যেকোনো ধাপে)
```

### ২.৩ কাজ

- [ ] Supabase SQL migration ফাইল
- [ ] Seed — বর্তমান `src/data/products.ts` এর ১৮ প্রোডাক্ট
- [ ] Row Level Security (RLS) পলিসি ড্রাফট
- [ ] `.env.example` আপডেট

### ২.৪ ডেলিভারেবল

- [ ] Supabase Table Editor-এ ডেটা দেখা যায়
- [ ] `GET` টেস্ট (Supabase client বা SQL)

---

## ধাপ ৩ — API + ফ্রন্টএন্ড (৫–৭ দিন)

### ৩.১ সার্ভার রুট

- [ ] TanStack Start server handlers / `createServerFn`
- [ ] `GET /api/products`, `GET /api/products/:id`
- [ ] `GET /api/categories`
- [ ] প্রোডাক্ট পেজ `loader` — DB থেকে

### ৩.২ স্টোরফ্রন্ট

- [ ] শপ, হোম, সার্চ — API/DB (অথবা SSR loader)
- [ ] React Query দিয়ে ক্যাশ (optional)
- [ ] ইনভেন্টরি — Add to Cart ও চেকআউটে স্টক চেক
- [ ] আউট-অফ-স্টক UI

### ৩.৩ কার্ট ও উইশলিস্ট

- [ ] গেস্ট: `localStorage` (বর্তমান মতো)
- [ ] লগইন: DB সিঙ্ক
- [ ] গেস্ট → লগইন: কার্ট মার্জ

### ৩.৪ ডেলিভারেবল

- [ ] রিফ্রেশ করলেও প্রোডাক্ট DB থেকে আসে
- [ ] অ্যাডমিন এডিট (অস্থায়ী store বা API) শপে প্রতিফলিত

---

## ধাপ ৪ — Authentication (৩–৪ দিন)

### ৪.১ কাস্টমার

- [ ] Supabase Auth — email/password
- [ ] `login.tsx`, `signup.tsx` — mock auth বাদ
- [ ] `src/lib/auth.tsx` — Supabase সেশন
- [ ] Password reset / email verify (Supabase default)
- [ ] `/account` — রিয়েল অর্ডার হিস্ট্রি (DB)

### ৪.২ Admin

- [ ] `ADMIN_PASSCODE = "admin"` সম্পূর্ণ সরান
- [ ] `admins` টেবিল বা `user_metadata.role === 'admin'`
- [ ] `/admin/*` — server-side বা loader guard
- [ ] `robots: noindex` রাখুন

### ৪.৩ ডেলিভারেবল

- [ ] সাইনআপ → লগইন → অ্যাকাউন্ট
- [ ] নন-অ্যাডমিন `/admin` অ্যাক্সেস করতে পারে না

---

## ধাপ ৫ — COD Checkout (২–৩ দিন)

> Stripe/bKash নেই — শুধু Cash on Delivery।

### ৫.১ UI

- [ ] পেমেন্ট মেথড: শুধু **Cash on Delivery** (একটি অপশন, ডিফল্ট)
- [ ] `alert()` বাদ → `/order-confirmation/$orderId`
- [ ] Zod + react-hook-form — নাম, **ফোন**, ঠিকানা বাধ্যতামূলক
- [ ] শিপিং মেথড (standard/express) — বর্তমান UI রাখা যায়

### ৫.২ API

- [ ] `POST /api/orders` — `payment_method: 'cod'`, `status: 'pending'`
- [ ] অর্ডার আইডি: `VS-` + সিকোয়েন্স
- [ ] স্টক কমানো (transaction / RPC)
- [ ] `orders.payment_method` enum — ভবিষ্যতে `'stripe' | 'bkash'` যোগের জন্য

### ৫.৩ নোটিফিকেশন (ঐচ্ছিক)

- [ ] Resend — কাস্টমারকে অর্ডার প্লেস ইমেইল
- [ ] অ্যাডমিন — নতুন অর্ডার ইমেইল বা Supabase Realtime

### ৫.৪ ডেলিভারেবল

- [ ] সম্পূর্ণ ফ্লো: কার্ট → চেকআউট → confirmation
- [ ] অ্যাডমিনে `pending` অর্ডার দেখা যায়
- [ ] কাস্টমার `/account`-এ অর্ডার

---

## ধাপ ৬ — Admin প্রোডাকশন (৪–৫ দিন)

### ৬.১ CRUD → Supabase

- [ ] Products, Categories, Inventory, Orders, Posts
- [ ] `localStorage` admin-store বাদ বা শুধু optimistic UI

### ৬.২ মিডিয়া

- [ ] `admin.media.tsx` — Cloudinary upload API
- [ ] `dataUrl` / `localStorage` মিডিয়া বাদ
- [ ] ইমেজ resize/WebP (Cloudinary transform)

### ৬.৩ ড্যাশবোর্ড

- [ ] Revenue — রিয়েল `orders` টেবিল
- [ ] Low stock — লাইভ `inventory`
- [ ] অর্ডার status: pending → confirmed → shipped → delivered

### ৬.৪ ডেলিভারেবল

- [ ] নতুন প্রোডাক্ট + ইমেজ → শপে লাইভ
- [ ] অর্ডার status আপডেট কাজ করে

---

## ধাপ ৭ — SEO, PWA ও পারফরম্যান্স (২ দিন)

- [ ] `VITE_SITE_URL` — প্রোডাকশন ডোমেইন
- [ ] `sitemap.xml` — absolute URLs
- [ ] JSON-LD `Product` schema (প্রোডাক্ট পেজ)
- [ ] `robots.txt` আপডেট
- [ ] PWA — প্রোডে service worker টেস্ট
- [ ] Hero image `preload` / Lighthouse mobile > 85

### ডেলিভারেবল

- [ ] Google Search Console-এ sitemap সাবমিট (লঞ্চের পর)

---

## ধাপ ৮ — টেস্টিং ও সিকিউরিটি (২–৩ দিন)

### ৮.১ টেস্ট

- [ ] Vitest সেটআপ
- [ ] Unit: `formatPrice`, cart merge, product filter
- [ ] E2E (Playwright): shop → cart → COD checkout → confirmation

### ৮.২ সিকিউরিটি

- [ ] Supabase RLS — ইউজার শুধু নিজের অর্ডার/অ্যাড্রেস
- [ ] Admin API — role verify
- [ ] Rate limit (login, order create) — Vercel middleware বা Supabase
- [ ] Secrets git-এ নেই; `.env` `.gitignore`-এ

### ৮.৩ ডেলিভারেবল

- [ ] CI: `lint` + `test` + `build` (GitHub Actions বা Vercel)

---

## ধাপ ৯ — Vercel Deploy (২–৩ দিন)

> প্রজেক্ট Lovable + Nitro (Cloudflare default) ব্যবহার করে — Vercel-এ adapter ঠিক করতে হবে।

### ৯.১ Build ও adapter

- [ ] Nitro `vercel` preset / TanStack Start Vercel গাইড অনুযায়ী কনফিগ
- [ ] লোকাল `npm run build` — এরর নেই
- [ ] Vercel-এ প্রথম deploy (preview) — build লগ চেক

### ৯.২ Environment (Vercel Dashboard)

- [ ] `VITE_SITE_URL`, `VITE_SUPABASE_*`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Production + Preview আলাদা (সুপারিশ)
- [ ] Cloudinary, Resend keys

### ৯.৩ ডোমেইন

- [ ] `*.vercel.app` preview টেস্ট
- [ ] Custom domain + SSL (Vercel auto)
- [ ] Staging branch → preview URL; `main` → production

### ৯.৪ পোস্ট-ডিপ্লয়

- [ ] (ঐচ্ছিক) Sentry error monitoring
- [ ] Supabase backup / point-in-time (পেইড প্ল্যানে)

### ৯.৫ ডেলিভারেবল

- [ ] Production URL লাইভ; COD অর্ডার end-to-end কাজ করে

---

## ধাপ ১০ — Launch চেকলিস্ট (১ দিন)

### ফাংশনাল

- [ ] হোম, শপ (ফিল্টার/সর্ট), প্রোডাক্ট ডিটেইল
- [ ] কার্ট, উইশলিস্ট
- [ ] সাইনআপ / লগইন / অ্যাকাউন্ট
- [ ] COD চেকআউট + confirmation
- [ ] অ্যাডমিন: প্রোডাক্ট, অর্ডার, ইনভেন্টরি, মিডিয়া, ব্লগ
- [ ] Privacy, Terms, Shipping-returns, Contact, About
- [ ] 404 / error boundaries

### COD-স্পেসিফিক

- [ ] শুধু COD পেমেন্ট অপশন
- [ ] ফোন নম্বর required
- [ ] নতুন অর্ডার → admin `pending`
- [ ] Status workflow: confirmed → shipped → delivered

### নন-ফাংশনাল

- [ ] Mobile + desktop responsive
- [ ] PWA manifest
- [ ] Page speed গ্রহণযোগ্য

---

## পরবর্তী সংস্করণ (লঞ্চের পরে)

- [ ] অনলাইন পেমেন্ট (Stripe / bKash / SSLCommerz)
- [ ] বাংলা / ফরাসি i18n
- [ ] কুপন / ডিসকাউন্ট
- [ ] Analytics (Vercel Analytics / Plausible)
- [ ] SMS অর্ডার আপডেট (বাংলাদেশ COD)

---

## প্রগ্রেস লগ

| ধাপ | স্ট্যাটাস | তারিখ | নোট |
|-----|----------|-------|-----|
| ০ | ⬜ | | |
| ১ | ⬜ | | |
| ২ | ⬜ | | |
| ৩ | ⬜ | | |
| ৪ | ⬜ | | |
| ৫ | ⬜ | | |
| ৬ | ⬜ | | |
| ৭ | ⬜ | | |
| ৮ | ⬜ | | |
| ৯ | ⬜ | | |
| ১০ | ⬜ | | |

**লেজেন্ড:** ⬜ না শুরু · 🔄 চলছে · ✅ সম্পন্ন

---

*শেষ আপডেট: ২০২৬-০৬-২২ — COD + Vercel + Supabase*
