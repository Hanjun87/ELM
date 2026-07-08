import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { orderAPI } from '../api';
import { showModal, toast } from '@shared';
import { Order, itemsSummary, itemsQty } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending: '待支付', paid: '待接单', accepted: '待出餐', preparing: '备餐中',
  ready: '待取餐', picked: '配送中', delivered: '已送达', finished: '已完成', cancelled: '已取消',
};

export default function OrdersTab() {
  const [filter, setFilter] = useState('paid');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
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

  const pendingCount = orders.filter(o => o.status === 'paid').length;
  const progressCount = orders.filter(o => ['accepted', 'preparing'].includes(o.status)).length;
  const filtered = orders.filter(o => {
    if (filter === 'paid') return o.status === 'paid';
    if (filter === 'progress') return ['accepted', 'preparing', 'ready'].includes(o.status);
    return true;
  });

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

  const readyOrder = async (id: number) => {
    try {
      const response: any = await orderAPI.ready(id);
      if (response.code === 0) { toast('出餐完成 #' + id); load(); }
      else toast(response.message || '操作失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '操作失败');
    }
  };

  const tabs = [
    { key: 'paid', label: '待处理', count: pendingCount },
    { key: 'progress', label: '进行中', count: progressCount },
    { key: 'all', label: '全部', count: orders.length },
  ];

  return (
    <div className="space-y-0">
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h2 className="font-bold text-[17px] text-gray-900">订单管理</h2>
      </div>

      <div className="bg-white px-4 border-b border-gray-100 flex gap-4 overflow-x-auto hide-scrollbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`py-3 text-[14px] font-bold whitespace-nowrap relative ${filter === t.key ? 'text-[#0085FF]' : 'text-gray-500'}`}>
            {t.label}
            {t.count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === t.key ? 'bg-[#0085FF] text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}
            {filter === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0085FF] rounded-full" />}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {loading && (
          <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ReceiptIcon />
            <p className="mt-3 text-[14px]">暂无订单</p>
          </div>
        )}
        {filtered.map(o => (
          <div key={o.id} className={`bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 ${o.status !== 'paid' ? 'opacity-90' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-gray-400">{o.order_no}</span>
                <span className="text-[11px] text-gray-500">{new Date(o.created_at).toLocaleString('zh-CN')}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${o.status === 'paid' ? 'bg-red-50 text-[#FF5000]' : 'bg-green-50 text-[#00B578]'}`}>{STATUS_LABELS[o.status] || o.status}</span>
            </div>
            <h3 className="font-bold text-[14px] text-gray-900 mb-1">{itemsSummary(o.items_snapshot)}</h3>
            {o.note && <p className="text-[11px] text-[#FF5000] mt-1"><span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500 mr-1">备注</span>{o.note}</p>}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <span className="text-[12px] text-gray-500">共 {itemsQty(o.items_snapshot)} 件 · 实付 <span className="font-bold text-[16px] text-gray-900">¥{o.paid_amount}</span></span>
              <div className="flex gap-2">
                {o.status === 'paid' && (
                  <>
                    <button onClick={() => rejectOrder(o.id)} className="px-4 py-2 rounded-[12px] border border-gray-200 text-[13px] font-medium text-gray-700">拒绝单</button>
                    <button onClick={() => acceptOrder(o.id)} className="px-5 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">立即接单</button>
                  </>
                )}
                {o.status === 'accepted' && (
                  <button onClick={() => prepareOrder(o.id)} className="px-5 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">确认出餐</button>
                )}
                {o.status === 'preparing' && (
                  <button onClick={() => readyOrder(o.id)} className="px-5 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">出餐完成</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg className="mx-auto text-gray-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16v4l-2 2 2 2v4H4v-4l2-2-2-2V4z" /><path d="M8 4v16" />
    </svg>
  );
}
