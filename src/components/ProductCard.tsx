
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  isNew?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  discount,
  image,
  rating = 4.5,
  reviewCount = 0,
  colors = [],
  isNew = false,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(id);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        id,
        name,
        price,
        image,
        size: 'M', // Default size
        color: colors[0] || 'Default'
      });
      
      toast({
        title: "Added to cart!",
        description: `${name} has been added to your cart.`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
        toast({
          title: "Removed from wishlist",
          description: `${name} has been removed from your wishlist.`
        });
      } else {
        await addToWishlist({
          id,
          name,
          price,
          image,
          originalPrice,
          discount
        });
        toast({
          title: "Added to wishlist!",
          description: `${name} has been added to your wishlist.`
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {isNew && (
            <Badge className="bg-black text-white">New</Badge>
          )}
          {discount && (
            <Badge variant="destructive">{discount}% OFF</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
          onClick={handleWishlistToggle}
        >
          <Heart 
            size={16} 
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} 
          />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/products/${id}`}>
          <h3 className="font-medium text-gray-900 mb-2 hover:text-gray-600 transition-colors">
            {name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex space-x-1 mb-3">
            {colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-semibold text-gray-900">
            £{price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              £{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-black hover:bg-gray-800 text-white"
          size="sm"
        >
          <ShoppingBag size={16} className="mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
