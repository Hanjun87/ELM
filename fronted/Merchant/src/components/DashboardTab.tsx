import { useState, useEffect, useCallback } from 'react';
import { Receipt, Star, Megaphone, PieChart, Loader2 } from 'lucide-react';
import { orderAPI } from '../api';
import { showModal, toast } from '@shared';
import { Order, itemsSummary, itemsQty } from '../types';

export default function DashboardTab({ onNav, openSubPage }: { onNav: (i: number) => void; openSubPage: (p: 'reviews' | 'campaigns') => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response: any = await orderAPI.list();
      if (response.code === 0) setOrders(response.data.items);
    } catch {
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = orders.filter(o => o.status === 'paid');
  const progress = orders.filter(o => ['accepted', 'preparing'].includes(o.status));

  const acceptOrder = async (id: number) => {
    try {
      const response: any = await orderAPI.accept(id);
      if (response.code === 0) { toast('已接单 #' + id); load(); }
      else toast(response.message || '接单失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '接单失败');
    }
  };

  const rejectOrder = (id: number) => {
    showModal('拒单确认', '确定要拒绝该订单吗？', <p className="text-[13px] text-gray-500">拒单后订单将被取消，商品库存会自动恢复。</p>, async () => {
      try {
        const response: any = await orderAPI.reject(id);
        if (response.code === 0) { toast('已拒单 #' + id); load(); }
        else toast(response.message || '拒单失败');
      } catch (e: any) {
        toast(e.response?.data?.message || '拒单失败');
      }
    });
  };

  const prepareOrder = async (id: number) => {
    try {
      const response: any = await orderAPI.prepare(id);
      if (response.code === 0) { toast('已确认出餐 #' + id); load(); }
      else toast(response.message || '操作失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '操作失败');
    }
  };

  const quickActions = [
    { icon: Receipt, label: '订单处理', color: 'bg-blue-50 text-[#0085FF]', action: () => onNav(1) },
    { icon: Star, label: '评价管理', color: 'bg-orange-50 text-[#FF5000]', action: () => openSubPage('reviews') },
    { icon: Megaphone, label: '营销活动', color: 'bg-green-50 text-[#00B578]', action: () => openSubPage('campaigns') },
    { icon: PieChart, label: '报表统计', color: 'bg-gray-100 text-gray-600', action: () => onNav(3) },
  ];

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map((a, i) => (
          <button key={i} onClick={a.action} className="bg-white rounded-[16px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-center gap-1.5 relative active:scale-95 transition-transform">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.color}`}><a.icon size={20} /></div>
            <span className="text-[11px] text-gray-700 font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-[15px] text-gray-900">实时订单 <span className="bg-[#0085FF] text-white text-[11px] px-2 py-0.5 rounded-full">{pending.length}</span></h2>
          <button onClick={() => onNav(1)} className="text-[13px] text-[#0085FF] font-medium">查看全部</button>
        </div>
        {loading && (
          <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>
        )}
        <div className="space-y-3">
          {[...pending, ...progress].slice(0, 3).map(o => (
            <div key={o.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[15px] text-gray-900">{o.order_no}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${o.status === 'paid' ? 'bg-red-50 text-[#FF5000]' : 'bg-green-50 text-[#00B578]'}`}>{o.status === 'paid' ? '待接单' : o.status === 'accepted' ? '待出餐' : '备餐中'}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">下单: {new Date(o.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
              <div className="flex-1 mb-3">
                <p className="text-[14px] font-medium text-gray-900">{itemsSummary(o.items_snapshot)}</p>
                {o.note && <p className="text-[11px] text-gray-500">备注: {o.note}</p>}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-gray-400">共 {itemsQty(o.items_snapshot)} 件</span>
                  <span className="font-bold text-[16px] text-gray-900">¥{o.paid_amount}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                {o.status === 'paid' && (
                  <>
                    <button onClick={() => rejectOrder(o.id)} className="px-4 py-2 rounded-[12px] border border-gray-200 text-gray-700 text-[13px] font-medium">拒单</button>
                    <button onClick={() => acceptOrder(o.id)} className="px-4 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">接单</button>
                  </>
                )}
                {o.status === 'accepted' && (
                  <button onClick={() => prepareOrder(o.id)} className="px-4 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">确认出餐</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="h-4" />
    </div>
  );
}
