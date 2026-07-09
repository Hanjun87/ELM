import { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { showModal, toast } from '@shared';

interface MerchantApplication {
  id: number; name: string; applicant: string; address: string;
  licenseImg: string; foodPermitImg: string; legalPerson: string; capital: string;
  status: 'pending' | 'approved' | 'rejected'; appliedAt: string; reviewedAt?: string;
}

const mockApplications: MerchantApplication[] = [
  { id: 1, name: '老王家东北饺子馆', applicant: '王建国', address: '浦东新区XX路101号', licenseImg: '', foodPermitImg: '', legalPerson: '王建国', capital: '50万人民币', status: 'pending', appliedAt: '2026-07-05 14:30' },
  { id: 2, name: '星巴克咖啡 (软件园店)', applicant: '李明', address: '浦东新区YY路202号', licenseImg: '', foodPermitImg: '', legalPerson: '李明', capital: '200万人民币', status: 'pending', appliedAt: '2026-07-05 15:45' },
  { id: 3, name: '幸福烘焙坊', applicant: '赵芳', address: '浦东新区ZZ路303号', licenseImg: '', foodPermitImg: '', legalPerson: '赵芳', capital: '30万人民币', status: 'pending', appliedAt: '2026-07-04 10:00' },
  { id: 4, name: '兰州拉面馆', applicant: '马强', address: '浦东新区AA路88号', licenseImg: '', foodPermitImg: '', legalPerson: '马强', capital: '20万人民币', status: 'approved', appliedAt: '2026-07-03 09:00', reviewedAt: '2026-07-04' },
];

const TABS = [
  { key: 'merchant', label: '商家入驻' },
  { key: 'product',  label: '商品审核' },
  { key: 'report',   label: '举报处理' },
];

export default function AuditTab() {
  const [activeTab, setActiveTab] = useState('merchant');
  const [search, setSearch]       = useState('');
  const [apps, setApps]           = useState<MerchantApplication[]>(mockApplications);

  const filtered = apps
    .filter(() => activeTab === 'merchant') // 商品审核/举报处理暂无数据源
    .filter(a => !search || a.name.includes(search) || a.applicant.includes(search));

  const pending = apps.filter(a => a.status === 'pending');

  const review = (id: number, status: 'approved' | 'rejected') => {
    showModal(
      status === 'approved' ? '审核通过' : '驳回申请',
      '确认执行此操作？',
      <p className="text-sm text-gray-500">该操作将立即生效，请谨慎确认。</p>,
      () => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, status, reviewedAt: new Date().toISOString().slice(0, 10) } : a));
        toast(status === 'approved' ? '已通过审核' : '已驳回申请');
      },
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">商家审核</h1>
        <p className="text-sm text-gray-500 mt-0.5">审核商家入驻申请、商品合规性与用户举报</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">待审核申请</p>
          <p className="text-3xl font-bold text-gray-900">{pending.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">今日已审核</p>
          <p className="text-3xl font-bold text-gray-900">5</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">通过率</p>
          <p className="text-3xl font-bold text-emerald-500">
            {apps.length ? Math.round(apps.filter(a => a.status === 'approved').length / apps.length * 100) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">本月新增商家</p>
          <p className="text-3xl font-bold text-gray-900">{apps.filter(a => a.status === 'approved').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === t.key ? 'bg-[#0085FF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
              {t.key === 'merchant' && pending.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索商家名称/申请人"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Application list */}
      {activeTab !== 'merchant' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center text-gray-400 text-sm">
          暂无{TABS.find(t => t.key === activeTab)?.label}数据
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{app.name}</h3>
                    <p className="text-xs text-gray-500">{app.applicant} · 申请于 {app.appliedAt}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  app.status === 'pending' ? 'bg-yellow-50 text-yellow-600'
                    : app.status === 'approved' ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已驳回'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3 mb-3 text-xs">
                <div><span className="text-gray-400">法人：</span><span className="text-gray-700 font-medium ml-1">{app.legalPerson}</span></div>
                <div><span className="text-gray-400">注册资本：</span><span className="text-gray-700 font-medium ml-1">{app.capital}</span></div>
                <div className="col-span-2"><span className="text-gray-400">地址：</span><span className="text-gray-700 font-medium ml-1">{app.address}</span></div>
                <div className="col-span-2 flex gap-2 mt-1">
                  <span className="text-gray-400">资质：</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-[#0085FF] rounded text-[11px] font-medium cursor-pointer">营业执照</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[11px] font-medium cursor-pointer">食品经营许可</span>
                </div>
              </div>

              {app.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => review(app.id, 'rejected')}
                    className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    驳回
                  </button>
                  <button
                    onClick={() => review(app.id, 'approved')}
                    className="flex-[2] bg-[#0085FF] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                  >
                    审核通过
                  </button>
                </div>
              ) : (
                <p className={`text-xs font-medium ${app.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {app.status === 'approved' ? '审核通过' : '已驳回'} · {app.reviewedAt}
                </p>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center text-gray-400 text-sm">
              暂无匹配的申请
            </div>
          )}
        </div>
      )}
    </div>
  );
}
