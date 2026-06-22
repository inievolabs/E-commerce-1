-- Velin Studio: catalog tables + product seed

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  category_id text NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  gender text NOT NULL CHECK (gender IN ('women', 'men')),
  color text NOT NULL,
  color_hex text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL,
  materials text NOT NULL,
  is_new boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory (
  product_id text PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  stock integer NOT NULL DEFAULT 12 CHECK (stock >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 4 CHECK (low_stock_threshold >= 0)
);

INSERT INTO public.categories (id, label, description) VALUES
  ('bags', 'Bags', 'Shoulder bags, totes, hobos and crossbodies.'),
  ('luggage', 'Luggage', 'Weekenders and cabin trunks.'),
  ('slippers', 'Slippers', 'Mules, flats and loungewear.'),
  ('wallets', 'Wallets', 'Bifolds, cardholders and pouches.')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description;

-- Seed products from src/data/products.ts (16 items)
INSERT INTO public.products (
  id, name, price, category_id, gender, color, color_hex, images,
  description, materials, is_new, is_bestseller
) VALUES
  ('w-bag-01', 'Marais Shoulder Bag', 1480, 'bags', 'women', 'Camel', '#b08458', '["/products/w-bag-01-1.jpg","/products/w-bag-01-2.jpg"]', 'A softly structured shoulder bag in supple Italian leather, finished with hand-burnished edges.', 'Full-grain calfskin, brass hardware, suede lining.', true, true),
  ('w-bag-02', 'Lune Mini Tote', 1120, 'bags', 'women', 'Ivory', '#efe7d8', '["/products/w-bag-02-1.jpg","/products/w-bag-02-2.jpg"]', 'A miniature tote with subtle pleating, designed for the considered essentials of an unhurried day.', 'Smooth nappa leather, lambskin lining.', true, false),
  ('w-bag-03', 'Rive Hobo', 1690, 'bags', 'women', 'Noir', '#1a1a1a', '["/products/w-bag-03-1.jpg","/products/w-bag-03-2.jpg"]', 'Slouched silhouette with a single curved handle, an everyday hobo refined to its essential form.', 'Pebbled calfskin, woven cotton lining.', false, true),
  ('w-bag-04', 'Sienna Crossbody', 980, 'bags', 'women', 'Burgundy', '#5c1a1b', '["/products/w-bag-04-1.jpg","/products/w-bag-04-2.jpg"]', 'Compact crossbody with adjustable strap and a sculpted magnetic flap closure.', 'Polished calfskin, palladium hardware.', false, false),
  ('w-lug-01', 'Voyage Weekender', 2480, 'luggage', 'women', 'Cognac', '#8b4a2a', '["/products/w-lug-01-1.jpg","/products/w-lug-01-2.jpg"]', 'A spacious weekender hand-stitched in the Tuscan tradition, made for slow travel.', 'Vegetable-tanned leather, solid brass feet.', false, true),
  ('w-lug-02', 'Aerea Cabin Trunk', 3290, 'luggage', 'women', 'Ivory', '#efe7d8', '["/products/w-lug-02-1.jpg","/products/w-lug-02-2.jpg"]', 'Cabin-sized trunk in featherweight aluminum with leather corners and a silent four-wheel system.', 'Anodised aluminium, calfskin trim.', true, false),
  ('w-slp-01', 'Mira Mule', 590, 'slippers', 'women', 'Noir', '#1a1a1a', '["/products/w-slp-01-1.jpg","/products/w-slp-01-2.jpg"]', 'A relaxed leather mule with a softly squared toe and tonal stitching.', 'Nappa leather upper, leather sole.', true, false),
  ('w-slp-02', 'Velvet Lounge Slipper', 480, 'slippers', 'women', 'Burgundy', '#5c1a1b', '["/products/w-slp-02-1.jpg","/products/w-slp-02-2.jpg"]', 'Plush velvet slipper with embroidered emblem — refined comfort for evenings at home.', 'Silk velvet, leather sole, shearling lining.', false, false),
  ('w-slp-03', 'Sole Flat', 540, 'slippers', 'women', 'Camel', '#b08458', '["/products/w-slp-03-1.jpg","/products/w-slp-03-2.jpg"]', 'Unstructured leather flat that folds gently with the foot — an everyday companion.', 'Calfskin upper, padded leather insole.', false, true),
  ('m-bag-01', 'Atlas Briefcase', 1890, 'bags', 'men', 'Noir', '#1a1a1a', '["/products/m-bag-01-1.jpg","/products/m-bag-01-2.jpg"]', 'An architectural briefcase with hand-rolled handles and a discreet trolley sleeve.', 'Saffiano leather, palladium hardware.', false, true),
  ('m-bag-02', 'Holm Messenger', 1340, 'bags', 'men', 'Cognac', '#8b4a2a', '["/products/m-bag-02-1.jpg","/products/m-bag-02-2.jpg"]', 'Soft-construction messenger in vegetable-tanned leather that develops a unique patina over time.', 'Vegetable-tanned leather, canvas lining.', true, false),
  ('m-bag-03', 'Nord Duffel', 1620, 'bags', 'men', 'Olive', '#4b4a30', '["/products/m-bag-03-1.jpg","/products/m-bag-03-2.jpg"]', 'A weekend duffel cut from waxed canvas and trimmed in matte leather.', 'Waxed cotton canvas, bridle leather trim.', false, false),
  ('m-wal-01', 'Bifold Wallet', 380, 'wallets', 'men', 'Noir', '#1a1a1a', '["/products/m-wal-01-1.jpg","/products/m-wal-01-2.jpg"]', 'A slim bifold with six card slots and a full-length note compartment, edge-painted by hand.', 'Box calf leather, lambskin lining.', false, true),
  ('m-wal-02', 'Cardholder', 240, 'wallets', 'men', 'Cognac', '#8b4a2a', '["/products/m-wal-02-1.jpg","/products/m-wal-02-2.jpg"]', 'Minimalist cardholder with four slots and a central pocket, debossed with our quiet monogram.', 'Vegetable-tanned calfskin.', true, false),
  ('m-wal-03', 'Long Wallet', 520, 'wallets', 'men', 'Burgundy', '#5c1a1b', '["/products/m-wal-03-1.jpg","/products/m-wal-03-2.jpg"]', 'A travel-length wallet with twelve card slots, a zipped coin pocket, and a passport sleeve.', 'Saffiano leather, satin lining.', false, false),
  ('m-wal-04', 'Zip Pouch', 460, 'wallets', 'men', 'Ivory', '#efe7d8', '["/products/m-wal-04-1.jpg","/products/m-wal-04-2.jpg"]', 'A clean-lined zip pouch for documents, devices, and the quiet ceremony of arrival.', 'Smooth calfskin, brass zip.', false, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  gender = EXCLUDED.gender,
  color = EXCLUDED.color,
  color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  is_new = EXCLUDED.is_new,
  is_bestseller = EXCLUDED.is_bestseller,
  updated_at = now();

INSERT INTO public.inventory (product_id, stock, low_stock_threshold)
SELECT id, 12, 4 FROM public.products
ON CONFLICT (product_id) DO NOTHING;
