import React, { useState, useEffect } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { Header, toast } from '@shared';
import axios from 'axios';

interface Coupon {
  id: number;
  name: string;
  discount_amount: string;
  min_spend: string;
  valid_until: string;
  status: string;
}

export default function CouponsPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'unused' | 'used'>('unused');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, [activeTab]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://localhost:8000/api/v1/user/coupons/?status=${activeTab}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.code === 0) {
        setCoupons(response.data.data.items.map((item: any) => ({
          id: item.id,
          name: item.coupon.name,
          discount_amount: item.coupon.discount_amount,
          min_spend: item.coupon.min_spend,
          valid_until: item.coupon.valid_until,
          status: item.status
        })));
      }
    } catch (error) {
      toast('加载优惠券失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen pt-14 bg-[#F5F5F5]">
      <Header title="优惠券" onBack={onBack} />

      <div className="bg-white border-b sticky top-14 z-10">
        <div className="flex">
          {['未使用', '已使用'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx === 0 ? 'unused' : 'used')}
              className={`flex-1 py-3 text-[15px] font-medium ${
                activeTab === (idx === 0 ? 'unused' : 'used')
                  ? 'text-[#0085FF] border-b-2 border-[#0085FF]'
                  : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#0085FF]" size={32} />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Ticket size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-400">暂无优惠券</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className={`bg-white rounded-2xl p-4 shadow-sm ${coupon.status === 'used' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#FF5000]">¥{coupon.discount_amount}</h3>
                  <p className="text-sm text-gray-600 mt-1">{coupon.name}</p>
                  <p className="text-xs text-gray-400 mt-1">满¥{coupon.min_spend}可用</p>
                  <p className="text-xs text-gray-400">有效期至 {new Date(coupon.valid_until).toLocaleDateString()}</p>
                </div>
                {coupon.status === 'unused' && (
                  <button className="px-6 py-2 bg-[#0085FF] text-white rounded-full text-sm font-bold">
                    立即使用
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
