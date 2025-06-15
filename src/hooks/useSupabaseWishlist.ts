
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

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      console.log("[Wishlist] fetchWishlistItems - user", user, userErr);
      if (!user) {
        console.warn("[Wishlist] No user - returning empty items.");
        setItems([]);
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
        .eq("user_id", user.id);

      if (error) {
        console.error("[Wishlist] Error fetching wishlist:", error);
        setItems([]);
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

      console.log("[Wishlist] Items after fetch:", wishlistItems);

      setItems(wishlistItems);
    } catch (err) {
      console.error("[Wishlist] fetchWishlistItems unexpected error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("[Wishlist] addToWishlist - user", user, productId);
    if (!user) {
      console.error("[Wishlist] You must be logged in to use the wishlist.");
      throw new Error("You must be logged in to use the wishlist.");
    }
    // Insert only if not already wishlisted
    const { data: existing, error: existingError } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (existingError) {
      console.error("[Wishlist] addToWishlist - check existing error:", existingError);
      throw existingError;
    }

    if (existing && existing.length > 0) {
      console.log("[Wishlist] Item already in wishlist, not adding.", existing);
      return; // already added
    }

    const { error } = await supabase
      .from("wishlist_items")
      .insert([{ user_id: user.id, product_id: productId }]);
    if (error) {
      console.error("[Wishlist] addToWishlist - insert error:", error);
      throw error;
    }
    console.log("[Wishlist] Item added to wishlist, refreshing...");
    await fetchWishlistItems();
  };

  const removeFromWishlist = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("[Wishlist] removeFromWishlist - user", user, productId);
    if (!user) {
      console.error("[Wishlist] You must be logged in to use the wishlist.");
      throw new Error("You must be logged in to use the wishlist.");
    }

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) {
      console.error("[Wishlist] removeFromWishlist - error:", error);
      throw error;
    }
    console.log("[Wishlist] Item removed from wishlist, refreshing...");
    await fetchWishlistItems();
  };

  const isInWishlist = (productId: string) => {
    const found = items.some((item) => item.id === productId);
    console.log("[Wishlist] isInWishlist", productId, found);
    return found;
  };

  useEffect(() => {
    fetchWishlistItems();
    // Real-time: re-fetch on sign in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      console.log("[Wishlist] Auth state change - refetching...");
      fetchWishlistItems();
    });
    return () => subscription?.unsubscribe();
  }, []);

  return {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlistItems,
  };
};

