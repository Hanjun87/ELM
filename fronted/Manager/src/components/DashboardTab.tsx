import { TrendingUp, TrendingDown, CreditCard, Receipt, Users, Store, ArrowLeftRight, Clock } from 'lucide-react';
import { dashboardStats } from '../store';

const STAT_ICONS: Record<string, typeof CreditCard> = {
  payments: CreditCard, receipt: Receipt, users: Users, store: Store, swap: ArrowLeftRight, clock: Clock,
};

export default function DashboardTab() {
  const todayStats = [
    { label: '今日营收', value: '52,380.00', change: '+15.2%', up: true },
    { label: '今日订单', value: '1,892', change: '+8.5%', up: true },
    { label: '在线骑手', value: '486', change: '-3.1%', up: false },
  ];

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Key Metric Cards */}
      <section className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="font-bold text-[15px] text-gray-900 mb-3">今日概况</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {todayStats.map((s, i) => (
            <div key={i} className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center">
              <span className="text-gray-500 text-[11px] font-medium">{s.label}</span>
              <span className={`font-bold mt-1 text-[18px] leading-none ${i === 0 ? 'text-[#0085FF]' : i === 1 ? 'text-[#FF5000]' : 'text-[#00B578]'}`}>
                {i === 0 && <span className="text-[12px] mr-0.5">&#165;</span>}{s.value}
              </span>
              <span className={`text-[10px] mt-1 flex items-center gap-0.5 ${s.up ? 'text-[#00B578]' : 'text-[#FF5000]'}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{s.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Grid */}
      <section className="grid grid-cols-2 gap-3">
        {dashboardStats.map((s, i) => (
          <div key={i} className={`bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between ${i === 0 ? 'col-span-2' : ''}`}>
            <div className={`flex items-center gap-2 ${i === 0 ? 'mb-2' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.color}`}>
                {(() => { const Icon = STAT_ICONS[s.icon] || CreditCard; return <Icon size={18} />; })()}
              </div>
              <span className="text-[12px] text-gray-500 font-medium">{s.label}</span>
            </div>
            <div className="mt-2">
              <div className={`font-bold ${i === 0 ? 'text-[28px]' : 'text-[22px]'} text-gray-900 leading-none`}>
                {i === 0 && <span className="text-[16px] font-normal mr-0.5">&#165;</span>}{s.value}
              </div>
              <div className={`text-[11px] mt-1 flex items-center gap-0.5 ${s.up ? 'text-[#00B578]' : 'text-[#FF5000]'}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{s.change}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Top Merchants */}
      <section className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="font-bold text-[15px] text-gray-900 mb-3">商家排行 TOP 5</h2>
        {[
          { name: '美味坊餐饮', revenue: '168,900', orders: 4120 },
          { name: '茶百道餐饮', revenue: '89,400', orders: 2980 },
          { name: '老张火锅店', revenue: '76,200', orders: 2450 },
          { name: '星巴克咖啡', revenue: '65,800', orders: 1890 },
          { name: '兰州拉面馆', revenue: '42,500', orders: 1520 },
        ].map((m, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i < 3 ? 'bg-[#0085FF] text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
              <span className="text-[14px] font-semibold text-gray-900">{m.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-bold text-gray-900">&#165;{m.revenue}</span>
              <span className="text-[11px] text-gray-500 ml-2">{m.orders}单</span>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Orders */}
      <section className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 mb-4">
        <h2 className="font-bold text-[15px] text-gray-900 mb-3">最新订单</h2>
        {[
          { no: '#58291', merchant: '美味坊餐饮', customer: '张小明', amount: '58.00', status: '配送中', sc: 'text-[#0085FF]' },
          { no: '#58290', merchant: '茶百道', customer: '李四', amount: '18.00', status: '已完成', sc: 'text-[#00B578]' },
          { no: '#58289', merchant: '老张火锅', customer: '王五', amount: '126.00', status: '待接单', sc: 'text-[#FF5000]' },
        ].map((o, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{o.no}</span>
                <span className="text-[13px] font-medium text-gray-900">{o.merchant}</span>
              </div>
              <span className="text-[11px] text-gray-500">{o.customer} · &#165;{o.amount}</span>
            </div>
            <span className={`text-[12px] font-bold ${o.sc}`}>{o.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
