
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, products as initialProducts } from '@/data/products';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = 'loom_products';

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    console.log('ProductsProvider - Initializing products');
    
    // Try to load products from localStorage on initialization
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY);
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        console.log('ProductsProvider - Loaded from localStorage:', parsedProducts.length, 'products');
        
        // Merge initial products with saved products, avoiding duplicates
        const existingIds = new Set(initialProducts.map(p => p.id));
        const newProducts = parsedProducts.filter((p: Product) => !existingIds.has(p.id));
        const allProducts = [...initialProducts, ...newProducts];
        
        console.log('ProductsProvider - Total products after merge:', allProducts.length);
        return allProducts;
      }
    } catch (error) {
      console.error('ProductsProvider - Failed to load from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    
    console.log('ProductsProvider - Using initial products only:', initialProducts.length);
    return initialProducts;
  });

  // Save products to localStorage whenever products change
  useEffect(() => {
    console.log('ProductsProvider - Products changed, saving to localStorage. Total products:', products.length);
    
    try {
      // Only save the products that are not in the initial products list
      const existingIds = new Set(initialProducts.map(p => p.id));
      const newProducts = products.filter(p => !existingIds.has(p.id));
      
      console.log('ProductsProvider - New products to save:', newProducts.length);
      
      if (newProducts.length === 0) {
        console.log('ProductsProvider - No new products to save, removing from localStorage');
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Simple save without compression first
      const dataToSave = JSON.stringify(newProducts);
      localStorage.setItem(STORAGE_KEY, dataToSave);
      
      console.log('ProductsProvider - Successfully saved products to localStorage');
    } catch (error) {
      console.error('ProductsProvider - Failed to save to localStorage:', error);
      
      // If quota exceeded, try with minimal data
      if (error.name === 'QuotaExceededError') {
        console.log('ProductsProvider - Quota exceeded, trying minimal save');
        try {
          const existingIds = new Set(initialProducts.map(p => p.id));
          const newProducts = products.filter(p => !existingIds.has(p.id));
          
          // Save only essential data
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
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop']
          })).slice(0, 5);
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalProducts));
          console.log('ProductsProvider - Saved minimal product data');
        } catch (fallbackError) {
          console.error('ProductsProvider - Failed to save even minimal data:', fallbackError);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [products]);

  const addProduct = (product: Product) => {
    console.log('ProductsProvider - Adding product:', product.name);
    setProducts(prev => {
      const newProducts = [product, ...prev];
      console.log('ProductsProvider - Total products after add:', newProducts.length);
      return newProducts;
    });
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    console.log('ProductsProvider - Updating product:', id);
    setProducts(prev => prev.map(product => 
      product.id === id ? updatedProduct : product
    ));
  };

  const deleteProduct = (id: string) => {
    console.log('ProductsProvider - Deleting product:', id);
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
