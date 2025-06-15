
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
      
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data and retrying');
        
        // Try to clear some space by removing the wishlist and trying again
        localStorage.removeItem('wishlist');
        
        try {
          // Try to save a smaller subset if there are many items
          const itemsToSave = items.slice(0, 50); // Limit to 50 items max
          localStorage.setItem('wishlist', JSON.stringify(itemsToSave));
          
          // Update state to match what was actually saved
          if (itemsToSave.length < items.length) {
            setItems(itemsToSave);
            console.warn('Wishlist was truncated to fit in localStorage');
          }
        } catch (retryError) {
          console.error('Failed to save even truncated wishlist:', retryError);
          // If all else fails, clear the wishlist
          setItems([]);
        }
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
