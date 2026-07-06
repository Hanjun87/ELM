import { useState } from 'react';
import { campaigns, Campaign } from '../store';
import { showModal, toast } from '@shared';

export default function CampaignsPage() {
  const [filter, setFilter] = useState('all');
  const [, forceUpdate] = useState(0);

  const filtered = campaigns.filter(c => {
    if (filter === 'active') return c.status === 'active';
    if (filter === 'ended') return c.status === 'ended';
    return true;
  });

  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const typeColors: Record<string, string> = { full_reduction: 'bg-red-50 text-[#FF5000]', discount: 'bg-green-50 text-[#00B578]', new_customer: 'bg-blue-50 text-[#0085FF]' };
  const statusLabels: Record<string, string> = { active: '进行中', ended: '已结束', upcoming: '未开始' };

  const toggleCampaign = (id: number) => {
    const c = campaigns.find(x => x.id === id);
    if (!c) return;
    c.status = c.status === 'active' ? 'ended' : 'active';
    toast(c.name + ' 已' + (c.status === 'active' ? '启用' : '停用'));
    forceUpdate(n => n + 1);
  };

  const addCampaign = () => {
    const typeLabels: Record<string, string> = { full_reduction: '满减', discount: '折扣', new_customer: '新客立减' };
    const form = { name: '', type: 'full_reduction', rules: '', start: '2026-07-06', end: '2026-07-31', scope: '全部商品' };

    const renderBody = () => (
      <div className="flex flex-col gap-3">
        <input defaultValue={form.name} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="活动名称" onChange={e => { form.name = e.target.value; }} />
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(typeLabels).map(t => (
            <button key={t} onClick={() => { form.type = t; showModal('新建营销活动', '', renderBody(), confirmAdd); }}
              className={`py-2 px-3 rounded-xl border text-[13px] ${form.type === t ? 'border-[#0085FF] text-[#0085FF] bg-blue-50 font-bold' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
              {typeLabels[t]}
            </button>
          ))}
        </div>
        <textarea defaultValue={form.rules} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF] resize-none h-20" placeholder="活动规则描述" onChange={e => { form.rules = e.target.value; }} />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" defaultValue={form.start} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" onChange={e => { form.start = e.target.value; }} />
          <input type="date" defaultValue={form.end} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" onChange={e => { form.end = e.target.value; }} />
        </div>
        <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="适用范围，如: 全部商品" defaultValue={form.scope} onChange={e => { form.scope = e.target.value; }} />
      </div>
    );

    const confirmAdd = () => {
      if (!form.name) { toast('请输入活动名称'); return; }
      campaigns.push({
        id: Date.now(), name: form.name, type: form.type, typeLabel: typeLabels[form.type] || form.type,
        rules: form.rules || '待配置', start: form.start, end: form.end,
        status: 'upcoming', scope: form.scope || '全部商品',
      });
      toast('已创建: ' + form.name);
      forceUpdate(n => n + 1);
    };

    showModal('新建营销活动', '', renderBody(), confirmAdd);
  };

  return (
    <div className="px-4 pt-4 space-y-4 pb-4">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {[
          { key: 'all', label: `全部 (${campaigns.length})` },
          { key: 'active', label: `进行中 (${activeCount})` },
          { key: 'ended', label: '已结束' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap ${filter === t.key ? 'bg-[#0085FF] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>{t.label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[16px] text-gray-900">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${typeColors[c.type]}`}>{c.typeLabel}</span>
                </div>
                <span className={`text-[11px] font-medium ${c.status === 'active' ? 'text-[#00B578]' : c.status === 'ended' ? 'text-gray-400' : 'text-yellow-600'}`}>{statusLabels[c.status]}</span>
              </div>
              {c.status !== 'ended' && (
                <button onClick={() => toggleCampaign(c.id)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${c.status === 'active' ? 'bg-[#0085FF]' : 'bg-gray-300'}`}>
                  <div className={`absolute top-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform ${c.status === 'active' ? 'translate-x-[25px]' : 'translate-x-[3px]'}`} />
                </button>
              )}
            </div>
            <p className="text-[13px] text-gray-600 mb-2">{c.rules}</p>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{c.start} ~ {c.end}</span>
              <span>适用范围: {c.scope}</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addCampaign}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-[14px] font-medium hover:bg-gray-50 transition-colors">
        + 新建营销活动
      </button>
    </div>
  );
}
