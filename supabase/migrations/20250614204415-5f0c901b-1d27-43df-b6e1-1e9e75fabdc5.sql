
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

-- Enable RLS on existing tables that need it
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products (public read, admin write)
CREATE POLICY "Anyone can view active products" ON public.products
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can insert products" ON public.products
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON public.products
FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for wishlist_items (users can only access their own)
CREATE POLICY "Users can view their own wishlist items" ON public.wishlist_items
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist_items
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist_items
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create RLS policies for cart_items (users can only access their own)
CREATE POLICY "Users can view their own cart items" ON public.cart_items
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON public.cart_items
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add missing columns to cart_items table
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS color text;

-- Update products table to match our frontend structure
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS discount integer,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false;
