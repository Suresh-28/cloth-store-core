
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WishlistItem } from '@/contexts/WishlistContext';

export const useSupabaseWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            original_price,
            images,
            discount
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      const wishlistItems: WishlistItem[] = data?.map(item => ({
        id: item.product_id,
        name: item.products.name,
        price: Number(item.products.price),
        image: item.products.images?.[0] || '',
        originalPrice: item.products.original_price ? Number(item.products.original_price) : undefined,
        discount: item.products.discount
      })) || [];

      setItems(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (item: WishlistItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { error } = await supabase
        .from('wishlist_items')
        .insert([{
          user_id: user.id,
          product_id: item.id
        }]);

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }

      setItems(prev => {
        if (prev.find(wishlistItem => wishlistItem.id === item.id)) {
          return prev;
        }
        return [...prev, item];
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id);

      if (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
      }

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  };

  useEffect(() => {
    fetchWishlistItems();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchWishlistItems();
      } else if (event === 'SIGNED_OUT') {
        setItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlistItems
  };
};
