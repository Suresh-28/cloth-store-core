
import React, { createContext, useContext, ReactNode } from "react";
import { useSupabaseWishlist, SupabaseWishlistItem } from "@/hooks/useSupabaseWishlist";

// WishlistItem matches what ProductCard etc expects. Now same as SupabaseWishlistItem.
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
  user: any;
  canUseWishlist: boolean;
  addToWishlist: (id: string, meta?: Partial<WishlistItem>) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  refetch: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const {
    items,
    loading,
    user,
    canUseWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch,
  } = useSupabaseWishlist();

  // Note: for guests, addToWishlist must receive meta information.
  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        user,
        canUseWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refetch,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    if (typeof window !== "undefined") {
      // Defensive: avoid crashing in prod, but crash in dev for easier debugging
      if (import.meta.env.DEV) {
        throw new Error(
          "useWishlist must be used within a WishlistProvider.\n" +
          "If this happened after a hot reload, try a hard refresh of your browser.\n" +
          "If this persists after full reload, check that <WishlistProvider> is present in src/App.tsx."
        );
      }
      // production fallback
      return {
        items: [],
        loading: false,
        user: null,
        canUseWishlist: false,
        addToWishlist: async () => {},
        removeFromWishlist: async () => {},
        isInWishlist: () => false,
        refetch: async () => {},
      };
    }
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
