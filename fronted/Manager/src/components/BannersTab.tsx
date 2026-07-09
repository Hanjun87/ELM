import { useState } from 'react';
import { Image, Bell, Plus, Trash2 } from 'lucide-react';
import { toast, showModal } from '@shared';

interface Banner {
  id: number; title: string; imageUrl: string; linkUrl: string;
  order: number; isActive: boolean;
}

interface Announcement {
  id: number; title: string; content: string; publishedAt: string; isActive: boolean;
}

const mockBanners: Banner[] = [
  { id: 1, title: '新用户专享', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', linkUrl: '/newuser', order: 1, isActive: true },
  { id: 2, title: '周末特惠', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', linkUrl: '/weekend', order: 2, isActive: true },
];

const mockAnnouncements: Announcement[] = [
  { id: 1, title: '平台维护通知', content: '2026年7月10日凌晨2:00-4:00进行系统维护，期间无法下单。', publishedAt: '2026-07-05', isActive: true },
  { id: 2, title: '配送费调整公告', content: '自7月15日起，配送费统一调整为6元/单。', publishedAt: '2026-07-03', isActive: true },
];

export default function BannersTab() {
  const [banners, setBanners]         = useState<Banner[]>(mockBanners);
  const [announcements, setAnnounce]  = useState<Announcement[]>(mockAnnouncements);

  const toggleBanner = (id: number) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
    toast('状态已更新');
  };

  const deleteBanner = (id: number) => {
    showModal('删除轮播图', '确认删除此轮播图？', null, () => {
      setBanners(prev => prev.filter(b => b.id !== id));
      toast('已删除');
    });
  };

  const toggleAnnouncement = (id: number) => {
    setAnnounce(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    toast('状态已更新');
  };

  const deleteAnnouncement = (id: number) => {
    showModal('删除公告', '确认删除此公告？', null, () => {
      setAnnounce(prev => prev.filter(a => a.id !== id));
      toast('已删除');
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">内容运营</h1>
        <p className="text-sm text-gray-500 mt-0.5">管理首页轮播图与平台公告</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Banners */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image size={18} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">首页轮播图</h2>
              <span className="text-xs text-gray-400">（{banners.length} 张）</span>
            </div>
            <button
              onClick={() => toast('暂不支持')}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0085FF] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={14} /> 添加轮播图
            </button>
          </div>

          <div className="space-y-3">
            {banners.map(b => (
              <div key={b.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                <div className="relative">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-40 object-cover" />
                  {!b.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
                      已下线
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{b.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">跳转: {b.linkUrl}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      b.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {b.isActive ? '已上线' : '已下线'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBanner(b.id)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      {b.isActive ? '下线' : '上线'}
                    </button>
                    <button
                      onClick={() => deleteBanner(b.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400 text-sm border border-gray-100">
                暂无轮播图
              </div>
            )}
          </div>
        </div>

        {/* Right: Announcements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">平台公告</h2>
              <span className="text-xs text-gray-400">（{announcements.length} 条）</span>
            </div>
            <button
              onClick={() => toast('暂不支持')}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0085FF] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={14} /> 发布公告
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm flex-1">{a.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
                    a.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {a.isActive ? '已发布' : '已下线'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{a.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">发布于 {a.publishedAt}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAnnouncement(a.id)}
                      className="px-3 py-1 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      {a.isActive ? '下线' : '上线'}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(a.id)}
                      className="px-3 py-1 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400 text-sm border border-gray-100">
                暂无公告
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
