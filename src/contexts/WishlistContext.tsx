
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
  // Defensive fallback for production: never crash the UI, offer a user-reload instead
  if (!context) {
    if (typeof window !== "undefined") {
      console.error(
        "[WishlistContext] useWishlist() called outside provider. " +
        "Try refreshing the page. If it persists, check <WishlistProvider> wraps your App in src/App.tsx."
      );
      // Only throw error if not hot reload, fallback to empty context so UI can still render
      if (import.meta.env.DEV) {
        // In dev, force a crash for easier debugging
        throw new Error(
          "useWishlist must be used within a WishlistProvider.\n" +
          "If this happened after a hot reload, try a hard refresh of your browser.\n" +
          "If this persists after full reload, check that <WishlistProvider> is present in src/App.tsx."
        );
      }
      // In production, don't crash the whole app
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
    // On server, just crash (shouldn't happen)
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
