
-- Create the checkout_infos table to store checkout info for both users and guests
CREATE TABLE public.checkout_infos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'United Kingdom',
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure only one checkout info per user or guest email
CREATE UNIQUE INDEX unique_checkout_info_user_id ON checkout_infos(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX unique_checkout_info_email ON checkout_infos(email) WHERE user_id IS NULL;

-- Enable Row Level Security
ALTER TABLE public.checkout_infos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow logged-in users to manage their own info
CREATE POLICY "Users can manage their own checkout info"
  ON public.checkout_infos
  FOR ALL
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (user_id IS NULL AND true)
  )
  WITH CHECK (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (user_id IS NULL AND true)
  );

-- Policy: Allow guests to SELECT checkout info by email (user_id IS NULL)
CREATE POLICY "Guests can select their checkout info by email"
  ON public.checkout_infos
  FOR SELECT
  USING (
    user_id IS NULL
  );

-- Policy: Allow guests to INSERT their checkout info by email (user_id IS NULL)
CREATE POLICY "Guests can insert their checkout info by email"
  ON public.checkout_infos
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
  );

-- Policy: Allow guests to UPDATE their checkout info by email (user_id IS NULL)
CREATE POLICY "Guests can update their checkout info by email"
  ON public.checkout_infos
  FOR UPDATE
  USING (
    user_id IS NULL
  )
  WITH CHECK (
    user_id IS NULL
  );
