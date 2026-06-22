-- Velin Studio: default CMS content

INSERT INTO public.post_categories (id, label, description) VALUES
  ('craft', 'Craft', 'Materials, ateliers and the making process.'),
  ('style', 'Style', 'Editorial looks and seasonal edits.'),
  ('travel', 'Travel', 'Weekenders, packing and slow journeys.')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description;

INSERT INTO public.posts (id, title, excerpt, body, cover, category_id, tags, author, published, published_at) VALUES
  (
    'the-art-of-patina',
    'The Art of Patina',
    'How vegetable-tanned leather develops character over years of wear.',
    'Patina is not a defect — it is the record of a life lived with a single object. Our Holm Messenger, cut from Tuscan vegetable-tanned leather, deepens in tone with sunlight and use.',
    NULL,
    'craft',
    ARRAY['leather', 'craft'],
    'Velin Studio',
    true,
    now() - interval '14 days'
  ),
  (
    'weekend-edit',
    'The Weekend Edit',
    'Three pieces for an unhurried departure.',
    'The Voyage Weekender, Marais Shoulder Bag and Mira Mule form a quiet trio for slow travel — each designed to carry only what matters.',
    NULL,
    'style',
    ARRAY['weekend', 'edit'],
    'Velin Studio',
    true,
    now() - interval '7 days'
  ),
  (
    'cabin-trunk-notes',
    'Notes on the Cabin Trunk',
    'Featherweight aluminium meets hand-finished leather corners.',
    'The Aerea Cabin Trunk balances structure and silence: a four-wheel system that glides, corners wrapped in calfskin, and an interior that keeps garments uncreased.',
    NULL,
    'travel',
    ARRAY['luggage', 'travel'],
    'Velin Studio',
    true,
    now() - interval '3 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  category_id = EXCLUDED.category_id,
  tags = EXCLUDED.tags,
  author = EXCLUDED.author,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;
