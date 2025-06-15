
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
  // Defensive: log on every render to help debug
  if (typeof window !== "undefined") {
    // Only log client-side to avoid SSR noise
    console.log(
      "[WishlistProvider] rendered (children present: " + !!children + ")"
    );
  }
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
    // More helpful diagnostics
    if (typeof window !== "undefined") {
      console.error(
        "useWishlist must be used within a WishlistProvider. " +
        "This means a call to useWishlist() happened outside of a WishlistProvider context. " +
        "Double-check your app structure in App.tsx and surrounding files. " +
        "If you see this after a HMR refresh, try a hard reload."
      );
      // Trace which component is calling useWishlist (Error stack)
      console.trace();
    }
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
