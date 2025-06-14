
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

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Black Sleeveless',
    price: 75,
    image: '/lovable-uploads/cc61d2ac-eaa6-4cb2-bd0a-b4a196226349.png',
    images: [
      '/lovable-uploads/cc61d2ac-eaa6-4cb2-bd0a-b4a196226349.png',
      '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png'
    ],
    rating: 5,
    reviewCount: 222,
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#ffffff' },
      { name: 'Navy', value: '#1e3a8a' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'A timeless sleeveless design crafted from premium cotton blend. Perfect for layering or wearing on its own.',
    features: [
      '100% organic cotton',
      'Pre-shrunk fabric',
      'Comfortable fit',
      'Machine washable'
    ],
    category: 'all'
  },
  {
    id: '2',
    name: 'Classic White T-shirt',
    price: 75,
    discount: 20,
    originalPrice: 94,
    image: '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png',
    images: [
      '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png',
      '/lovable-uploads/cc61d2ac-eaa6-4cb2-bd0a-b4a196226349.png'
    ],
    rating: 4,
    reviewCount: 120,
    colors: [
      { name: 'White', value: '#ffffff' },
      { name: 'Black', value: '#000000' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Essential white t-shirt made from sustainable materials. A wardrobe staple that never goes out of style.',
    features: [
      'Sustainable cotton',
      'Relaxed fit',
      'Reinforced seams',
      'Fade resistant'
    ],
    category: 'men'
  },
  {
    id: '3',
    name: 'Half Sleeve T-shirts',
    price: 55,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
    ],
    rating: 4,
    reviewCount: 120,
    colors: [
      { name: 'Red', value: '#dc2626' },
      { name: 'Blue', value: '#2563eb' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Comfortable half sleeve t-shirts perfect for casual wear. Available in multiple colors.',
    features: [
      'Soft cotton blend',
      'Regular fit',
      'Breathable fabric',
      'Easy care'
    ],
    category: 'all'
  },
  {
    id: '4',
    name: 'Modern T-shirts',
    price: 117,
    discount: 20,
    originalPrice: 146,
    image: '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png',
    images: [
      '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png'
    ],
    rating: 4,
    reviewCount: 120,
    colors: [
      { name: 'White', value: '#ffffff' },
      { name: 'Gray', value: '#6b7280' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Modern cut t-shirts with contemporary styling. Perfect for the fashion-forward individual.',
    features: [
      'Modern fit',
      'Premium cotton',
      'Stylish design',
      'Durable construction'
    ],
    category: 'men'
  },
  {
    id: '08e4ff4c-682a-4148-afbf-a515d01c7ca5',
    name: 'Minimal Fashion T-shirt',
    price: 140,
    originalPrice: 210,
    discount: 20,
    image: '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png',
    images: [
      '/lovable-uploads/2d362445-d030-436f-bcfa-2c06638a9d27.png',
      '/lovable-uploads/cc61d2ac-eaa6-4cb2-bd0a-b4a196226349.png'
    ],
    rating: 5,
    reviewCount: 89,
    colors: [
      { name: 'White', value: '#ffffff' },
      { name: 'Saddle Brown', value: '#8b4513' },
      { name: 'Pink', value: '#ec4899' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'A minimal fashion t-shirt designed for the modern lifestyle. Crafted with attention to detail and premium materials.',
    features: [
      'Premium organic cotton',
      'Minimal design aesthetic',
      'Comfortable regular fit',
      'Sustainable production'
    ],
    isNew: true,
    category: 'all'
  }
];
