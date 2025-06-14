
import { useState } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = products.filter(product =>
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-light text-gray-900">All products</h1>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`font-medium ${
                  selectedCategory === 'all' ? 'text-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All products
              </button>
              <button
                onClick={() => setSelectedCategory('men')}
                className={`font-medium ${
                  selectedCategory === 'men' ? 'text-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Men
              </button>
              <button
                onClick={() => setSelectedCategory('women')}
                className={`font-medium ${
                  selectedCategory === 'women' ? 'text-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Women
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Category Filter */}
        <div className="md:hidden mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All products</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              image={product.image}
              rating={product.rating}
              reviewCount={product.reviewCount}
              colors={product.colors.map(c => c.value)}
              isNew={product.isNew}
            />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
