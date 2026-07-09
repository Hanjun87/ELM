import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from '@shared';

const periodData: Record<string, { revenue: string; orders: number; visitors: number; avgOrder: string; bars: number[]; orderBars: number[] }> = {
  day:   { revenue: '12,450.00', orders: 328, visitors: 1052, avgOrder: '38.5', bars: [30,45,20,60,80,50,90], orderBars: [40,55,35,70,65,45,85] },
  week:  { revenue: '86,420.00', orders: 2150, visitors: 7240, avgOrder: '40.2', bars: [55,68,42,80,95,72,60], orderBars: [60,72,50,85,90,65,55] },
  month: { revenue: '352,800.00', orders: 8640, visitors: 28500, avgOrder: '40.8', bars: [70,85,55,90,60,40,75], orderBars: [65,80,60,95,55,50,70] },
};

export default function DataTab({ onNav }: { onNav: (i: number) => void }) {
  const [period, setPeriod] = useState('day');
  const [trend, setTrend] = useState('revenue');
  const d = periodData[period];

  return (
    <div className="px-4 pt-4 space-y-4 pb-4">
      {/* Period switch */}
      <div className="bg-white rounded-[16px] p-1 flex relative">
        <div className="absolute left-1 top-1 bottom-1 w-[calc(33.33%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-300"
          style={{ transform: `translateX(${period === 'day' ? 0 : period === 'week' ? 100 : 200}%)` }} />
        {['day', 'week', 'month'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2 text-[14px] font-bold relative z-10 transition-colors ${period === p ? 'text-[#0085FF]' : 'text-gray-500'}`}>
            {{ day: '日', week: '周', month: '月' }[p]}
          </button>
        ))}
      </div>

      {/* Revenue card */}
      <div className="bg-[#0085FF] text-white rounded-[16px] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={60} /></div>
        <p className="text-white/80 text-[13px] mb-1">营业额 (元)</p>
        <h2 className="text-[36px] font-bold mb-4">{d.revenue}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
            <p className="text-white/80 text-[11px] mb-0.5">有效单量</p><span className="text-[20px] font-bold">{d.orders}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
            <p className="text-white/80 text-[11px] mb-0.5">进店人数</p><span className="text-[20px] font-bold">{d.visitors}</span>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[15px] text-gray-900">营业趋势</h3>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {['revenue', 'orders'].map(t => (
              <button key={t} onClick={() => setTrend(t)}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-colors ${trend === t ? 'bg-white text-[#0085FF] shadow-sm' : 'text-gray-500'}`}>
                {t === 'revenue' ? '营业额' : '单量'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between h-[100px] gap-1">
          {(trend === 'revenue' ? d.bars : d.orderBars).map((h, i) => (
            <div key={i} className={`flex-1 rounded-t-sm ${i === d.bars.length - 1 ? 'bg-[#0085FF]' : 'bg-blue-100'}`} style={{ height: h + '%' }} />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* KPIs */}
      <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <h3 className="font-bold text-[15px] text-gray-900 mb-4">经营指标</h3>
        <div className="grid grid-cols-3 gap-y-5">
          {[
            { label: '客单价', val: '¥38.5', ch: '-2.1%', up: false },
            { label: '下单转化率', val: '31.2%', ch: '+1.5%', up: true },
            { label: '复购率', val: '45.8%', ch: '+4.2%', up: true },
            { label: '曝光人数', val: '4,208', ch: '持平', up: true },
            { label: '进店转化率', val: '25.0%', ch: '-0.8%', up: false },
            { label: '退款率', val: '1.2%', ch: '-0.5%', up: true },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <div className="text-[11px] text-gray-500">{k.label}</div>
              <div className="font-bold text-[16px] text-gray-900 mt-1">{k.val}</div>
              <div className={`text-[10px] flex items-center justify-center gap-0.5 mt-0.5 ${k.ch === '持平' ? 'text-gray-400' : k.up ? 'text-[#00B578]' : 'text-[#FF5000]'}`}>
                {k.ch !== '持平' && (k.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}{k.ch}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-[15px] text-gray-900">热门商品 TOP 5</h3>
          <button onClick={() => onNav(2)} className="text-[13px] text-[#0085FF] font-medium">查看全部</button>
        </div>
        {[
          { name: '招牌卤肉饭套餐', sales: 142, rev: '3,550' },
          { name: '香酥大鸡排', sales: 98, rev: '1,470' },
          { name: '冰镇手打柠檬茶', sales: 85, rev: '1,020' },
          { name: '经典台湾烤肠', sales: 64, rev: '320' },
          { name: '脆皮炸鲜奶', sales: 52, rev: '624' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i < 3 ? 'bg-[#0085FF] text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
              <span className="text-[13px] font-medium text-gray-900">{item.name}</span>
            </div>
            <span className="text-[12px] text-gray-500">售{item.sales}份 · ¥{item.rev}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
