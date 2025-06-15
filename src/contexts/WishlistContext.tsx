
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
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isInitialLoad = useRef(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Validate that it's an array and not corrupted
        if (Array.isArray(parsedWishlist)) {
          setItems(parsedWishlist);
        } else {
          console.warn('Invalid wishlist data in localStorage, clearing it');
          localStorage.removeItem('wishlist');
        }
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('wishlist');
    } finally {
      isInitialLoad.current = false;
    }
  }, []);

  // Save to localStorage whenever items change (but not on initial load)
  useEffect(() => {
    // Skip saving during initial load
    if (isInitialLoad.current) return;
    
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
      
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, using memory-only storage');
        // Don't try to save to localStorage anymore, just keep in memory
        // The wishlist will work during the session but won't persist
      }
    }
  }, [items]);

  const addToWishlist = async (item: WishlistItem) => {
    setItems(prev => [...prev.filter(i => i.id !== item.id), item]);
  };

  const removeFromWishlist = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist
    }}>
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
