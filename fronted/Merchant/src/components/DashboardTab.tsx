import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Receipt, Star, Megaphone, PieChart, ImageOff } from 'lucide-react';
import { orders, subscribe } from '../store';
import { showModal, toast } from '@shared';

export default function DashboardTab({ onNav, openSubPage }: { onNav: (i: number) => void; openSubPage: (p: 'reviews' | 'campaigns') => void }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => subscribe(() => forceUpdate(n => n + 1)), []);

  const pending = orders.filter(o => o.status === 'pending');
  const progress = orders.filter(o => o.status === 'progress');

  const acceptOrder = (id: number) => {
    const o = orders.find(x => x.id === id);
    if (o) { o.status = 'progress'; o.label = '备餐中'; o.timer = ''; }
    toast('已接单 #' + id); forceUpdate(n => n + 1);
  };
  const rejectOrder = (id: number) => {
    let reason = '';
    showModal('拒单原因', '请输入拒单原因', <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="备料不足、店铺繁忙等" onChange={e => { reason = e.target.value; }} />, () => {
      orders.splice(orders.findIndex(x => x.id === id), 1);
      toast('已拒单 #' + id + (reason ? ': ' + reason : ''));
      forceUpdate(n => n + 1);
    });
  };
  const readyOrder = (id: number) => {
    const o = orders.find(x => x.id === id);
    if (o) { o.status = 'completed'; o.label = '已完成'; }
    toast('出餐完成 #' + id); forceUpdate(n => n + 1);
  };

  const quickActions = [
    { icon: Receipt, label: '订单处理', color: 'bg-blue-50 text-[#0085FF]', action: () => onNav(1) },
    { icon: Star, label: '评价管理', color: 'bg-orange-50 text-[#FF5000]', action: () => openSubPage('reviews'), badge: true },
    { icon: Megaphone, label: '营销活动', color: 'bg-green-50 text-[#00B578]', action: () => openSubPage('campaigns') },
    { icon: PieChart, label: '报表统计', color: 'bg-gray-100 text-gray-600', action: () => onNav(3) },
  ];

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Stats */}
      <section className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="font-bold text-[15px] text-gray-900 mb-3">今日概况</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: '今日营收(元)', val: '3,250.00', change: '+12.5%', up: true },
            { label: '有效订单(单)', val: '128', change: '+8%', up: true },
            { label: '实收金额(元)', val: '2,980.50', change: '-2.1%', up: false },
          ].map((s, i) => (
            <div key={i} className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center">
              <span className="text-gray-500 text-[11px] font-medium">{s.label}</span>
              <span className={`font-bold mt-1 text-[18px] leading-none ${i === 0 ? 'text-[#0085FF]' : i === 1 ? 'text-gray-900' : 'text-gray-900'}`}>
                {i === 0 && <span className="text-[12px] mr-0.5">¥</span>}{s.val}
              </span>
              <span className={`text-[10px] mt-1 flex items-center gap-0.5 ${s.up ? 'text-[#00B578]' : 'text-[#FF5000]'}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{s.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map((a, i) => (
          <button key={i} onClick={a.action} className="bg-white rounded-[16px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-center gap-1.5 relative active:scale-95 transition-transform">
            {a.badge && <div className="absolute top-2 right-2 w-2 h-2 bg-[#FF5000] rounded-full" />}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.color}`}><a.icon size={20} /></div>
            <span className="text-[11px] text-gray-700 font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Real-time Orders */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-[15px] text-gray-900">实时订单 <span className="bg-[#0085FF] text-white text-[11px] px-2 py-0.5 rounded-full">{pending.length}</span></h2>
          <button onClick={() => onNav(1)} className="text-[13px] text-[#0085FF] font-medium">查看全部</button>
        </div>
        <div className="space-y-3">
          {[...pending, ...progress].slice(0, 3).map(o => (
            <div key={o.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[15px] text-gray-900">{o.no}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${o.status === 'pending' ? 'bg-red-50 text-[#FF5000]' : 'bg-green-50 text-[#00B578]'}`}>{o.label}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-[#0085FF]">{o.type}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">下单: {o.time}{o.eta ? ' | 预计: ' + o.eta : ''}</span>
                </div>
                {o.timer && <div className="text-right"><span className="text-[#FF5000] font-bold text-[15px] flex items-center gap-1">⏱ {o.timer}</span><span className="text-[10px] text-gray-400">超时自动取消</span></div>}
              </div>
              <div className="flex gap-3 mb-3">
                {o.img ? <img src={o.img} className="w-16 h-16 rounded-lg object-cover bg-gray-50" alt="" /> : <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300"><ImageOff size={28} /></div>}
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-gray-900">{o.items}</p>
                  {o.note && <p className="text-[11px] text-gray-500">备注: {o.note}</p>}
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] text-gray-400">共 {o.qty} 件</span>
                    <span className="font-bold text-[16px] text-gray-900">¥{o.amount}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                {o.status === 'pending' && (
                  <>
                    <button onClick={() => rejectOrder(o.id)} className="px-4 py-2 rounded-[12px] border border-gray-200 text-gray-700 text-[13px] font-medium">拒单</button>
                    <button onClick={() => acceptOrder(o.id)} className="px-4 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">接单并打印</button>
                  </>
                )}
                {o.status === 'progress' && (
                  <button onClick={() => readyOrder(o.id)} className="px-4 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">出餐完成</button>
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
