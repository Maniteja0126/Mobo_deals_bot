import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  
  // Helper to extract the first line or a short summary from the complex description
  const getSummary = (desc: string) => {
    const lines = desc.split('\n');
    return lines[0] || product.title;
  };

  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] snap-start border border-gray-100 flex flex-col gap-3 relative overflow-hidden group">
      
      {/* Platform Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-black/5 backdrop-blur-md border border-white/50 text-black text-[10px] font-bold px-2 py-1 rounded-lg">
            {product.platform || 'Deal'}
        </span>
      </div>

      <div className="flex gap-4">
        <div className="relative h-24 w-24 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
                {product.title}
            </h3>
            <div className="flex items-center gap-1 mb-1">
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-gray-500">{product.rating}</span>
            </div>
            <span className="text-xs font-bold text-lime-600">
                PP ~ ₹{product.price}
            </span>
        </div>
      </div>
      
      {/* Deal Description Text Area - Simulating Telegram Message */}
      <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-600 font-mono whitespace-pre-wrap h-24 overflow-y-auto leading-relaxed border border-gray-100 scrollbar-hide">
        {product.description}
      </div>

      <button 
        onClick={() => alert(`Redirecting to ${product.platform}... (Simulated)`)}
        className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl text-xs font-bold hover:bg-lime-400 hover:text-black transition-all active:scale-95 shadow-lg shadow-black/10"
      >
        <ExternalLink size={14} />
        GET LINK / DM
      </button>
    </div>
  );
};