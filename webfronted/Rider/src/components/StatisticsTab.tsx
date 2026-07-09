import React from 'react';
import { Wallet, Truck, Utensils, Coffee } from 'lucide-react';

export default function StatisticsTab() {
  return (
    <main className="flex-1 mt-14 pb-28 px-4 overflow-y-auto bg-[#F5F5F5] pt-4 space-y-4">
      {/* Dashboard Summary Card */}
      <section className="bg-[#0085FF] text-white p-5 rounded-[16px] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 9h4v11H4zm6-5h4v16h-4zm6 9h4v7h-4z" />
          </svg>
        </div>
        <p className="text-white/80 text-[13px] mb-1">今日预估收入 (元)</p>
        <h2 className="text-[36px] font-bold mb-6 font-sans">¥284.50</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
            <p className="text-white/80 text-[12px] mb-1">今日单量</p>
            <div className="flex items-end gap-1">
              <span className="text-[22px] font-bold leading-none">32</span>
              <span className="text-[12px] pb-0.5">单</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
            <p className="text-white/80 text-[12px] mb-1">好评率</p>
            <div className="flex items-end gap-1">
              <span className="text-[22px] font-bold leading-none">99.2</span>
              <span className="text-[12px] pb-0.5">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Account Balance */}
      <section className="bg-white p-4 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={20} className="text-[#FF5000]" />
            <span className="font-bold text-[16px] text-gray-900">账户余额</span>
          </div>
          <span className="font-bold text-[20px] text-gray-900">¥1,420.00</span>
        </div>
        <div className="flex gap-2.5">
          <button className="flex-1 bg-[#0085FF] text-white py-2.5 rounded-[12px] font-bold text-[14px] active:scale-[0.98]">去提现</button>
          <button className="px-5 border border-gray-200 text-gray-700 py-2.5 rounded-[12px] font-bold text-[14px] active:bg-gray-50">明细</button>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="space-y-3">
        <div className="flex justify-between items-end px-1 mb-1">
          <h3 className="font-bold text-[17px] text-gray-900">最近订单</h3>
          <span className="text-gray-500 text-[13px]">查看全部</span>
        </div>
        
        <div className="space-y-2.5">
          <div className="bg-white p-4 rounded-[16px] border border-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex justify-between items-center active:scale-[0.99]">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl shrink-0">
                <Truck className="text-[#0085FF]" size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-[15px]">丰顺美食城 #120</p>
                <p className="text-gray-500 text-[12px] mt-0.5">2023-10-24 12:35</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[17px] text-[#0085FF] font-bold">+¥6.50</p>
              <span className="text-[10px] bg-green-50 text-[#00B578] px-1.5 py-0.5 rounded mt-1 inline-block">配送完成</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-[16px] border border-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex justify-between items-center active:scale-[0.99]">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl shrink-0">
                <Utensils className="text-[#0085FF]" size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-[15px]">绝味鸭脖 #042</p>
                <p className="text-gray-500 text-[12px] mt-0.5">2023-10-24 12:12</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[17px] text-[#0085FF] font-bold">+¥4.80</p>
              <span className="text-[10px] bg-green-50 text-[#00B578] px-1.5 py-0.5 rounded mt-1 inline-block">配送完成</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-[16px] border border-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex justify-between items-center active:scale-[0.99]">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl shrink-0">
                <Coffee className="text-[#0085FF]" size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-[15px]">永和大王 #228</p>
                <p className="text-gray-500 text-[12px] mt-0.5">2023-10-24 11:45</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[17px] text-[#0085FF] font-bold">+¥12.50</p>
              <span className="text-[10px] bg-orange-50 text-[#FF5000] px-1.5 py-0.5 rounded mt-1 inline-block">长途加成</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trend Graph Placeholder */}
      <section className="bg-white p-4 rounded-[16px] border border-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h3 className="font-bold text-[15px] text-gray-900 mb-5">近7日单量趋势</h3>
        <div className="h-32 w-full flex items-end justify-between gap-1.5 px-2">
          {[{h:'40%', l:'周一'}, {h:'65%', l:'周二'}, {h:'85%', l:'周三'}, {h:'55%', l:'周四'}, {h:'75%', l:'周五'}, {h:'100%', l:'今日', active:true}, {h:'10%', l:'周日'}].map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
              <div className={`w-full rounded-t-sm ${bar.active ? 'bg-[#0085FF]' : 'bg-blue-100'}`} style={{height: bar.h}}></div>
              <span className={`text-[10px] ${bar.active ? 'text-[#0085FF] font-bold' : 'text-gray-400'}`}>{bar.l}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
