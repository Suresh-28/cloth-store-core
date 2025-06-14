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

// Helper function to estimate storage size
const getStorageSize = (data: any): number => {
  return new Blob([JSON.stringify(data)]).size;
};

// Helper function to compress product data for storage
const compressProductForStorage = (product: Product): any => {
  return {
    ...product,
    // Keep only the first image to save space, and use placeholder for others
    images: product.images.length > 0 ? [product.images[0]] : [],
    image: product.images[0] || product.image
  };
};

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
        console.log('ProductsProvider - Loaded products from localStorage:', newProducts.length, 'new products');
        return [...initialProducts, ...newProducts];
      }
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear corrupted localStorage:', e);
      }
    }
    return initialProducts;
  });

  // Save products to localStorage whenever products change
  useEffect(() => {
    try {
      // Only save the products that are not in the initial products list
      const existingIds = new Set(initialProducts.map(p => p.id));
      const newProducts = products.filter(p => !existingIds.has(p.id));
      
      if (newProducts.length === 0) {
        // No new products to save
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Compress products to reduce storage size
      const compressedProducts = newProducts.map(compressProductForStorage);
      const dataToSave = JSON.stringify(compressedProducts);
      
      // Check if data size is reasonable (< 4MB to leave room for other data)
      const dataSize = getStorageSize(compressedProducts);
      if (dataSize > 4 * 1024 * 1024) {
        console.warn('Product data is too large for localStorage, saving only most recent products');
        // Keep only the 5 most recent products
        const recentProducts = compressedProducts.slice(0, 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentProducts));
      } else {
        localStorage.setItem(STORAGE_KEY, dataToSave);
      }
      
      console.log('ProductsProvider - Saved products to localStorage:', newProducts.length, 'products');
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
      
      // If quota exceeded, try to save with further compression
      if (error.name === 'QuotaExceededError') {
        try {
          const existingIds = new Set(initialProducts.map(p => p.id));
          const newProducts = products.filter(p => !existingIds.has(p.id));
          
          // Save only basic product info without images
          const minimalProducts = newProducts.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            discount: p.discount,
            category: p.category,
            sizes: p.sizes,
            colors: p.colors,
            features: p.features,
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            isNew: p.isNew,
            // Use placeholder images instead of uploaded ones
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
            images: [
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
              'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop'
            ]
          })).slice(0, 3); // Keep only 3 most recent products
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalProducts));
          console.log('ProductsProvider - Saved minimal product data due to quota limits');
        } catch (fallbackError) {
          console.error('Failed to save even minimal product data:', fallbackError);
          // Clear storage if even minimal save fails
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (clearError) {
            console.error('Failed to clear localStorage:', clearError);
          }
        }
      }
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
