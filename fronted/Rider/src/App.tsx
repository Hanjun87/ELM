import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, SlidersHorizontal, LayoutDashboard, ClipboardList, BarChart3, User, Check, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import TasksTab from './components/TasksTab';
import { Toast, toast } from '@shared';
import StatisticsTab from './components/StatisticsTab';
import MineTab from './components/MineTab';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { orderAPI, riderAPI } from './api';

interface AvailableOrder {
  id: number;
  order_no: string;
  merchant_name: string;
  address_snapshot: { address?: string };
  paid_amount: string;
}

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isWorking, setIsWorking] = useState(false);
  const [activeTab, setActiveTab] = useState('工作台');
  const [sortByNearest, setSortByNearest] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response: any = await orderAPI.available();
      if (response.code === 0) setOrders(response.data.items || []);
    } catch {
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    riderAPI.me().then((res: any) => {
      if (res.code === 0) setIsWorking(res.data.work_status !== 'offline');
    }).catch(() => {});
  }, [isAuthenticated, load]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => window.location.reload()} />;
  }

  const filtered = searchText.trim()
    ? orders.filter(o => o.merchant_name.includes(searchText) || o.order_no.includes(searchText))
    : orders;
  const visibleOrders = filtered;

  const toggleWorking = async () => {
    const next = !isWorking;
    try {
      const response: any = await riderAPI.setStatus(next ? 'idle' : 'offline');
      if (response.code === 0) { setIsWorking(next); toast(next ? '已开工' : '已下线'); }
      else toast(response.message || '操作失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '操作失败');
    }
  };

  const handleGrab = async (id: number, orderNo: string) => {
    try {
      const response: any = await orderAPI.grab(id);
      if (response.code === 0) { toast('抢单成功 ' + orderNo); load(); }
      else toast(response.message || '抢单失败');
    } catch (e: any) {
      toast(e.response?.data?.message || '抢单失败');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#F5F5F5] min-h-screen relative shadow-2xl flex flex-col font-sans selection:bg-blue-200">
      <Toast />
      <header className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] fixed top-0 w-full max-w-md h-14 z-50 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0085FF] font-bold text-sm">骑</div>
          <span className="font-bold text-[18px] text-[#0085FF] tracking-tight">
            {activeTab === '工作台' || activeTab === '我的' ? '蜂鸟配送' : activeTab}
          </span>
        </div>
        <button onClick={() => toast('消息通知功能开发中')} className="text-[#0085FF] active:scale-95 transition-transform p-1">
          <Bell size={22} strokeWidth={2.5} />
        </button>
      </header>

      {activeTab === '工作台' && (
        <main className="flex-1 mt-14 pb-28 px-4 overflow-y-auto">
          <section className="mt-4 p-4 bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-gray-500 text-[12px] font-medium">当前状态</span>
                <h2 className="font-bold text-[18px] text-gray-900 mt-0.5">{isWorking ? '正在开工' : '休息中'}</h2>
              </div>

              <button
                onClick={toggleWorking}
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
          </section>

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

          <div className="flex items-center justify-between mt-7 mb-4 px-1">
            <h3 className="font-bold text-gray-900 text-[17px] flex items-center gap-2">
              待抢订单
              <span className="bg-[#FF5000] text-white text-[11px] px-2 py-0.5 rounded-full font-bold leading-none shadow-sm">{visibleOrders.length}</span>
            </h3>
          </div>

          {loading && <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>}

          <div className="space-y-3.5">
            {!loading && visibleOrders.length === 0 && <p className="text-center text-gray-400 text-[13px] py-8">暂无可接订单</p>}
            {visibleOrders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-gray-900 font-bold text-[14px]">{order.merchant_name}</span>
                    <span className="text-gray-500 text-[12px] font-medium">{order.order_no}</span>
                  </div>
                  <div className="text-[#FF5000] font-bold text-[22px] leading-none flex items-baseline">
                    <span className="text-[14px] mr-1">¥</span>
                    {order.paid_amount}
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-2 h-2 rounded-full bg-[#FF5000] shadow-[0_0_0_3px_white] mt-1.5"></div>
                  <p className="text-gray-700 text-[14px] flex-1">{order.address_snapshot.address || '地址信息缺失'}</p>
                </div>

                <button onClick={() => handleGrab(order.id, order.order_no)} className="w-full bg-[#0085FF] hover:bg-blue-600 text-white py-3.5 rounded-[12px] font-bold text-[16px] mt-5 shadow-[0_4px_12px_rgba(0,133,255,0.2)] active:scale-[0.98] transition-all">
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
