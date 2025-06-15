
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
      console.log('[WishlistContext] LocalStorage loaded:', savedWishlist);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setItems(parsedWishlist);
          console.log('[WishlistContext] Wishlist loaded from localStorage:', parsedWishlist);
        } else {
          localStorage.removeItem('wishlist');
          console.warn('[WishlistContext] wishlist format is invalid, clearing localStorage key.');
        }
      }
    } catch (err) {
      localStorage.removeItem('wishlist');
      console.error('[WishlistContext] Error parsing wishlist from localStorage, cleared key. Error:', err);
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
      console.log('[WishlistContext] Wishlist saved to localStorage:', items);
    } catch (err) {
      console.error('[WishlistContext] Failed to save wishlist to localStorage:', err);
    }
  }, [items]);

  const addToWishlist = async (item: WishlistItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) {
        console.log('[WishlistContext] Item already in wishlist, no action:', item.id);
        return prev;
      }
      console.log('[WishlistContext] Adding to wishlist:', item);
      return [...prev, item];
    });
  };

  const removeFromWishlist = async (id: string) => {
    setItems(prev => {
      console.log('[WishlistContext] Removing from wishlist:', id);
      return prev.filter(item => item.id !== id);
    });
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  };

  const refetch = async () => {
    setLoading(true);
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      console.log('[WishlistContext] Refetching from localStorage:', savedWishlist);
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
    } catch (err) {
      setItems([]);
      console.error('[WishlistContext] Refetch error:', err);
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

// ... done! The only changes are added console.log for debugging.
