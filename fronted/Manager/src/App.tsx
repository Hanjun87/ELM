import { useState } from 'react';
import { LayoutDashboard, Users, FileCheck, DollarSign, Image, Bell } from 'lucide-react';
import DashboardTab from './components/DashboardTab';
import UsersTab from './components/UsersTab';
import AuditTab from './components/AuditTab';
import FinanceTab from './components/FinanceTab';
import BannersTab from './components/BannersTab';
import { Toast } from '@shared';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '大盘', icon: LayoutDashboard },
    { id: 'users', label: '用户', icon: Users },
    { id: 'audit', label: '审核', icon: FileCheck },
    { id: 'content', label: '内容', icon: Image },
    { id: 'finance', label: '财务', icon: DollarSign },
  ];

  return (
    <div className="max-w-md mx-auto bg-[#F5F5F5] min-h-screen relative shadow-2xl flex flex-col font-sans selection:bg-blue-200">
      <Toast />
      <header className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] fixed top-0 w-full max-w-md h-14 z-50 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0085FF] font-bold text-sm">管</div>
          <span className="font-bold text-[18px] text-[#0085FF] tracking-tight">平台管理中心</span>
        </div>
        <button className="text-[#0085FF] active:scale-95 transition-transform p-1"><Bell size={22} strokeWidth={2.5} /></button>
      </header>
      <main className="flex-1 mt-14 pb-28 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'audit' && <AuditTab />}
        {activeTab === 'content' && <BannersTab />}
        {activeTab === 'finance' && <FinanceTab />}
      </main>
      <nav className="fixed bottom-0 w-full max-w-md z-50 flex justify-around items-center px-2 py-2 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.04)] rounded-t-[20px] border-t border-gray-100 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#0085FF] scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#0085FF]' : 'text-gray-400'} />
              <span className={`text-[11px] mt-1 ${isActive ? 'text-[#0085FF] font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
