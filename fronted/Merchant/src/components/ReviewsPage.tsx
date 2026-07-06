import { useState } from 'react';
import { Star } from 'lucide-react';
import { reviews } from '../store';
import { showModal, toast } from '@shared';

export default function ReviewsPage() {
  const [filter, setFilter] = useState('all');
  const [, forceUpdate] = useState(0);

  const filtered = reviews.filter(r => {
    if (filter === 'good') return r.rating >= 4;
    if (filter === 'bad') return r.rating <= 2;
    if (filter === 'unreplied') return !r.replied;
    return true;
  });

  const goodCount = reviews.filter(r => r.rating >= 4).length;
  const badCount = reviews.filter(r => r.rating <= 2).length;
  const unrepliedCount = reviews.filter(r => !r.replied).length;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const replyReview = (id: number) => {
    const r = reviews.find(x => x.id === id);
    if (!r) return;
    let text = '';
    showModal('回复评价', r.content.substring(0, 40) + '...', (
      <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF] resize-none h-24" placeholder="输入回复内容..." onChange={e => { text = e.target.value; }} />
    ), () => {
      if (!text) return;
      r.replied = true; r.reply = text;
      toast('已回复'); forceUpdate(n => n + 1);
    });
  };

  const tabs = [
    { key: 'all', label: `全部 (${reviews.length})` },
    { key: 'good', label: `好评 (${goodCount})` },
    { key: 'bad', label: `差评 (${badCount})` },
    { key: 'unreplied', label: `待回复 (${unrepliedCount})` },
  ];

  return (
    <div className="px-4 pt-4 space-y-4 pb-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="text-[11px] text-gray-500 mb-1">总体评分</div>
          <div className="text-[28px] font-bold text-gray-900">{avgRating}</div>
          <div className="text-[11px] text-gray-400 mt-1">共 {reviews.length} 条评价</div>
        </div>
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="text-[11px] text-gray-500 mb-1">待处理</div>
          <div className="text-[28px] font-bold text-[#FF5000]">{unrepliedCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">条未回复</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${filter === t.key ? 'bg-[#0085FF] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Reviews */}
      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-[11px]">{r.customer[0]}</div>
                <span className="font-bold text-[14px] text-gray-900">{r.customer}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={14} className={i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
            </div>
            <div className="text-[11px] text-gray-400 mb-2">{r.orderInfo} | {r.date}</div>
            <p className="text-[14px] text-gray-800 mb-2">{r.content}</p>
            {r.replied ? (
              <div className="bg-gray-50 rounded-xl p-3 mt-2">
                <div className="text-[11px] font-bold text-[#0085FF] mb-1">商家回复</div>
                <p className="text-[12px] text-gray-600">{r.reply}</p>
              </div>
            ) : (
              <button onClick={() => replyReview(r.id)} className="mt-2 px-4 py-1.5 rounded-[12px] border border-[#0085FF] text-[#0085FF] text-[12px] font-medium">回复评价</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
