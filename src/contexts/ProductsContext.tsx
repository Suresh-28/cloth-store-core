
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, products as initialProducts } from '@/data/products';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = 'products';

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    // Try to load products from localStorage on initialization
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY);
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        // Ensure we always have the initial products plus any saved ones
        const existingIds = new Set(initialProducts.map(p => p.id));
        const newProducts = parsedProducts.filter((p: Product) => !existingIds.has(p.id));
        return [...initialProducts, ...newProducts];
      }
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
    }
    return initialProducts;
  });

  // Save products to localStorage whenever products change
  useEffect(() => {
    try {
      // Only save the products that are not in the initial products list
      const existingIds = new Set(initialProducts.map(p => p.id));
      const newProducts = products.filter(p => !existingIds.has(p.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
    }
  }, [products]);

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? updatedProduct : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  return (
    <ProductsContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct
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
