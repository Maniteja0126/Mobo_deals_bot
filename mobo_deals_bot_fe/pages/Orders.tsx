import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// import { ordersAPI } from '../services/mockBackend';
import { ordersAPI } from '@/services/apiBackend';
import { Order } from '../types';
import { Loader2, Package, Calendar, CreditCard, ArrowLeft, Clock } from 'lucide-react';

interface OrdersProps {
  onBack: () => void;
}

export const Orders: React.FC<OrdersProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      // Simulate creating a random order if none exist for demo
      let data = await ordersAPI.getUserOrders(user.id);
      if (data.length === 0) {
          // Auto-generate a mock order for better UX in demo
          // await ordersAPI.create(user.id, [{ productId: 'd1', quantity: 1 }]);
          await ordersAPI.create(user.id , [{ productId: 'd1', quantity: 1 }])
          data = await ordersAPI.getUserOrders(user.id);
      }
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-none bg-white px-6 pt-10 pb-4 flex items-center justify-between z-20 sticky top-0 border-b border-gray-100 shadow-sm">
        <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
        >
            <ArrowLeft size={20} />
        </button>

        <h3 className="font-bold text-lg text-gray-900 tracking-tight">Order History</h3>

        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-lime-500" size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <Package size={32} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900">No orders yet</h3>
            <p className="text-sm text-gray-500 mt-1">Start shopping to see your history!</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-black text-white p-1.5 rounded-lg">
                        <Package size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Order ID</p>
                        <p className="text-xs font-bold font-mono text-gray-900">#{order.id.slice(-6)}</p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-indigo-50 text-indigo-700'
                  }`}>
                    {order.status}
                </span>
              </div>

              <div className="p-4">
                 <div className="space-y-4">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="h-full w-full object-cover object-center mix-blend-multiply"
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                                <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-medium text-gray-500">Qty {item.quantity}</span>
                                    <span className="text-[10px] font-bold text-lime-600">₹{item.priceAtPurchase}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-medium">Total Amount</span>
                      <span className="text-sm font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                        {order.paymentStatus}
                     </span>
                  </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};