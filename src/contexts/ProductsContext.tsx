
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, products as initialProducts } from '@/data/products';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

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
