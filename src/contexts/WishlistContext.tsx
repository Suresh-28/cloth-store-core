
import React, { createContext, useContext, ReactNode } from "react";
import { useSupabaseWishlist } from "@/hooks/useSupabaseWishlist";

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
  addToWishlist: (id: string) => Promise<void>;
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
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
