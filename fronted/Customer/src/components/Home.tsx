import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronRight, Loader2 } from 'lucide-react';
import { Header } from '@shared';
import { merchantAPI } from '../api';
import { toast } from '@shared';

interface Merchant {
  id: number;
  store_name: string;
  logo: string;
  rating: string;
  monthly_sales: number;
  min_order: string;
  delivery_fee: string;
  status: string;
}

export default function Home({ onStoreClick }: { onStoreClick: (id: string) => void }) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      const response: any = await merchantAPI.list();
      if (response.code === 0) {
        setMerchants(response.data.items);
      }
    } catch (error) {
      toast('加载商家失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen pt-14 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0085FF]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-14">
      <Header title="外卖" rightAction={<button className="text-gray-400"><Search size={20} /></button>} />

      <div className="p-4 bg-white shadow-sm">
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 rounded-full px-4 py-2 flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="搜索商家或商品" className="bg-transparent flex-1 outline-none text-sm" />
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <SlidersHorizontal size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h2 className="font-bold text-lg">附近商家</h2>
        {merchants.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无商家</div>
        ) : (
          merchants.map((merchant) => (
            <div
              key={merchant.id}
              onClick={() => onStoreClick(merchant.id.toString())}
              className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex gap-3">
                <img src={merchant.logo} alt={merchant.store_name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-base">{merchant.store_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-orange-500 text-sm">⭐ {merchant.rating}</span>
                    <span className="text-gray-400 text-sm">月售{merchant.monthly_sales}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">起送¥{merchant.min_order}</span>
                    <span className="text-xs text-gray-500">配送¥{merchant.delivery_fee}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
