
// Removed all hardcoded products; now only exports the Product interface.

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  colors: { name: string; value: string }[];
  sizes: string[];
  description: string;
  features: string[];
  isNew?: boolean;
  category: 'men' | 'women' | 'all';
}

// No products exported by default; all products must come from Supabase.
