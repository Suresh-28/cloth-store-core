
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
    name: 'Premium Cotton T-Shirt',
    price: 29,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 156,
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#ffffff' },
      { name: 'Navy', value: '#1e3a8a' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Crafted from 100% organic cotton, this premium t-shirt offers unmatched comfort and durability. Perfect for everyday wear with a classic fit.',
    features: [
      '100% organic cotton',
      'Pre-shrunk fabric',
      'Reinforced collar',
      'Machine washable'
    ],
    category: 'all'
  },
  {
    id: '2',
    name: 'Casual Denim Jacket',
    price: 89,
    discount: 15,
    originalPrice: 105,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop'
    ],
    rating: 4.5,
    reviewCount: 89,
    colors: [
      { name: 'Light Blue', value: '#87ceeb' },
      { name: 'Dark Blue', value: '#191970' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Classic denim jacket with a modern twist. Features vintage-inspired detailing and a comfortable relaxed fit.',
    features: [
      'Premium denim fabric',
      'Vintage wash finish',
      'Button closure',
      'Multiple pockets'
    ],
    category: 'all'
  },
  {
    id: '3',
    name: 'Elegant Maxi Dress',
    price: 68,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop'
    ],
    rating: 4.7,
    reviewCount: 203,
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Navy', value: '#1e3a8a' },
      { name: 'Burgundy', value: '#800020' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Flowing maxi dress perfect for both casual and formal occasions. Features an elegant silhouette with comfortable stretch fabric.',
    features: [
      'Stretch fabric blend',
      'Adjustable waist tie',
      'Floor-length design',
      'Wrinkle resistant'
    ],
    category: 'women'
  },
  {
    id: '4',
    name: 'Classic Oxford Shirt',
    price: 55,
    discount: 10,
    originalPrice: 61,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&h=500&fit=crop'
    ],
    rating: 4.6,
    reviewCount: 127,
    colors: [
      { name: 'White', value: '#ffffff' },
      { name: 'Light Blue', value: '#add8e6' },
      { name: 'Pink', value: '#ffc0cb' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Timeless Oxford shirt crafted from premium cotton. Perfect for business casual or smart casual occasions.',
    features: [
      'Premium Oxford cotton',
      'Button-down collar',
      'Classic fit',
      'Easy care fabric'
    ],
    category: 'men'
  },
  {
    id: '5',
    name: 'Cozy Knit Sweater',
    price: 78,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1564557287817-3785e38ec2fe?w=500&h=500&fit=crop'
    ],
    rating: 4.9,
    reviewCount: 94,
    colors: [
      { name: 'Cream', value: '#f5f5dc' },
      { name: 'Gray', value: '#808080' },
      { name: 'Camel', value: '#c19a6b' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Ultra-soft knit sweater perfect for cooler weather. Features a relaxed fit and luxurious feel.',
    features: [
      'Soft wool blend',
      'Relaxed fit',
      'Ribbed cuffs and hem',
      'Hand wash recommended'
    ],
    isNew: true,
    category: 'women'
  },
  {
    id: '6',
    name: 'Athletic Performance Hoodie',
    price: 65,
    originalPrice: 85,
    discount: 24,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1574951450389-1efb9a3a9f25?w=500&h=500&fit=crop'
    ],
    rating: 4.4,
    reviewCount: 178,
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Gray', value: '#808080' },
      { name: 'Navy', value: '#1e3a8a' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'High-performance hoodie designed for active lifestyles. Features moisture-wicking technology and comfortable fit.',
    features: [
      'Moisture-wicking fabric',
      'Kangaroo pocket',
      'Adjustable hood',
      'Athletic fit'
    ],
    category: 'all'
  }
];
