
import React, { createContext, useContext, ReactNode } from 'react';
import { Product } from '@/data/products';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: any) => Promise<Product | undefined>;
  updateProduct: (id: string, product: any) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch
  } = useSupabaseProducts();

  return (
    <ProductsContext.Provider value={{
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      refetch
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
