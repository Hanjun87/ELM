import { useState, useEffect, useCallback } from 'react';
import { Map, Phone, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@shared';
import { orderAPI } from '../api';

interface Order {
  id: number;
  order_no: string;
  address_snapshot: { address?: string; name?: string; phone?: string };
  items_snapshot: any[];
  paid_amount: string;
  status: string;
  merchant_name: string;
  merchant_logo?: string;
  note?: string;
}

export default function TasksTab() {
  const [activeSubTab, setActiveSubTab] = useState('进行中');
  const [showException, setShowException] = useState<number | null>(null);
  const [exceptionForm, setExceptionForm] = useState({ type: '', desc: '' });
  const [available, setAvailable] = useState<Order[]>([]);
  const [mine, setMine] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [availableRes, mineRes]: any[] = await Promise.all([
        orderAPI.available(),
        orderAPI.mine(),
      ]);
      if (availableRes.code === 0) setAvailable(availableRes.data.items || []);
      if (mineRes.code === 0) setMine(mineRes.data.items || []);
    } catch {
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const progress = mine.filter(o => ['picked'].includes(o.status));
  const waiting = available;
  const completed = mine.filter(o => o.status === 'delivered');

  const grabOrder = async (id: number) => {
    try {
      const response: any = await orderAPI.grab(id);
      if (response.code === 0) { toast('抢单成功'); load(); }
      else toast(response.message || '抢单失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '抢单失败');
    }
  };

  const pickupOrder = async (id: number) => {
    try {
      const response: any = await orderAPI.pickup(id);
      if (response.code === 0) { toast('已取餐'); load(); }
      else toast(response.message || '取餐失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '取餐失败');
    }
  };

  const deliverOrder = async (id: number) => {
    try {
      const response: any = await orderAPI.deliver(id);
      if (response.code === 0) { toast('送达成功'); load(); }
      else toast(response.message || '送达失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '送达失败');
    }
  };

  const submitException = () => {
    if (!exceptionForm.type) { toast('请选择异常类型'); return; }
    toast('异常已提交');
    setShowException(null);
    setExceptionForm({ type: '', desc: '' });
  };

  const notifyNav = () => toast('导航功能暂未开放');
  const notifyCall = () => toast('拨号功能暂未开放');

  const tabs = [
    { key: '进行中', count: progress.length, list: progress },
    { key: '待接单', count: waiting.length, list: waiting },
    { key: '已完成', count: completed.length, list: completed },
  ];

  const activeList = tabs.find(t => t.key === activeSubTab)?.list || [];

  if (loading) {
    return <main className="flex-1 mt-14 pb-20 px-4 overflow-y-auto bg-[#F5F5F5] pt-4">
      <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>
    </main>;
  }

  return (
    <main className="flex-1 mt-14 pb-20 px-4 overflow-y-auto bg-[#F5F5F5] pt-4">
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveSubTab(t.key)}
            className={`flex-1 py-3 rounded-xl font-bold text-[15px] transition-all ${activeSubTab === t.key ? 'bg-[#0085FF] text-white shadow-md' : 'bg-white text-gray-600'}`}>
            {t.key}
            {t.count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] ${activeSubTab === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeList.length === 0 && <p className="text-center text-gray-400 text-[13px] py-12">暂无订单</p>}
        {activeList.map(o => (
          <div key={o.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-[16px] text-gray-900">{o.order_no}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray-500">{o.merchant_name}</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-[#0085FF] rounded text-[10px] font-medium">{o.status === 'ready' ? '待取餐' : o.status === 'picked' ? '配送中' : '已送达'}</span>
                </div>
              </div>
              <span className="text-[18px] font-bold text-[#0085FF]">¥{o.paid_amount}</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-3">
              <Map size={18} className="text-[#0085FF] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[14px] text-gray-900">{o.address_snapshot.address || '地址信息缺失'}</p>
                <p className="text-[12px] text-gray-500 mt-1">{o.address_snapshot.name || '客户'} {o.address_snapshot.phone || ''}</p>
              </div>
              <button onClick={notifyCall} className="w-9 h-9 rounded-full bg-[#0085FF] text-white flex items-center justify-center flex-shrink-0">
                <Phone size={18} />
              </button>
            </div>

            {o.note && <div className="bg-orange-50 rounded-xl p-3 text-[12px] text-gray-700 flex gap-2">
              <AlertTriangle size={16} className="text-[#FF5000] flex-shrink-0 mt-0.5" />
              <span><span className="font-bold text-[#FF5000]">备注:</span> {o.note}</span>
            </div>}

            <div className="flex gap-2">
              {activeSubTab === '待接单' && (
                <>
                  <button onClick={notifyNav} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-[13px]">导航</button>
                  <button onClick={() => grabOrder(o.id)} className="flex-1 py-2.5 rounded-xl bg-[#0085FF] text-white font-bold text-[13px]">立即接单</button>
                </>
              )}
              {activeSubTab === '进行中' && o.status === 'picked' && (
                <>
                  <button onClick={notifyNav} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-[13px]">导航</button>
                  <button onClick={() => setShowException(o.id)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-[13px]">异常</button>
                  <button onClick={() => deliverOrder(o.id)} className="flex-1 py-2.5 rounded-xl bg-[#0085FF] text-white font-bold text-[13px]">送达</button>
                </>
              )}
              {activeSubTab === '进行中' && o.status === 'ready' && (
                <>
                  <button onClick={notifyNav} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-[13px]">导航</button>
                  <button onClick={() => pickupOrder(o.id)} className="flex-1 py-2.5 rounded-xl bg-[#0085FF] text-white font-bold text-[13px]">确认取餐</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showException !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowException(null)}>
          <div className="bg-white w-full rounded-t-[24px] p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-[18px] text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#FF5000]" />
              上报异常
            </h3>
            <div className="space-y-3">
              {['address_error','contact_failed','item_damaged','other'].map(t => (
                <button key={t} onClick={() => setExceptionForm(p => ({...p, type:t}))}
                  className={`w-full py-3 rounded-xl text-[14px] font-medium transition-all ${exceptionForm.type===t?'bg-[#FF5000] text-white':'bg-gray-50 text-gray-700'}`}>
                  {{address_error:'地址错误',contact_failed:'联系不上客户',item_damaged:'餐品损坏',other:'其他'}[t]}
                </button>
              ))}
              <textarea className="w-full bg-gray-50 rounded-xl p-3 text-[13px] border border-gray-100 resize-none h-20 outline-none focus:border-[#0085FF]" placeholder="补充说明..."
                value={exceptionForm.desc} onChange={e => setExceptionForm(p => ({...p, desc:e.target.value}))} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowException(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-[14px]">取消</button>
              <button onClick={submitException} className="flex-1 py-3 rounded-xl bg-[#FF5000] text-white font-bold text-[14px]">提交异常</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
