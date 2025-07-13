
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';

export interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock_quantity: number;
  is_active: boolean;
  rating: number;
  review_count: number;
  features: string[];
  discount?: number;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const convertSupabaseToProduct = (supabaseProduct: SupabaseProduct): Product => ({
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    description: supabaseProduct.description || '',
    price: Number(supabaseProduct.price),
    originalPrice: supabaseProduct.original_price ? Number(supabaseProduct.original_price) : undefined,
    category: supabaseProduct.category as 'men' | 'women',
    sizes: supabaseProduct.sizes || [],
    colors: supabaseProduct.colors?.map(color => ({ name: color, value: color })) || [],
    image: supabaseProduct.images?.[0] || '',
    images: supabaseProduct.images || [],
    rating: Number(supabaseProduct.rating),
    reviewCount: supabaseProduct.review_count,
    features: supabaseProduct.features || [],
    discount: supabaseProduct.discount,
    isNew: supabaseProduct.is_new
  });

  const convertProductToSupabase = (product: any): Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'> => ({
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    original_price: product.originalPrice ? Number(product.originalPrice) : null,
    category: product.category === 'all' ? 'men' : product.category,
    sizes: product.sizes || [],
    colors: product.colors?.map((c: any) => typeof c === 'string' ? c : c.name) || [],
    images: product.images || [],
    stock_quantity: product.stock_quantity || 0,
    is_active: true,
    rating: Number(product.rating) || 0,
    review_count: product.reviewCount || 0,
    features: product.features || [],
    discount: product.discount || null,
    is_new: product.isNew || false
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      const convertedProducts = data?.map(convertSupabaseToProduct) || [];
      setProducts(convertedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: any) => {
    try {
      console.log('Adding product:', product);
      const supabaseProduct = convertProductToSupabase(product);
      console.log('Converted to Supabase format:', supabaseProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert([supabaseProduct])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }

      if (data) {
        const newProduct = convertSupabaseToProduct(data);
        setProducts(prev => [newProduct, ...prev]);
        await fetchProducts(); // Refresh the list
        return newProduct;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      const supabaseUpdates = convertProductToSupabase(updates);
      
      const { data, error } = await supabase
        .from('products')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      if (data) {
        const updatedProduct = convertSupabaseToProduct(data);
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        return updatedProduct;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Actually delete from database instead of just setting inactive
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      // Update local state to remove the deleted product
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Set up real-time subscription for products with a unique channel name
    const channelName = `products-changes-${Date.now()}-${Math.random()}`;
    const productsChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Products updated in real-time:', payload);
          fetchProducts(); // Refetch products when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, []); // Empty dependency array to run only once

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
