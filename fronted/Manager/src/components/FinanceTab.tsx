import { useState } from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import { settlements, platformConfig, Settlement } from '../store';
import { toast } from '@shared';

export default function FinanceTab() {
  const [config, setConfig] = useState(platformConfig);
  const [settlementList, setSettlementList] = useState(settlements);
  const [activeTab, setActiveTab] = useState('settlements');

  const paySettlement = (id: number) => {
    setSettlementList(prev => prev.map(s => s.id === id ? { ...s, status: 'paid' as const } : s));
    toast('结算款已打款');
  };

  const updateConfig = (key: string, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Revenue Summary */}
      <section className="px-4 pt-4">
        <div className="bg-[#0085FF] text-white p-5 rounded-[16px] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={60} />
          </div>
          <p className="text-white/80 text-[13px] mb-1">本月平台营收 (元)</p>
          <h2 className="text-[36px] font-bold mb-4">&#165;385,200.00</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
              <p className="text-white/80 text-[11px] mb-0.5">佣金收入</p>
              <span className="text-[18px] font-bold">&#165;38,520</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
              <p className="text-white/80 text-[11px] mb-0.5">配送抽成</p>
              <span className="text-[18px] font-bold">&#165;12,840</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
              <p className="text-white/80 text-[11px] mb-0.5">广告收入</p>
              <span className="text-[18px] font-bold">&#165;5,600</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Config */}
      <section className="px-4">
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-[#FF5000]" />
            <h2 className="font-bold text-[16px] text-gray-900">平台配置</h2>
          </div>
          {[
            { key: 'commissionRate', label: '抽成比例 (%)', value: config.commissionRate, min: 1, max: 30, suffix: '%' },
            { key: 'minWithdraw', label: '最低提现 (元)', value: config.minWithdraw, min: 10, max: 1000, suffix: '元' },
            { key: 'deliveryTimeout', label: '配送超时 (分钟)', value: config.deliveryTimeout, min: 10, max: 120, suffix: '分钟' },
            { key: 'autoConfirmDays', label: '自动确认 (天)', value: config.autoConfirmDays, min: 1, max: 30, suffix: '天' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-[14px] font-medium text-gray-800">{item.label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateConfig(item.key, Math.max(item.min, item.value - (item.key === 'commissionRate' ? 1 : item.key === 'minWithdraw' ? 10 : 5)))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-50 text-lg leading-none"
                >−</button>
                <span className="text-[16px] font-bold text-gray-900 min-w-[50px] text-center">{item.value}{item.suffix}</span>
                <button
                  onClick={() => updateConfig(item.key, Math.min(item.max, item.value + (item.key === 'commissionRate' ? 1 : item.key === 'minWithdraw' ? 10 : 5)))}
                  className="w-7 h-7 rounded-full bg-[#0085FF] text-white flex items-center justify-center active:bg-blue-600 text-lg leading-none"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Settlement Tabs */}
      <section className="px-4">
        <div className="flex gap-2 mb-3">
          {['settlements', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === tab ? 'bg-[#0085FF] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              {tab === 'settlements' ? '待结算' : '已结算'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {settlementList
            .filter(s => activeTab === 'settlements' ? s.status === 'pending' : s.status === 'paid')
            .map(s => (
              <div key={s.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[15px] text-gray-900">{s.merchantName}</h3>
                    <p className="text-[11px] text-gray-500">{s.period}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${s.status === 'paid' ? 'bg-green-50 text-[#00B578]' : 'bg-yellow-50 text-yellow-600'}`}>
                    {s.status === 'paid' ? '已打款' : '待打款'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#F8F9FA] rounded-xl p-3 mb-3">
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400">订单数</div>
                    <div className="text-[15px] font-bold text-gray-900">{s.orders}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400">营业额</div>
                    <div className="text-[15px] font-bold text-gray-900">&#165;{s.revenue}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400">结算金额</div>
                    <div className="text-[15px] font-bold text-[#FF5000]">&#165;{s.net}</div>
                  </div>
                </div>
                {s.status === 'pending' && (
                  <button onClick={() => paySettlement(s.id)} className="w-full bg-[#0085FF] text-white py-2.5 rounded-[12px] font-bold text-[14px] shadow-[0_4px_12px_rgba(0,133,255,0.2)] active:scale-[0.98]">
                    确认打款
                  </button>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
