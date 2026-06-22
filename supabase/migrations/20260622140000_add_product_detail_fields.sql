-- Product detail page fields editable from admin

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tax_included boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tax_label text NOT NULL DEFAULT 'Tax included',
  ADD COLUMN IF NOT EXISTS shipping_info text NOT NULL DEFAULT 'Complimentary express shipping nationwide.',
  ADD COLUMN IF NOT EXISTS returns_info text NOT NULL DEFAULT 'Free 30-day returns on unworn pieces in original packaging.',
  ADD COLUMN IF NOT EXISTS size_guide jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS size_guide_title text NOT NULL DEFAULT 'European sizing',
  ADD COLUMN IF NOT EXISTS show_size_guide boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trust_badges jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill trust badges for all products
UPDATE public.products
SET trust_badges = '[
  {"icon": "truck", "label": "Complimentary shipping"},
  {"icon": "hammer", "label": "Hand-finished in Italy"},
  {"icon": "rotate-ccw", "label": "30-day returns"}
]'::jsonb
WHERE trust_badges = '[]'::jsonb OR trust_badges IS NULL;

-- Backfill size guide rows (slippers use on product page)
UPDATE public.products
SET size_guide = '[
  {"eu": "36", "uk": "3", "us": "5", "cm": "23"},
  {"eu": "37", "uk": "4", "us": "6", "cm": "23.5"},
  {"eu": "38", "uk": "5", "us": "7", "cm": "24"},
  {"eu": "39", "uk": "6", "us": "8", "cm": "24.5"},
  {"eu": "40", "uk": "7", "us": "9", "cm": "25.5"},
  {"eu": "41", "uk": "8", "us": "10", "cm": "26"}
]'::jsonb
WHERE size_guide = '[]'::jsonb OR size_guide IS NULL;

-- Slippers: sizes + size guide visibility
UPDATE public.products
SET
  sizes = ARRAY['36', '37', '38', '39', '40', '41'],
  show_size_guide = true
WHERE category_id = 'slippers';
