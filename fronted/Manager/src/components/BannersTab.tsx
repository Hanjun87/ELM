import { useState } from 'react';
import { Plus, Image, Trash2, GripVertical } from 'lucide-react';
import { showModal, toast } from '@shared';
interface Banner { id: number; title: string; image: string; link: string; active: boolean; sort: number }
const initBanners: Banner[] = [
  { id:1, title:'夏日狂欢', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', link:'', active:true, sort:0 },
  { id:2, title:'新店开业', image:'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800', link:'', active:true, sort:1 },
];

interface Announcement { id: number; title: string; content: string; active: boolean }
const initAnnouncements: Announcement[] = [
  { id:1, title:'平台维护通知', content:'7月10日凌晨2:00-4:00进行系统维护', active:true },
];

export default function BannersTab() {
  const [tab, setTab] = useState('banners');
  const [banners, setBanners] = useState(initBanners);
  const [announcements, setAnnouncements] = useState(initAnnouncements);
  const [editing, setEditing] = useState<Banner | null>(null);

  const toggleBanner = (id: number) => { setBanners(prev => prev.map(b => b.id===id ? {...b, active:!b.active} : b)); toast('轮播图状态已更新'); };
  const deleteBanner = (id: number) => { setBanners(prev => prev.filter(b => b.id!==id)); toast('轮播图已删除'); };
  const addBanner = () => {
    let title = '';
    showModal('新增轮播图', '', (
      <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]"
        placeholder="轮播图标题" onChange={e => { title = e.target.value; }} />
    ), () => {
      setBanners(prev => [...prev, { id:Date.now(), title: title || '新轮播图', image:'', link:'', active:true, sort:prev.length }]);
      toast('轮播图已新增');
    });
  };
  const addAnnouncement = () => {
    let title = '', content = '';
    showModal('新增公告', '', (
      <div className="flex flex-col gap-3">
        <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]"
          placeholder="公告标题" onChange={e => { title = e.target.value; }} />
        <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF] resize-none h-24"
          placeholder="公告内容" onChange={e => { content = e.target.value; }} />
      </div>
    ), () => {
      if (!title || !content) { toast('请填写标题和内容'); return; }
      setAnnouncements(prev => [...prev, { id:Date.now(), title, content, active:true }]);
      toast('公告已新增');
    });
  };

  return (
    <div className="px-4 pt-4 space-y-4 pb-4">
      <div className="flex gap-2">
        {[{key:'banners',label:'轮播图'},{key:'announcements',label:'公告'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${tab===t.key?'bg-[#0085FF] text-white':'bg-white text-gray-500 border border-gray-200'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'banners' && (
        <div className="space-y-3">
          {banners.map((b, i) => (
            <div key={b.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
              <div className="flex gap-3">
                <div className="w-24 h-16 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center text-gray-300 shrink-0">
                  {b.image ? <img src={b.image} className="w-full h-full object-cover" alt="" /> : <Image size={32} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="font-bold text-[14px] text-gray-900">{b.title}</span><span className="text-[10px] text-gray-400">排序:{b.sort}</span></div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => toggleBanner(b.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${b.active?'bg-[#0085FF]':'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${b.active?'translate-x-[22px]':'translate-x-[2px]'}`} />
                    </button>
                    <span className="text-[12px] text-gray-500">{b.active?'已启用':'已停用'}</span>
                    <button onClick={() => deleteBanner(b.id)} className="ml-auto text-red-400"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addBanner} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-[14px] font-medium">+ 新增轮播图</button>
        </div>
      )}

      {tab === 'announcements' && (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[15px] text-gray-900">{a.title}</h3>
                <button onClick={() => { setAnnouncements(prev => prev.map(x => x.id===a.id ? {...x, active:!x.active} : x)); toast('公告状态已更新'); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${a.active?'bg-[#0085FF]':'bg-gray-300'}`}>
                  <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${a.active?'translate-x-[22px]':'translate-x-[2px]'}`} />
                </button>
              </div>
              <p className="text-[12px] text-gray-500">{a.content}</p>
            </div>
          ))}
          <button onClick={addAnnouncement}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-[14px] font-medium">+ 新增公告</button>
        </div>
      )}
    </div>
  );
}
