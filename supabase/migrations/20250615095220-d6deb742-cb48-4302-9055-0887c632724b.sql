
-- CART ITEMS TABLE (if not already present - it currently exists, so this is just for reference)
-- Table and columns already exist:
--   id (uuid, PK), user_id (uuid), product_id (uuid), quantity (int), size (text), color (text), created_at (timestamp), updated_at (timestamp)

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Only allow users to see and modify their own cart items
CREATE POLICY "Cart: users can view their items"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Cart: users can add items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cart: users can update their items"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Cart: users can remove items"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- WISHLIST ITEMS TABLE (if not already present - it currently exists)
-- Table and columns already exist:
--   id (uuid, PK), user_id (uuid), product_id (uuid), created_at (timestamp)

-- Enable Row Level Security
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Only allow users to see and modify their own wishlist items
CREATE POLICY "Wishlist: users can view their items"
  ON public.wishlist_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Wishlist: users can add items"
  ON public.wishlist_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wishlist: users can remove items"
  ON public.wishlist_items
  FOR DELETE
  USING (auth.uid() = user_id);

