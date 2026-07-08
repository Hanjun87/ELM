import React, { useState, useEffect } from 'react';
import { BadgeCheck, Edit, FileBadge, MapPin, History, Settings, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { showModal, toast } from '@shared';
import { useAuth } from '../contexts/AuthContext';
import { riderAPI } from '../api';

interface RiderProfile {
  id: number;
  real_name: string;
  station: string | null;
  work_status: string;
  balance: string;
  total_orders: number;
  rating: string;
}

export default function MineTab() {
  const { logout } = useAuth();
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riderAPI.me().then((res: any) => {
      if (res.code === 0) setRider(res.data);
    }).catch(() => toast('加载个人信息失败')).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    showModal('退出登录', '确认要退出登录吗？', <p className="text-[13px] text-gray-500">退出后需要重新登录才能继续接单。</p>, logout);
  };

  if (loading) {
    return (
      <main className="flex-1 mt-14 pb-28 px-4 overflow-y-auto bg-[#F5F5F5] pt-4">
        <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>
      </main>
    );
  }

  return (
    <main className="flex-1 mt-14 pb-28 px-4 overflow-y-auto bg-[#F5F5F5] pt-4 space-y-4">
      <section className="bg-white rounded-[16px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0085FF] font-bold text-2xl">骑</div>
        <div className="flex-1">
          <h2 className="font-bold text-[18px] text-gray-900">{rider?.real_name || '骑手'}</h2>
          <p className="text-gray-500 text-[13px] mt-1">评分: {rider?.rating} · 累计 {rider?.total_orders} 单</p>
          <div className="flex items-center gap-1 mt-1.5 text-[#00B578]">
            <BadgeCheck size={14} />
            <span className="text-[11px] font-bold">实名已认证</span>
          </div>
        </div>
        <button onClick={() => toast('编辑资料功能开发中')} className="text-[#0085FF] hover:bg-blue-50 p-2 rounded-full transition-colors active:scale-95">
          <Edit size={20} />
        </button>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
          <span className="text-gray-500 text-[12px]">账户余额</span>
          <span className="text-[24px] font-bold text-[#0085FF] mt-1 leading-none">¥{rider?.balance || '0.00'}</span>
        </div>
        <div className="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
          <span className="text-gray-500 text-[12px]">综合评分</span>
          <span className="text-[24px] font-bold text-[#00B578] mt-1 leading-none">{rider?.rating}<span className="text-[13px] font-normal">/5</span></span>
        </div>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
        {[
          { icon: <FileBadge size={20} className="text-[#0085FF]" />, label: '个人资质', value: '已审核', valueColor: 'text-gray-400' },
          { icon: <MapPin size={20} className="text-[#FF5000]" />, label: '我的站点', value: rider?.station || '未分配', valueColor: 'text-gray-400' },
          { icon: <History size={20} className="text-[#00B578]" />, label: '历史记录', value: undefined, valueColor: '' },
          { icon: <Settings size={20} className="text-gray-600" />, label: '设置', value: undefined, valueColor: '' },
        ].map((item, index) => (
          <button key={index} onClick={() => toast(`${item.label}功能开发中`)}
            className={`w-full flex items-center justify-between p-4 active:bg-gray-50 ${index !== 3 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">{item.icon}</div>
              <span className="font-bold text-gray-900 text-[15px]">{item.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {item.value && <span className={`text-[13px] ${item.valueColor}`}>{item.value}</span>}
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4 pb-2">
        <button onClick={handleLogout} className="w-full bg-[#FFDAD6] text-[#93000A] py-3.5 rounded-[16px] font-bold text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <LogOut size={20} />
          退出账号
        </button>
      </div>
    </main>
  );
}
