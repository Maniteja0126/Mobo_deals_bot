import React, { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { productsAPI } from '../services/mockBackend';
import { Product } from '../types';
import { Loader2 } from 'lucide-react';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await productsAPI.getAll();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Featured Deals</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Explore our top-rated products. Don't know what you want? 
          Ask <span className="text-indigo-600 font-semibold">ShopGenie</span> in the bottom right corner!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
