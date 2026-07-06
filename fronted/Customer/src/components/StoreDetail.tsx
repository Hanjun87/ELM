import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, ChevronLeft, Loader2 } from 'lucide-react';
import { productAPI, merchantAPI } from '../api';
import { toast } from '@shared';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  original_price?: string;
  sales_count: number;
  rating: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StoreDetail({ 
  storeId, 
  onBack, 
  onCheckout,
  onCartUpdate 
}: { 
  storeId: string; 
  onBack: () => void; 
  onCheckout: () => void;
  onCartUpdate?: (count: number) => void;
}) {
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [storeId]);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    onCartUpdate?.(total);
  }, [cart]);

  const loadData = async () => {
    try {
      const [merchantRes, productsRes]: any[] = await Promise.all([
        merchantAPI.detail(Number(storeId)),
        productAPI.list(Number(storeId))
      ]);
      
      if (merchantRes.code === 0) setMerchant(merchantRes.data);
      if (productsRes.code === 0) setProducts(productsRes.data.items);
    } catch (error) {
      toast('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.product.id !== productId);
    });
  };

  const getItemCount = (productId: number) => {
    return cart.find(item => item.product.id === productId)?.quantity || 0;
  };

  const totalAmount = cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0085FF]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24">
      <div className="relative">
        <img src={merchant?.logo} alt={merchant?.store_name} className="w-full h-48 object-cover" />
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
          <ChevronLeft className="text-white" size={24} />
        </button>
      </div>

      <div className="bg-white p-4">
        <h1 className="text-xl font-bold">{merchant?.store_name}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>⭐ {merchant?.rating}</span>
          <span>月售{merchant?.monthly_sales}</span>
          <span>起送¥{merchant?.min_order}</span>
        </div>
      </div>

      <div className="mt-2 bg-white p-4">
        <h2 className="font-bold mb-3">商品列表</h2>
        <div className="space-y-3">
          {products.map(product => {
            const count = getItemCount(product.id);
            return (
              <div key={product.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[#FF5000] font-bold">¥{product.price}</span>
                      {product.original_price && (
                        <span className="text-xs text-gray-400 line-through ml-2">¥{product.original_price}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {count > 0 && (
                        <>
                          <button onClick={() => removeFromCart(product.id)} className="w-6 h-6 rounded-full bg-[#0085FF] text-white flex items-center justify-center text-lg">-</button>
                          <span className="w-6 text-center">{count}</span>
                        </>
                      )}
                      <button onClick={() => addToCart(product)} className="w-6 h-6 rounded-full bg-[#0085FF] text-white flex items-center justify-center text-lg">+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-lg font-bold">¥{totalAmount.toFixed(2)}</div>
            <div className="text-xs text-gray-500">{totalItems}件商品</div>
          </div>
          <button onClick={onCheckout} className="px-8 py-3 bg-[#0085FF] text-white rounded-full font-bold">去结算</button>
        </div>
      )}
    </div>
  );
}
