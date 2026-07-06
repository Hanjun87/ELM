import React from 'react';
import { BadgeCheck, Edit, FileBadge, MapPin, History, Settings, ChevronRight, LogOut } from 'lucide-react';
import { toast } from '@shared';

export default function MineTab() {
  const handleEdit = () => {
    toast('编辑资料功能开发中');
  };

  const handleMenuItem = (label: string) => {
    toast(`${label}功能开发中`);
  };

  const handleLogout = () => {
    if (confirm('确认退出登录吗？')) {
      toast('退出成功');
      // 实际应用中应该清除登录状态并跳转到登录页
    }
  };

  return (
    <main className="flex-1 mt-14 pb-28 px-4 overflow-y-auto bg-[#F5F5F5] pt-4 space-y-4">
      {/* Rider Identity */}
      <section className="bg-white rounded-[16px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-[#0085FF]/20">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYcYYsx3Q7GeNvIUicOAqiIc8JjJaD0dNBb0LI1l80lSXe7dXdoCtRRiS7wFu0EzOvJFw8oTqpf-o_TOVjD-dPK6umzQ6iKB7rUmwq-1QuDjMwfAIKGS69qByaZoESY9r8HwUNx0ThRaxkq-0s5Wu80-wJDHZK0ZsNs_jov7LJ5ISee8CrVfZ3APrHQI5JJtchzVXXvHWle0sx_OxJyGQPaJRjC7SIUNTZ5vaHv2ktnYveClR7TeR9" 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[18px] text-gray-900">张师傅</h2>
            <span className="bg-[#0085FF] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">钻石骑手</span>
          </div>
          <p className="text-gray-500 text-[13px] mt-1">骑手 ID: 88293401</p>
          <div className="flex items-center gap-1 mt-1.5 text-[#00B578]">
            <BadgeCheck size={14} />
            <span className="text-[11px] font-bold">实名已认证</span>
          </div>
        </div>
        <button onClick={handleEdit} className="text-[#0085FF] hover:bg-blue-50 p-2 rounded-full transition-colors active:scale-95">
          <Edit size={20} />
        </button>
      </section>

      {/* Bento Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
          <span className="text-gray-500 text-[12px]">今日送达</span>
          <span className="text-[24px] font-bold text-[#0085FF] mt-1 leading-none">42 <span className="text-[13px] font-normal">单</span></span>
        </div>
        <div className="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
          <span className="text-gray-500 text-[12px]">好评率</span>
          <span className="text-[24px] font-bold text-[#00B578] mt-1 leading-none">99.8<span className="text-[13px] font-normal">%</span></span>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
        {[
          { icon: <FileBadge size={20} className="text-[#0085FF]" />, label: '个人资质', value: '已审核', valueColor: 'text-gray-400' },
          { icon: <MapPin size={20} className="text-[#FF5000]" />, label: '我的站点', value: '中关村配送站', valueColor: 'text-gray-400' },
          { icon: <History size={20} className="text-[#00B578]" />, label: '历史记录' },
          { icon: <Settings size={20} className="text-gray-600" />, label: '设置' },
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => handleMenuItem(item.label)}
            className={`w-full flex items-center justify-between p-4 active:bg-gray-50 ${index !== 3 ? 'border-b border-gray-100' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-bold text-gray-900 text-[15px]">{item.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {item.value && <span className={`text-[13px] ${item.valueColor}`}>{item.value}</span>}
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Action Button */}
      <div className="pt-4 pb-2">
        <button onClick={handleLogout} className="w-full bg-[#FFDAD6] text-[#93000A] py-3.5 rounded-[16px] font-bold text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <LogOut size={20} />
          退出账号
        </button>
        <p className="text-center text-gray-400 text-[11px] mt-4">版本 5.24.1 (Build 20231024)</p>
      </div>
    </main>
  );
}
