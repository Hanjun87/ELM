/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Search, SlidersHorizontal, LayoutDashboard, ClipboardList, BarChart3, User, Check } from 'lucide-react';
import { motion } from 'motion/react';
import TasksTab from './components/TasksTab';
import { Toast, toast } from '@shared';
import StatisticsTab from './components/StatisticsTab';
import MineTab from './components/MineTab';
import { orders, subscribe, grabOrder } from './store';

export default function App() {
  const [isWorking, setIsWorking] = useState(true);
  const [activeTab, setActiveTab] = useState('工作台');
  const [sortByNearest, setSortByNearest] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [, forceUpdate] = useState(0);
  useEffect(() => subscribe(() => forceUpdate(n => n + 1)), []);

  const available = orders.filter(o => o.status === 'available');

  // 应用搜索过滤
  let filtered = available;
  if (searchText.trim()) {
    filtered = available.filter(o =>
      o.storeName.includes(searchText) ||
      o.no.includes(searchText)
    );
  }

  const visibleOrders = sortByNearest ? [...filtered].sort((a, b) => a.distanceKm - b.distanceKm) : filtered;

  const handleGrab = (id: number, no: string) => {
    grabOrder(id);
    toast('抢单成功 ' + no);
  };

  return (
    <div className="max-w-md mx-auto bg-[#F5F5F5] min-h-screen relative shadow-2xl flex flex-col font-sans selection:bg-blue-200">
      <Toast />
      {/* Header */}
      <header className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] fixed top-0 w-full max-w-md h-14 z-50 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-100">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoNSHWZJoA0vGfV_5tAAvfoMsvzRJBFe70j7a3d3-4EIlOK59XjFIZ2R3G14adLso5VV-YdLbHU6VSrj72lPKAlmduIHMbs6hiA-FMi56hDyiBkKshYODn8aoowg5EXq4zp1eNOdY5UOPx8MaT-vZF6NGyl07D-vyijikvAFmewv2f6utHtnbUsVeUvym7FGzyU4rAC9cs5qKt2z8oYvqUqF3pmIomyLinAvxrsqSNz22S2YOqi3qb" 
              alt="Rider Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="font-bold text-[18px] text-[#0085FF] tracking-tight">
            {activeTab === '工作台' || activeTab === '我的' ? '蜂鸟配送' : activeTab}
          </span>
        </div>
        <button onClick={() => toast('消息通知功能开发中')} className="text-[#0085FF] active:scale-95 transition-transform p-1">
          <Bell size={22} strokeWidth={2.5} />
        </button>
      </header>

      {/* Main Content */}
      {activeTab === '工作台' && (
        <main className="flex-1 mt-14 pb-28 px-4 overflow-y-auto">
          {/* Status Section */}
          <section className="mt-4 p-4 bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-gray-500 text-[12px] font-medium">当前状态</span>
                <h2 className="font-bold text-[18px] text-gray-900 mt-0.5">{isWorking ? '正在开工' : '休息中'}</h2>
              </div>
              
              <button 
                onClick={() => setIsWorking(!isWorking)}
                className={`relative w-[52px] h-[30px] rounded-full p-1 transition-colors duration-300 ${isWorking ? 'bg-[#00B578]' : 'bg-gray-300'}`}
                aria-label="Toggle work status"
              >
                <motion.div 
                  className="w-[22px] h-[22px] bg-white rounded-full shadow-sm"
                  animate={{ x: isWorking ? 22 : 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 35 }}
                />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-gray-500 text-[11px] font-medium">今日订单</span>
                <span className="font-bold text-[#0085FF] mt-1 text-[20px] leading-none">24</span>
              </div>
              <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-gray-500 text-[11px] font-medium">预估收入</span>
                <span className="font-bold text-[#FF5000] mt-1 text-[20px] leading-none">
                  <span className="text-[14px] mr-0.5">¥</span>186.5
                </span>
              </div>
              <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-gray-500 text-[11px] font-medium">在线时长</span>
                <span className="font-bold text-gray-900 mt-1 text-[20px] leading-none">6.5<span className="text-[13px] ml-0.5 font-medium">h</span></span>
              </div>
            </div>
          </section>

          {/* Search & Filter */}
          <div className="flex items-center gap-2.5 mt-5">
            <div className="flex-1 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-2.5 px-4 rounded-full flex items-center gap-2.5 border border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单或商户"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[14px] w-full text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <button onClick={() => setSortByNearest(!sortByNearest)} className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform shrink-0">
              <SlidersHorizontal size={20} className={sortByNearest ? "text-[#0085FF]" : "text-gray-400"} />
            </button>
          </div>

          {/* Section Title */}
          <div className="flex items-center justify-between mt-7 mb-4 px-1">
            <h3 className="font-bold text-gray-900 text-[17px] flex items-center gap-2">
              待抢订单
              <span className="bg-[#FF5000] text-white text-[11px] px-2 py-0.5 rounded-full font-bold leading-none shadow-sm">{visibleOrders.length}</span>
            </h3>
            <span onClick={() => setSortByNearest(v => !v)}
              className={`text-[13px] font-medium active:opacity-70 cursor-pointer flex items-center gap-1 ${sortByNearest ? 'text-[#0085FF] font-bold' : 'text-[#0085FF]'}`}>
              {sortByNearest && <Check size={14} />}离我最近
            </span>
          </div>

          {/* Orders List */}
          <div className="space-y-3.5">
            {visibleOrders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 active:scale-[0.98] transition-transform">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${order.typeBg} ${order.typeText}`}>
                      {order.type}
                    </span>
                    <span className="text-gray-500 text-[12px] font-medium">距您 {order.distanceKm}km</span>
                  </div>
                  <div className="text-[#FF5000] font-bold text-[22px] leading-none flex items-baseline">
                    <span className="text-[14px] mr-1">¥</span>
                    {order.price}
                  </div>
                </div>

                {/* Addresses */}
                <div className="space-y-4 relative ml-1">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[3.5px] top-[14px] bottom-[26px] w-[1px] bg-gray-200"></div>

                  {/* Pickup */}
                  <div className="flex gap-3.5 relative z-10">
                    <div className="flex flex-col items-center mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#00B578] shadow-[0_0_0_3px_white]"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-[15px]">{order.storeName}</p>
                      <p className="text-gray-500 text-[12px] mt-1">{order.storeAddr}</p>
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="flex gap-3.5 relative z-10">
                    <div className="flex flex-col items-center mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#FF5000] shadow-[0_0_0_3px_white]"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-[15px]">{order.customerAddr}</p>
                      <p className="text-gray-500 text-[12px] mt-1">{order.dropoffNote}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button onClick={() => handleGrab(order.id, order.no)} className="w-full bg-[#0085FF] hover:bg-blue-600 text-white py-3.5 rounded-[12px] font-bold text-[16px] mt-5 shadow-[0_4px_12px_rgba(0,133,255,0.2)] active:scale-[0.98] transition-all">
                  立即抢单
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeTab === '任务' && <TasksTab />}
      {activeTab === '统计' && <StatisticsTab />}
      {activeTab === '我的' && <MineTab />}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md z-50 flex justify-around items-center px-2 py-2 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.04)] rounded-t-[20px] border-t border-gray-100 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
        <NavItem icon={<LayoutDashboard size={24} strokeWidth={2.5} />} label="工作台" active={activeTab === '工作台'} onClick={() => setActiveTab('工作台')} />
        <NavItem icon={<ClipboardList size={24} strokeWidth={2} />} label="任务" active={activeTab === '任务'} onClick={() => setActiveTab('任务')} />
        <NavItem icon={<BarChart3 size={24} strokeWidth={2} />} label="统计" active={activeTab === '统计'} onClick={() => setActiveTab('统计')} />
        <NavItem icon={<User size={24} strokeWidth={2} />} label="我的" active={activeTab === '我的'} onClick={() => setActiveTab('我的')} />
      </nav>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactElement, label: string, active?: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-50 text-[#0085FF] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
    {React.cloneElement(icon, { 
      className: active ? 'text-[#0085FF]' : 'text-gray-400',
      strokeWidth: active ? 2.5 : 2
    })}
    <span className={`text-[11px] mt-1 ${active ? 'text-[#0085FF] font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

