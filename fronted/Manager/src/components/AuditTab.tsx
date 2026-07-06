import { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { applications, MerchantApplication } from '../store';
import { toast } from '@shared';

export default function AuditTab() {
  const [activeTab, setActiveTab] = useState('merchant');
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState(applications);

  const filtered = apps.filter(a => {
    if (activeTab === 'merchant') return true;
    return false;
  }).filter(a => {
    if (!search) return true;
    return a.name.includes(search) || a.applicant.includes(search);
  });

  const pending = apps.filter(a => a.status === 'pending');

  const review = (id: number, status: 'approved' | 'rejected') => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status, reviewedAt: new Date().toISOString().slice(0, 10) } : a));
    toast(status === 'approved' ? '已通过审核' : '已驳回申请');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="bg-[#0085FF] text-white p-4 rounded-[16px] flex justify-between items-center shadow-lg">
          <div>
            <p className="text-white/80 text-[11px] mb-1">待审核申请</p>
            <p className="font-bold text-[28px] leading-none">{pending.length} <span className="text-[12px] font-normal">条</span></p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-[11px] mb-1">今日已审核</p>
            <p className="font-bold text-[20px] leading-none">5 <span className="text-[12px] font-normal">条</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2">
        {[
          { key: 'merchant', label: '商家入驻', count: pending.length },
          { key: 'product', label: '商品审核', count: 0 },
          { key: 'report', label: '举报处理', count: 0 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors relative ${activeTab === tab.key ? 'bg-[#0085FF] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${activeTab === tab.key ? 'bg-[#FF5000] text-white' : 'bg-[#FF5000] text-white'}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="搜索商家名称"
            className="w-full bg-white rounded-full py-2.5 pl-10 pr-4 text-[14px] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Application Cards */}
      <div className="px-4 space-y-3 pb-4">
        {filtered.map(app => (
          <div key={app.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FileText size={20} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-gray-900">{app.name}</h3>
                  <p className="text-[11px] text-gray-500">{app.applicant} · 申请: {app.appliedAt}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${app.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : app.status === 'approved' ? 'bg-green-50 text-[#00B578]' : 'bg-red-50 text-[#FF5000]'}`}>
                {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已驳回'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] rounded-xl p-3 mb-3 text-[12px]">
              <div><span className="text-gray-400">法人:</span> <span className="font-medium text-gray-800 ml-1">{app.legalPerson}</span></div>
              <div><span className="text-gray-400">资本:</span> <span className="font-medium text-gray-800 ml-1">{app.capital}</span></div>
              <div className="col-span-2"><span className="text-gray-400">地址:</span> <span className="font-medium text-gray-800 ml-1">{app.address}</span></div>
              <div className="col-span-2 flex gap-2 mt-1">
                <span className="text-gray-400">资质:</span>
                <span className="px-2 py-0.5 bg-blue-50 text-[#0085FF] rounded text-[10px] font-medium cursor-pointer">营业执照</span>
                <span className="px-2 py-0.5 bg-green-50 text-[#00B578] rounded text-[10px] font-medium cursor-pointer">食品经营许可</span>
              </div>
            </div>

            {app.status === 'pending' && (
              <div className="flex gap-2.5">
                <button onClick={() => review(app.id, 'rejected')} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-[12px] font-bold text-[14px] active:bg-gray-50">驳回</button>
                <button onClick={() => review(app.id, 'approved')} className="flex-[2] bg-[#0085FF] text-white py-2.5 rounded-[12px] font-bold text-[14px] shadow-[0_4px_12px_rgba(0,133,255,0.2)] active:scale-[0.98]">审核通过</button>
              </div>
            )}
            {app.status === 'approved' && <div className="text-[12px] text-[#00B578] font-medium">审核通过 · {app.reviewedAt}</div>}
            {app.status === 'rejected' && <div className="text-[12px] text-[#FF5000] font-medium">已驳回 · {app.reviewedAt}</div>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-[14px]">暂无审核申请</div>
        )}
      </div>
    </div>
  );
}
