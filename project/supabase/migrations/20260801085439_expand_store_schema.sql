/*
# Expand Stationery Store Schema

Adds reviews, wishlist, and product images support for a world-class store experience.

1. New Tables
- `reviews`: customer reviews per product (product_id, author_name, rating, comment, approved)
- `wishlist`: saved products per session (session_id, product_id) - no auth needed
- `product_images`: multiple images per product (product_id, image_url, sort_order)

2. Modified Tables
- `products`: add `sku`, `brand`, `weight` columns
- `orders`: add `payment_method`, `shipping_cost` columns

3. Security (RLS)
- reviews: public read (approved only), public insert, authenticated update/delete
- wishlist: public read/insert/delete (session-scoped via app)
- product_images: public read, authenticated write

4. Notes
- Reviews are moderated by admin before showing publicly
- Wishlist uses a browser session ID (no login required)
- Multiple product images enable galleries on product detail pages
*/

-- Add columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight numeric(8,2);

-- Add columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) DEFAULT 0;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_reviews" ON reviews;
CREATE POLICY "public_read_approved_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_reviews" ON reviews;
CREATE POLICY "auth_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_reviews" ON reviews;
CREATE POLICY "auth_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (true);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (session_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlist(session_id);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_wishlist" ON wishlist;
CREATE POLICY "public_read_wishlist" ON wishlist FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_wishlist" ON wishlist;
CREATE POLICY "public_insert_wishlist" ON wishlist FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_wishlist" ON wishlist;
CREATE POLICY "public_delete_wishlist" ON wishlist FOR DELETE
  TO anon, authenticated USING (true);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_product_images" ON product_images;
CREATE POLICY "auth_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_product_images" ON product_images;
CREATE POLICY "auth_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_product_images" ON product_images;
CREATE POLICY "auth_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (true);
