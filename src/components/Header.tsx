import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, Heart, ShoppingBag, X, Package, UserCircle, Settings, LogOut, ClipboardList, Receipt } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const handleUserAction = (action: string) => {
    setIsUserMenuOpen(false);
    // Handle different user actions
    switch (action) {
      case 'orders':
        console.log('Orders clicked');
        navigate('/orders');
        break;
      case 'admin-orders':
        console.log('Admin Orders clicked');
        navigate('/admin/orders');
        break;
      case 'user-orders':
        console.log('User Orders clicked');
        navigate('/admin/orders');
        break;
      case 'profile':
        console.log('Profile clicked');
        // Navigate to profile page
        break;
      case 'settings':
        console.log('Settings clicked');
        // Navigate to settings page
        break;
      case 'logout':
        console.log('Logout clicked');
        // Handle logout
        break;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-medium text-gray-900">Loom & Co.</span>
          </Link>

          {/* Desktop Navigation - removed Shop link */}
          <nav className="hidden md:flex items-center space-x-8">
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User size={20} />
              </Button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleUserAction('orders')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Receipt size={16} className="mr-2" />
                      Orders
                    </button>
                    <button
                      onClick={() => handleUserAction('admin-orders')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <ClipboardList size={16} className="mr-2" />
                      Admin Orders
                    </button>
                    <button
                      onClick={() => handleUserAction('user-orders')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Package size={16} className="mr-2" />
                      User Orders
                    </button>
                    <button
                      onClick={() => handleUserAction('profile')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <UserCircle size={16} className="mr-2" />
                      Profile
                    </button>
                    <button
                      onClick={() => handleUserAction('settings')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </button>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => handleUserAction('logout')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="relative">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation - removed Shop link */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
            </nav>
          </div>
        )}
      </div>
      
      {/* Overlay to close user menu when clicking outside */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
