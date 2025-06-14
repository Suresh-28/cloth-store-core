
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviewCount: number;
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
  rating,
  reviewCount,
  colors = [],
  isNew = false
}: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist({ id, name, price, image, originalPrice, discount });
    }
  };

  return (
    <div className="group relative">
      <Link to={`/products/${id}`}>
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
          {discount && (
            <div className="absolute top-3 left-3 bg-black text-white text-sm px-2 py-1 rounded-full z-10">
              -{discount}%
            </div>
          )}
          {isNew && (
            <div className="absolute top-3 left-3 bg-gray-600 text-white text-sm px-2 py-1 rounded-full z-10">
              New
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white"
            onClick={handleWishlistClick}
          >
            <Heart 
              size={18} 
              className={cn(
                "transition-colors",
                inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </Button>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full",
                  i < Math.floor(rating) ? "bg-black" : "bg-gray-300"
                )}
              />
            ))}
            <span className="text-sm text-gray-600">({reviewCount})</span>
          </div>
          
          <h3 className="font-medium text-gray-900">{name}</h3>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">£{price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">£{originalPrice}</span>
            )}
          </div>
          
          {colors.length > 0 && (
            <div className="flex space-x-2">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
