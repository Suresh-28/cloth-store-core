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

// Local Storage Key
const GUEST_WISHLIST_KEY = "guest_wishlist_items";

function getGuestWishlist(): SupabaseWishlistItem[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SupabaseWishlistItem[];
  } catch {
    return [];
  }
}

function saveGuestWishlist(items: SupabaseWishlistItem[]) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
}

export const useSupabaseWishlist = () => {
  const [items, setItems] = useState<SupabaseWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // On mount: get current user and listen for changes
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

  const canUseWishlist = true; // always true now (for guests + users)

  // Unified fetch – uses localStorage fallback if not logged in
  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser || null);
      if (!currentUser) {
        // guest mode: use localStorage wishlist
        const guestItems = getGuestWishlist();
        setItems(guestItems);
        setLoading(false);
        return;
      }
      // Logged-in: fetch from Supabase as before
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

  // Add to wishlist (works for both: guest localStorage vs Supabase)
  const addToWishlist = async (productId: string, productMeta?: Partial<SupabaseWishlistItem>) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      // Guest: add/update to localStorage (need product info)
      if (!productMeta) return;
      let guestItems = getGuestWishlist();
      if (!guestItems.some(item => item.id === productId)) {
        guestItems = [
          ...guestItems, {
            id: productId,
            name: productMeta.name ?? '',
            price: productMeta.price ?? 0,
            image: productMeta.image ?? '',
            // optional fields:
            originalPrice: productMeta.originalPrice,
            discount: productMeta.discount,
            product_id: productId,
          }
        ];
        saveGuestWishlist(guestItems);
      }
      setItems(guestItems);
      return;
    }
    // Real user: use backend
    const { data: existing, error: existingError } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", currentUser.id)
      .eq("product_id", productId);

    if (existingError) {
      throw existingError;
    }

    if (existing && existing.length > 0) {
      await fetchWishlistItems();
      return;
    }

    const { error } = await supabase
      .from("wishlist_items")
      .insert([{ user_id: currentUser.id, product_id: productId }]);
    if (error) {
      throw error;
    }
    await fetchWishlistItems();
  };

  // Remove from wishlist (guest or real)
  const removeFromWishlist = async (productId: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      let guestItems = getGuestWishlist();
      guestItems = guestItems.filter(item => item.id !== productId);
      saveGuestWishlist(guestItems);
      setItems(guestItems);
      return;
    }
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("product_id", productId);
    if (error) {
      throw error;
    }
    await fetchWishlistItems();
  };

  // Check if product is wishlisted (guest or real user)
  const isInWishlist = (productId: string) => {
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
