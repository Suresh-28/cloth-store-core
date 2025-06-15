
import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  discount?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  refetch: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isInitialLoad = useRef(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setItems(parsedWishlist);
        } else {
          localStorage.removeItem('wishlist');
        }
      }
    } catch {
      localStorage.removeItem('wishlist');
    } finally {
      isInitialLoad.current = false;
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever items change (but not on initial load)
  useEffect(() => {
    if (isInitialLoad.current) return;
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
    } catch {
      // fail silently
    }
  }, [items]);

  const addToWishlist = async (item: WishlistItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  };

  const refetch = async () => {
    setLoading(true);
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setItems(parsedWishlist);
        } else {
          localStorage.removeItem('wishlist');
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refetch
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
