import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, CreditCard, Receipt, Users, Store, Loader2 } from 'lucide-react';
import { adminAPI } from '../api';
import { toast } from '@shared';

interface DashboardData {
  gmv: number;
  order_count: number;
  merchant_count: number;
  user_count: number;
  cancelled_count: number;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response: any = await adminAPI.dashboard();
      if (response.code === 0) setData(response.data);
    } catch {
      toast('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="px-4 pt-4"><div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div></div>;
  }

  const statCards = data ? [
    { label: 'GMV (元)', value: data.gmv.toLocaleString('zh-CN', { maximumFractionDigits: 0 }), icon: CreditCard, color: 'bg-blue-50 text-[#0085FF]' },
    { label: '总订单量', value: data.order_count.toLocaleString(), icon: Receipt, color: 'bg-orange-50 text-[#FF5000]' },
    { label: '总用户数', value: data.user_count.toLocaleString(), icon: Users, color: 'bg-green-50 text-[#00B578]' },
    { label: '入驻商家', value: data.merchant_count.toLocaleString(), icon: Store, color: 'bg-purple-50 text-purple-500' },
  ] : [];

  return (
    <div className="px-4 pt-4 space-y-4">
      <section className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="font-bold text-[15px] text-gray-900 mb-3">平台数据</h2>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <span className="text-gray-500 text-[11px] font-medium">{s.label}</span>
                  <div className="font-bold text-[20px] text-gray-900 leading-none mt-1">{s.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {data && (
        <section className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
          <h2 className="font-bold text-[15px] text-gray-900 mb-3">订单状态</h2>
          <div className="flex gap-3">
            <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
              <div className="text-[22px] font-bold text-[#00B578]">{(data.order_count - data.cancelled_count).toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">有效订单</div>
            </div>
            <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
              <div className="text-[22px] font-bold text-[#FF5000]">{data.cancelled_count.toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">已取消</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
