import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import SizeGuide from '@/components/SizeGuide';
import ShippingInfo from '@/components/ShippingInfo';
import Contact from '@/components/Contact';
import { useProducts } from '@/contexts/ProductsContext';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const cleanImage = (image: string) => {
  if (!image || image.startsWith("data:")) return "";
  return image;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">Product not found</p>
          <div className="text-center mt-4">
            <Link to="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (!selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: cleanImage(product.image),
        size: selectedSize,
        color: selectedColor
      });
      toast({ title: "Added to cart!" });
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes("quota")) {
        toast({
          title: "Cart storage full",
          description: "Your cart couldn't be saved because your browser storage is full.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to add to cart",
          variant: "destructive"
        });
      }
      console.error('[ProductDetail] Failed to add to cart:', error);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        toast({ title: "Removed from wishlist" });
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: cleanImage(product.image),
          originalPrice: product.originalPrice,
          discount: product.discount
        });
        toast({ title: "Added to wishlist!" });
      }
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes("quota")) {
        toast({
          title: "Wishlist storage full",
          description: "Your wishlist couldn't be saved because your browser storage is full.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to update wishlist",
          variant: "destructive"
        });
      }
      console.error('[ProductDetail] Failed to update wishlist:', error);
    }
  };

  const accordionItems = [
    { id: 'description', title: 'Description', content: product.description },
    { id: 'features', title: 'Features', content: product.features.join(', ') },
    { id: 'guarantees', title: 'Guarantees', content: 'Quality guarantee on all products.' },
    { id: 'reviews', title: 'Reviews', content: `${product.reviewCount} customer reviews. Average rating: ${product.rating}/5` }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "w-20 h-20 rounded-lg overflow-hidden border-2",
                      selectedImageIndex === index ? "border-black" : "border-gray-200"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.isNew && (
              <div className="inline-block bg-gray-600 text-white text-sm px-3 py-1 rounded-full">
                New
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-medium">£{product.originalPrice || product.price}</span>
                  {product.discount && (
                    <span className="text-xl text-green-600 font-medium">£{product.price}</span>
                  )}
                </div>
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Size guide
                </button>
              </div>
              
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full",
                      i < Math.floor(product.rating) ? "bg-black" : "bg-gray-300"
                    )}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">({product.reviewCount})</span>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Color</span>
                <span className="text-sm text-gray-600">
                  {selectedColor || 'Select a color'}
                </span>
              </div>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      selectedColor === color.name ? "border-black" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <span className="font-medium block mb-3">Size</span>
              <div className="flex space-x-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-4 py-2 border rounded-md font-medium",
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <span className="font-medium block mb-3">Quantity</span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity.toString().padStart(2, '0')}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-gray-800 text-white py-3"
                size="lg"
              >
                Add to Bag
              </Button>
              
              <Button
                onClick={handleWishlistToggle}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                size="lg"
              >
                <Heart 
                  size={18} 
                  className={cn(
                    "transition-colors",
                    inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
                  )}
                />
                <span>{inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </Button>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-4 pt-8">
              {accordionItems.map((item) => (
                <div key={item.id} className="border-b border-gray-200">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="font-medium">{item.title}</span>
                    <ChevronDown 
                      size={20}
                      className={cn(
                        "transition-transform",
                        activeAccordion === item.id ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {activeAccordion === item.id && (
                    <div className="pb-4 text-gray-600">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SizeGuide isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
      <ShippingInfo isOpen={showShippingInfo} onClose={() => setShowShippingInfo(false)} />
      <Contact isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
};

export default ProductDetail;

// Note: This file is getting quite long (over 300 lines). It's a good idea to consider refactoring it into smaller files/components after this!
