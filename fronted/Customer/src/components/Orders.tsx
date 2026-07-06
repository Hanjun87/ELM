import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Order } from '../store';

export default function Orders({ orders, onViewProgress, onReview, onOrderAgain, onRefund }: {
  orders: Order[];
  onViewProgress?: () => void;
  onReview?: () => void;
  onOrderAgain?: (storeId: string) => void;
  onRefund?: () => void;
}) {
  const [activeTab, setActiveTab] = useState('全部');

  const filterOrders = (tab: string) => {
    if (tab === '全部') return orders;
    if (tab === '待付款') return orders.filter(o => o.status === 'pending');
    if (tab === '进行中') return orders.filter(o => ['confirmed', 'preparing', 'delivering'].includes(o.status));
    if (tab === '已完成') return orders.filter(o => o.status === 'completed');
    return orders;
  };

  const filtered = filterOrders(activeTab);

  return (
    <div className="w-full min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm">
        <span className="w-8" />
        <h1 className="font-bold text-[17px] text-[#0085FF]">订单</h1>
        <button className="text-gray-500 hover:text-[#0085FF] transition-colors w-8 flex items-center justify-center active:scale-95"><Search size={20} /></button>
      </header>

      <div className="sticky top-[52px] z-40 bg-white/95 backdrop-blur-md flex px-4 overflow-x-auto hide-scrollbar border-b border-gray-100 shadow-sm">
        {['全部', '待付款', '进行中', '已完成'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`py-3.5 px-4 text-[14px] font-bold whitespace-nowrap relative ${activeTab === tab ? 'text-[#0085FF]' : 'text-gray-500 hover:text-gray-800 transition-colors'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#0085FF] rounded-full"></div>}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 pt-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <Search size={48} className="mb-4 text-gray-200" />
            <p className="text-[15px] font-medium">暂无订单</p>
          </div>
        )}
        {filtered.map(order => {
          const isActive = order.status === 'delivering' || order.status === 'preparing';
          const isDone = order.status === 'completed';
          const statusLabel = order.status === 'delivering' ? '配送中' : order.status === 'completed' ? '已完成' : order.status === 'preparing' ? '备餐中' : '待付款';
          const statusColor = isActive ? 'text-[#0085FF]' : isDone ? 'text-gray-500' : 'text-[#FF5000]';

          return (
            <div key={order.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  {order.storeImage ? <img src={order.storeImage} alt="" className="w-8 h-8 rounded-full bg-gray-50 overflow-hidden border border-gray-200 shrink-0 object-cover" /> : <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />}
                  <span className="font-bold text-[15px] text-gray-900">{order.storeName}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
                <span className={`text-[13px] font-bold ${statusColor}`}>{statusLabel}</span>
              </div>
              <div className="py-3.5 flex gap-3.5">
                <div className="flex-1 flex flex-col justify-center py-0.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[14px] font-bold text-gray-900 line-clamp-1 leading-snug">{order.items.map(i => i.name).join('、')} 等{order.items.length}件</span>
                    <span className="font-bold text-[16px] text-gray-900 ml-3 tracking-tight">&#165;{order.total.toFixed(1)}</span>
                  </div>
                  <span className="text-[12px] text-gray-500 mt-1.5 font-medium">{isActive ? `预计 ${order.time} 送达` : order.time}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                {isActive && (
                  <>
                    <button className="px-4 py-1.5 rounded-full border border-gray-300 text-[13px] text-gray-600 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors">催单</button>
                    <button onClick={onViewProgress} className="px-4 py-1.5 rounded-full border border-[#0085FF] text-[13px] text-[#0085FF] font-bold bg-blue-50/50 hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-sm">查看进度</button>
                  </>
                )}
                {isDone && (
                  <>
                    <button onClick={onReview} className="px-4 py-1.5 rounded-full border border-gray-300 text-[13px] text-gray-600 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors">评价</button>
                    <button onClick={() => onOrderAgain?.('mcdonalds')} className="px-4 py-1.5 rounded-full border border-[#0085FF] text-[13px] text-[#0085FF] font-bold hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-sm">再来一单</button>
                    <button onClick={onRefund} className="px-4 py-1.5 rounded-full border border-red-200 text-[13px] text-red-500 font-medium hover:bg-red-50 active:bg-red-100 transition-colors">申请退款</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
