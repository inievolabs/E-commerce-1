-- Velin Studio: RLS policies

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Products
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Inventory
CREATE POLICY "Public read inventory" ON public.inventory FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage inventory" ON public.inventory FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid()));
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Addresses
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins read all addresses" ON public.addresses FOR SELECT TO authenticated USING (is_admin());

-- Orders
CREATE POLICY "Anyone can place guest orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins manage orders" ON public.orders FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (is_admin());

-- Order items
CREATE POLICY "Read order items via order access" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR is_admin())));
CREATE POLICY "Insert order items with order" ON public.order_items FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (o.user_id IS NULL OR o.user_id = auth.uid())));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Post categories
CREATE POLICY "Public read post categories" ON public.post_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage post categories" ON public.post_categories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Posts
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT TO public USING (published = true OR is_admin());
CREATE POLICY "Admins manage posts" ON public.posts FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Media assets
CREATE POLICY "Public read media assets" ON public.media_assets FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage media assets" ON public.media_assets FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
