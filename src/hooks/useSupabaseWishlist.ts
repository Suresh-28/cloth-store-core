import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseWishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  discount?: number;
  product_id: string;
}

export const useSupabaseWishlist = () => {
  const [items, setItems] = useState<SupabaseWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // On mount, get current user and listen for changes
  useEffect(() => {
    let mounted = true;
    const fetchAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data?.user || null);
      }
    };
    fetchAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      fetchWishlistItems();
    });
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const canUseWishlist = !!user;

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser }, error: userErr } = await supabase.auth.getUser();
      // sync user state if they log out/in during lifetime
      setUser(currentUser || null);
      if (!currentUser) {
        setItems([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            images,
            original_price,
            discount
          )
        `)
        .eq("user_id", currentUser.id);

      if (error) {
        setItems([]);
        setLoading(false);
        return;
      }

      const wishlistItems = (data || []).map((item: any) => ({
        id: item.product_id,
        name: item.products?.name || "Unknown",
        price: Number(item.products?.price) || 0,
        image: item.products?.images?.[0] || "",
        originalPrice: item.products?.original_price,
        discount: item.products?.discount,
        product_id: item.product_id,
      }));

      setItems(wishlistItems);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      throw new Error("Please login to use the wishlist.");
    }
    // Insert only if not already wishlisted
    const { data: existing, error: existingError } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (existingError) {
      throw existingError;
    }

    if (existing && existing.length > 0) {
      // already added
      return;
    }

    const { error } = await supabase
      .from("wishlist_items")
      .insert([{ user_id: user.id, product_id: productId }]);
    if (error) {
      throw error;
    }
    await fetchWishlistItems();
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      throw new Error("Please login to use the wishlist.");
    }

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) {
      throw error;
    }
    await fetchWishlistItems();
  };

  const isInWishlist = (productId: string) => {
    // Only allow check if logged in
    if (!user) return false;
    return items.some((item) => item.id === productId);
  };

  useEffect(() => {
    fetchWishlistItems();
    // Auth state change handled above - triggers refetch
  }, []);

  return {
    items,
    loading,
    user,
    canUseWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlistItems,
  };
};
