
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

  const addProduct = async (product: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }

      if (data) {
        const newProduct = convertSupabaseToProduct(data);
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<SupabaseProduct>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
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
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
