import React from 'react';
import { LogOut, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="flex-none bg-white border-b border-slate-200 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <Package size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">ShopGenie AI</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Status (Visual Only for this demo, or could open a modal) */}
          <div className="flex items-center gap-1 text-slate-600">
            <div className="relative">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
          </div>

          {/* User Auth */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
                {user.name}
              </span>
              <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};