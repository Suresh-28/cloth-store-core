
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: 'M', // Default size
      color: 'Default' // Default color
    });
    toast({ title: "Added to cart!" });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart size={48} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-light text-gray-900 mb-4">Your Wishlist</h1>
            <p className="text-gray-600 mb-8">Your wishlist is empty</p>
            <Link to="/products">
              <Button className="bg-black hover:bg-gray-800 text-white">
                Discover Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-gray-900">
            Wishlist ({items.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                {item.discount && (
                  <div className="absolute top-3 left-3 bg-black text-white text-sm px-2 py-1 rounded-full z-10">
                    -{item.discount}%
                  </div>
                )}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white p-2 rounded-full"
                >
                  <Heart size={18} className="fill-red-500 text-red-500" />
                </button>
                <Link to={`/products/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </div>
              
              <div className="space-y-3">
                <Link to={`/products/${item.id}`}>
                  <h3 className="font-medium text-gray-900 hover:text-gray-700">{item.name}</h3>
                </Link>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">£{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">£{item.originalPrice}</span>
                  )}
                </div>
                
                <Button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-black hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
