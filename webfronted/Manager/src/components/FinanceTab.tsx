import { useState } from 'react';
import { Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from '@shared';

interface Settlement {
  id: number; merchantName: string; period: string; orders: number;
  revenue: string; commission: string; net: string; status: 'pending' | 'paid';
}

const mockSettlements: Settlement[] = [
  { id: 1, merchantName: '美味坊餐饮', period: '2026-06-24 ~ 2026-06-30', orders: 412, revenue: '16,890.00', commission: '1,689.00', net: '15,201.00', status: 'pending' },
  { id: 2, merchantName: '茶百道餐饮', period: '2026-06-24 ~ 2026-06-30', orders: 298, revenue: '8,940.00', commission: '894.00', net: '8,046.00', status: 'pending' },
  { id: 3, merchantName: '老张火锅店', period: '2026-06-17 ~ 2026-06-23', orders: 320, revenue: '12,800.00', commission: '1,280.00', net: '11,520.00', status: 'paid' },
  { id: 4, merchantName: '美味坊餐饮', period: '2026-06-17 ~ 2026-06-23', orders: 398, revenue: '15,420.00', commission: '1,542.00', net: '13,878.00', status: 'paid' },
];

export default function FinanceTab() {
  const [settlementList, setSettlementList] = useState<Settlement[]>(mockSettlements);
  const [activeFilter, setActiveFilter]     = useState<'all' | 'pending' | 'paid'>('all');
  const [commissionRate, setCommissionRate] = useState('10');

  const filtered = settlementList.filter(s => activeFilter === 'all' || s.status === activeFilter);
  const pending  = settlementList.filter(s => s.status === 'pending');

  const paySettlement = (id: number) => {
    setSettlementList(prev => prev.map(s => s.id === id ? { ...s, status: 'paid' as const } : s));
    toast('打款成功');
  };

  const saveCommission = () => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) return toast('请输入有效的百分比（0~100）');
    toast('平台抽佣比例已更新');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">财务结算</h1>
        <p className="text-sm text-gray-500 mt-0.5">管理商家结算与平台收入</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm opacity-90">待结算金额</span>
            <Wallet size={20} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">
            ¥{pending.reduce((sum, s) => sum + parseFloat(s.net.replace(/,/g, '')), 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-75 mt-2">{pending.length} 笔待处理</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">本周平台收入</span>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">¥12,450</p>
          <p className="text-xs text-gray-400 mt-2">佣金收入</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">累计结算笔数</span>
            <DollarSign size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{settlementList.length}</p>
          <p className="text-xs text-gray-400 mt-2">历史记录</p>
        </div>
      </div>

      {/* Two columns: platform config + settlements */}
      <div className="grid grid-cols-[280px_1fr] gap-5">
        {/* Left: Platform config */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">平台设置</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">抽佣比例（%）</label>
            <input
              type="number"
              value={commissionRate}
              onChange={e => setCommissionRate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="10"
            />
          </div>
          <button
            onClick={saveCommission}
            className="w-full bg-[#0085FF] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            保存设置
          </button>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">当前佣金率</p>
            <p className="text-2xl font-bold text-gray-900">{commissionRate}%</p>
          </div>
        </div>

        {/* Right: Settlements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-2 p-4 border-b border-gray-100">
            {[
              { key: 'all', label: '全部' },
              { key: 'pending', label: '待结算' },
              { key: 'paid', label: '已结算' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveFilter(t.key as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeFilter === t.key ? 'bg-[#0085FF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
            <p className="ml-auto text-xs text-gray-400 py-2">共 {filtered.length} 条</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">商家名称</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">周期</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">订单</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs">营业额</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs">佣金</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs">结算金额</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">状态</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.merchantName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.period}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{s.orders}</td>
                    <td className="px-4 py-3 text-right text-gray-700">¥{s.revenue}</td>
                    <td className="px-4 py-3 text-right text-orange-500">-¥{s.commission}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">¥{s.net}</td>
                    <td className="px-4 py-3 text-center">
                      {s.status === 'pending' ? (
                        <span className="inline-flex px-2 py-1 rounded bg-yellow-50 text-yellow-600 text-xs font-semibold">待结算</span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-xs font-semibold">已结算</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.status === 'pending' ? (
                        <button
                          onClick={() => paySettlement(s.id)}
                          className="px-3 py-1.5 bg-[#0085FF] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          确认打款
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">暂无结算记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
