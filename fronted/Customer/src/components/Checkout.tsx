import React, { useState } from 'react';
import { Header, toast } from '@shared';
import { orderAPI } from '../api';
import { Loader2 } from 'lucide-react';

export default function Checkout({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response: any = await orderAPI.create({
        merchant_id: 1,
        items: [{ name: '测试商品', price: 28, quantity: 1 }],
        address_snapshot: { name: '测试', phone: '138****', address: '测试地址' }
      });
      
      if (response.code === 0) {
        toast('订单创建成功');
        setTimeout(() => onBack(), 1000);
      }
    } catch (error) {
      toast('创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen pt-14 bg-[#F5F5F5]">
      <Header title="确认订单" onBack={onBack} />
      
      <div className="p-4">
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold mb-4">订单信息</h3>
          <p className="text-gray-600">请在商家详情页添加商品后结算</p>
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t p-4">
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 bg-[#0085FF] text-white rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            提交订单
          </button>
        </div>
      </div>
    </div>
  );
}
