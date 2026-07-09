import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Header, toast } from '@shared';
import { orderAPI } from '../api';

export default function Orders({ 
  onViewProgress, 
  onReview 
}: { 
  onViewProgress?: () => void; 
  onReview?: () => void;
}) {
  const [activeTab, setActiveTab] = useState('全部');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const statusMap: any = {
        '全部': undefined,
        '待付款': 'pending',
        '进行中': 'paid,accepted,preparing,picked',
        '已完成': 'delivered,finished'
      };
      const response: any = await orderAPI.list(statusMap[activeTab]);
      if (response.code === 0) {
        setOrders(response.data.items);
      }
    } catch (error) {
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const statusText: any = {
    pending: '待支付',
    paid: '待接单',
    accepted: '已接单',
    preparing: '准备中',
    ready: '待取餐',
    picked: '配送中',
    delivered: '已送达',
    finished: '已完成',
    cancelled: '已取消'
  };

  return (
    <div className="w-full min-h-screen pt-14 bg-[#F5F5F5]">
      <Header title="订单" rightAction={<button className="text-gray-400"><Search size={20} /></button>} />

      <div className="bg-white border-b sticky top-14 z-10">
        <div className="flex">
          {['全部', '待付款', '进行中', '已完成'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[15px] font-medium transition-colors ${
                activeTab === tab
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
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无订单</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={order.merchant_logo} alt={order.merchant_name} className="w-8 h-8 rounded-full" />
                  <span className="font-bold text-[15px]">{order.merchant_name}</span>
                </div>
                <span className="text-[#0085FF] text-[13px] font-medium">{statusText[order.status]}</span>
              </div>

              <div className="space-y-2 mb-3">
                {order.items_snapshot?.slice(0, 2).map((item: any, idx: number) => (
                  <div key={idx} className="text-sm text-gray-600">
                    {item.name} x{item.quantity}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  共 {order.items_snapshot?.length || 0} 件 
                  <span className="ml-3 text-[16px] text-gray-900 font-bold">¥{order.paid_amount}</span>
                </span>
                <div className="flex gap-2">
                  {['paid', 'accepted', 'preparing', 'picked'].includes(order.status) && (
                    <button onClick={onViewProgress} className="px-4 py-1.5 rounded-full border border-[#0085FF] text-[13px] text-[#0085FF] font-bold">
                      查看进度
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button onClick={onReview} className="px-4 py-1.5 rounded-full border border-gray-300 text-[13px] text-gray-600 font-medium">
                      评价
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
