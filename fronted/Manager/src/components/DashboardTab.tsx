import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Receipt, Users, Store, Loader2 } from 'lucide-react';
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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-300" size={36} />
      </div>
    );
  }

  const stats = data ? [
    {
      label: 'GMV 总交易额',
      value: `¥${data.gmv.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`,
      icon: CreditCard,
      bg: 'bg-blue-500',
      change: '平台累计',
    },
    {
      label: '总订单量',
      value: data.order_count.toLocaleString(),
      icon: Receipt,
      bg: 'bg-orange-500',
      change: `有效 ${(data.order_count - data.cancelled_count).toLocaleString()}`,
    },
    {
      label: '注册用户',
      value: data.user_count.toLocaleString(),
      icon: Users,
      bg: 'bg-emerald-500',
      change: '全平台用户',
    },
    {
      label: '入驻商家',
      value: data.merchant_count.toLocaleString(),
      icon: Store,
      bg: 'bg-purple-500',
      change: '营业中商家',
    },
  ] : [];

  const valid   = data ? data.order_count - data.cancelled_count : 0;
  const cancel  = data?.cancelled_count ?? 0;
  const total   = data?.order_count ?? 1;
  const cancelRate = total > 0 ? Math.round((cancel / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">数据看板</h1>
        <p className="text-sm text-gray-500 mt-1">平台核心指标概览</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{s.label}</span>
                <div className={`w-10 h-10 rounded-lg ${s.bg} bg-opacity-10 flex items-center justify-center`}>
                  <Icon size={20} className={s.bg.replace('bg-', 'text-')} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className="text-xs text-gray-400">{s.change}</p>
            </div>
          );
        })}
      </div>

      {/* Two-column: order status + quick metrics */}
      <div className="grid grid-cols-3 gap-5">
        {/* Order breakdown */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">订单状态分布</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">有效订单</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${total > 0 ? Math.round((valid / total) * 100) : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-800 w-16 text-right">
                {total > 0 ? Math.round((valid / total) * 100) : 0}%
              </span>
              <span className="text-sm text-gray-500 w-16 text-right">{valid.toLocaleString()} 单</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">已取消</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-red-400 h-2.5 rounded-full transition-all"
                  style={{ width: `${cancelRate}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-800 w-16 text-right">{cancelRate}%</span>
              <span className="text-sm text-gray-500 w-16 text-right">{cancel.toLocaleString()} 单</span>
            </div>
          </div>
        </div>

        {/* Quick actions / metrics */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-700">平台健康度</h2>
          <div className="flex-1 flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">取消率</span>
              <span className={`text-sm font-bold ${cancelRate > 20 ? 'text-red-500' : 'text-emerald-500'}`}>
                {cancelRate}%
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">商家数 / 用户数</span>
              <span className="text-sm font-bold text-gray-700">
                {data ? `${data.merchant_count} / ${data.user_count}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">人均 GMV</span>
              <span className="text-sm font-bold text-[#0085FF]">
                {data && data.user_count > 0
                  ? `¥${(data.gmv / data.user_count).toFixed(1)}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
