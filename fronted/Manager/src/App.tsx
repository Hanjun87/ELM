import { useState } from 'react';
import {
  LayoutDashboard, Users, FileCheck, DollarSign, Image,
  LogOut, ChevronRight, Menu
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import DashboardTab from './components/DashboardTab';
import UsersTab from './components/UsersTab';
import AuditTab from './components/AuditTab';
import FinanceTab from './components/FinanceTab';
import BannersTab from './components/BannersTab';
import { Toast, showModal } from '@shared';

const NAV_ITEMS = [
  { id: 'dashboard', label: '数据看板', icon: LayoutDashboard },
  { id: 'users',     label: '用户管理', icon: Users },
  { id: 'audit',     label: '商家审核', icon: FileCheck },
  { id: 'finance',   label: '财务结算', icon: DollarSign },
  { id: 'content',   label: '内容运营', icon: Image },
];

function MainApp() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [sidebarOpen, setSidebar]   = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => window.location.reload()} />;
  }

  const handleLogout = () => {
    showModal(
      '退出登录',
      '确认退出管理后台？',
      <p className="text-sm text-gray-500">退出后需要重新登录。</p>,
      logout,
    );
  };

  const activeLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label ?? '';

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Toast />

      {/* ── Sidebar ── */}
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-200`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#0085FF] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            ELM
          </div>
          {sidebarOpen && (
            <span className="font-bold text-gray-900 text-[15px] whitespace-nowrap">平台管理中心</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-50 text-[#0085FF]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
                {active && sidebarOpen && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            title="退出登录"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebar(v => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>管理后台</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{activeLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">管理员</p>
              <p className="text-sm font-medium text-gray-800">{user?.phone ?? '—'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0085FF] flex items-center justify-center text-white text-xs font-bold">
              管
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users'     && <UsersTab />}
          {activeTab === 'audit'     && <AuditTab />}
          {activeTab === 'finance'   && <FinanceTab />}
          {activeTab === 'content'   && <BannersTab />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
