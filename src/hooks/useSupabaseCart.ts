import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

interface SupabaseCartItem {
  id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export const useSupabaseCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          size,
          color,
          products (
            id,
            name,
            price,
            images
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }

      const cartItems: CartItem[] = data?.map((item: SupabaseCartItem) => ({
        id: item.product_id,
        name: item.products.name,
        price: Number(item.products.price),
        image: item.products.images?.[0] || '',
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity
      })) || [];

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (newItem: Omit<CartItem, 'quantity'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Check if item already exists
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', newItem.id)
        .eq('size', newItem.size)
        .eq('color', newItem.color);

      if (fetchError) {
        console.error('Error checking existing cart items:', fetchError);
        throw fetchError;
      }

      if (existingItems && existingItems.length > 0) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItems[0].quantity + 1 })
          .eq('id', existingItems[0].id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          throw updateError;
        }
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: newItem.id,
            quantity: 1,
            size: newItem.size,
            color: newItem.color
          }]);

        if (insertError) {
          console.error('Error adding to cart:', insertError);
          throw insertError;
        }
      }

      // Refresh cart items
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (id: string, size: string, color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('size', size)
        .eq('color', color);

      if (error) {
        console.error('Error removing from cart:', error);
        throw error;
      }

      setItems(prev => 
        prev.filter(item => !(item.id === id && item.size === size && item.color === color))
      );
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id, size, color);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('size', size)
        .eq('color', color);

      if (error) {
        console.error('Error updating cart quantity:', error);
        throw error;
      }

      setItems(prev =>
        prev.map(item =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }

      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  useEffect(() => {
    fetchCartItems();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchCartItems();
      } else if (event === 'SIGNED_OUT') {
        setItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refetch: fetchCartItems
  };
};
