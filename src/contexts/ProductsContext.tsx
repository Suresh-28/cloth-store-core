
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, products as initialProducts } from '@/data/products';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = 'loom_new_products';

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    // Load any newly added products from localStorage
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY);
      if (savedProducts) {
        const newProducts = JSON.parse(savedProducts);
        console.log('ProductsProvider - Loaded new products from localStorage:', newProducts.length);
        return [...initialProducts, ...newProducts];
      }
    } catch (error) {
      console.error('ProductsProvider - Failed to load from localStorage:', error);
    }
    
    return initialProducts;
  });

  // Save only newly added products to localStorage
  const saveNewProducts = (allProducts: Product[]) => {
    try {
      const initialIds = new Set(initialProducts.map(p => p.id));
      const newProducts = allProducts.filter(p => !initialIds.has(p.id));
      
      if (newProducts.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        console.log('ProductsProvider - Saved new products to localStorage:', newProducts.length);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('ProductsProvider - Failed to save to localStorage:', error);
    }
  };

  const addProduct = (product: Product) => {
    console.log('ProductsProvider - Adding product:', product.name);
    setProducts(prev => {
      const newProducts = [product, ...prev];
      console.log('ProductsProvider - Total products after add:', newProducts.length);
      saveNewProducts(newProducts);
      return newProducts;
    });
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    console.log('ProductsProvider - Updating product:', id);
    setProducts(prev => {
      const updated = prev.map(product => 
        product.id === id ? updatedProduct : product
      );
      saveNewProducts(updated);
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    console.log('ProductsProvider - Deleting product:', id);
    setProducts(prev => {
      const filtered = prev.filter(product => product.id !== id);
      saveNewProducts(filtered);
      return filtered;
    });
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
