import { useState, useEffect } from 'react';
import { Bell, LayoutDashboard, Receipt, Package, BarChart3, Store } from 'lucide-react';
import DashboardTab from './components/DashboardTab';
import OrdersTab from './components/OrdersTab';
import ProductsTab from './components/ProductsTab';
import DataTab from './components/DataTab';
import SettingsTab from './components/SettingsTab';
import ReviewsPage from './components/ReviewsPage';
import CampaignsPage from './components/CampaignsPage';
import { Modal } from '@shared';
import { Toast } from '@shared';
import { subscribe, notify } from './store';

type SubPage = 'reviews' | 'campaigns' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => subscribe(() => forceUpdate(n => n + 1)), []);

  const openSubPage = (page: SubPage) => {
    setSubPage(page);
    document.body.style.overflow = 'hidden';
  };
  const closeSubPage = () => {
    setSubPage(null);
    document.body.style.overflow = '';
  };

  const tabs = [
    { icon: LayoutDashboard, label: '工作台' },
    { icon: Receipt, label: '订单' },
    { icon: Package, label: '商品' },
    { icon: BarChart3, label: '数据' },
    { icon: Store, label: '我的' },
  ];

  if (subPage) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F5F5F5] relative font-sans">
        <header className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center px-4 h-14 sticky top-0 z-10 gap-3">
          <button onClick={closeSubPage} className="flex items-center gap-1 text-[#0085FF] font-medium text-[14px]">← 返回</button>
          <span className="font-bold text-[17px] text-gray-900">{subPage === 'reviews' ? '评价管理' : '营销活动'}</span>
        </header>
        {subPage === 'reviews' && <ReviewsPage />}
        {subPage === 'campaigns' && <CampaignsPage />}
        <Toast />
        <Modal />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#F5F5F5] min-h-screen relative shadow-2xl flex flex-col font-sans selection:bg-blue-200">
      <header className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] fixed top-0 w-full max-w-md h-14 z-50 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0085FF] font-bold text-sm">店</div>
          <span className="font-bold text-[18px] text-[#0085FF] tracking-tight">商家管理后台</span>
        </div>
        <button className="text-[#0085FF] active:scale-95 transition-transform p-1"><Bell size={22} strokeWidth={2.5} /></button>
      </header>

      <main className="flex-1 mt-14 pb-28 overflow-y-auto">
        {activeTab === 0 && <DashboardTab onNav={(tab) => setActiveTab(tab)} openSubPage={openSubPage} />}
        {activeTab === 1 && <OrdersTab />}
        {activeTab === 2 && <ProductsTab />}
        {activeTab === 3 && <DataTab onNav={(tab) => setActiveTab(tab)} />}
        {activeTab === 4 && <SettingsTab openSubPage={openSubPage} />}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md z-50 flex justify-around items-center px-2 py-2 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.04)] rounded-t-[20px] border-t border-gray-100 pb-safe">
        {tabs.map((tab, i) => {
          const isActive = activeTab === i;
          const Icon = tab.icon;
          return (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#0085FF] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[11px] mt-1 ${isActive ? 'text-[#0085FF] font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <Toast />
      <Modal />
    </div>
  );
}
