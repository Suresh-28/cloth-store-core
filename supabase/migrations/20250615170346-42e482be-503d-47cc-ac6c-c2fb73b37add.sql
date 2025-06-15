
-- Allow logged-in users to manage their own orders (if you want only logged-in users, remove guest policy below!)
CREATE POLICY "Users can insert/select their own orders"
  ON public.orders
  FOR ALL
  USING (
    user_id IS NOT NULL AND auth.uid() = user_id
  )
  WITH CHECK (
    user_id IS NOT NULL AND auth.uid() = user_id
  );

-- Allow guests (user_id IS NULL) to insert/select their orders (for guest checkout)
CREATE POLICY "Guests can insert/select their orders"
  ON public.orders
  FOR ALL
  USING (
    user_id IS NULL
  )
  WITH CHECK (
    user_id IS NULL
  );
