import { useState } from 'react';
import { MapPin, Megaphone, Clock, Banknote, Bike, BadgePercent, Star, UserCog, ChevronRight } from 'lucide-react';
import { getShopOpen, setShopOpen, subscribe } from '../store';
import { showModal, toast } from '@shared';

export default function SettingsTab({ openSubPage }: { openSubPage: (p: 'reviews' | 'campaigns') => void }) {
  const [shopOpen, setOpen] = useState(getShopOpen());
  const toggleShop = () => { const v = !shopOpen; setOpen(v); setShopOpen(v); toast(v ? '店铺已恢复营业' : '店铺已休息'); };

  const [settingValues, setSettingValues] = useState({
    addr: '科技路12号软件园A座',
    notice: '欢迎光临，新店开业享八折优惠...',
    hours: '09:00 - 22:00',
    minOrder: '20',
    deliveryFee: '5',
  });

  const editSetting = (title: string, key: keyof typeof settingValues) => {
    let next = settingValues[key];
    showModal(title, '', <input defaultValue={settingValues[key]} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" onChange={e => { next = e.target.value; }} />, () => {
      setSettingValues(prev => ({ ...prev, [key]: next }));
      toast(title + ' 已更新');
    });
  };

  const sections = [
    {
      title: '店铺信息设置',
      items: [
        { icon: MapPin, label: '地址', value: settingValues.addr, action: () => editSetting('地址', 'addr') },
        { icon: Megaphone, label: '公告', value: settingValues.notice, action: () => editSetting('公告', 'notice') },
        { icon: Clock, label: '营业时间', value: settingValues.hours, action: () => editSetting('营业时间', 'hours') },
      ]
    },
    {
      title: '配送设置',
      items: [
        { icon: Banknote, label: '起送价', value: '¥' + settingValues.minOrder, action: () => editSetting('起送价', 'minOrder') },
        { icon: Bike, label: '配送费', value: '¥' + settingValues.deliveryFee, action: () => editSetting('配送费', 'deliveryFee') },
      ]
    },
    {
      title: '营销活动配置',
      items: [
        { icon: BadgePercent, label: '满减活动', value: '满30减5', badge: '进行中', action: () => openSubPage('campaigns') },
        { icon: BadgePercent, label: '折扣商品', value: '未配置', action: () => toast('请前往商品管理设置折扣') },
      ]
    },
  ];

  return (
    <div className="pb-4">
      {/* Shop card */}
      <div className="bg-white mx-4 mt-4 rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#0085FF] text-[24px] font-bold">店</div>
          <div>
            <h2 className="font-bold text-[17px] text-gray-900">美味坊 (高新店)</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full ${shopOpen ? 'bg-[#00B578]' : 'bg-gray-400'}`} />
              <span className="text-[12px] text-gray-500">{shopOpen ? '营业中' : '休息中'}</span>
            </div>
          </div>
        </div>
        <button onClick={toggleShop}
          className={`relative w-14 h-7 rounded-full transition-colors ${shopOpen ? 'bg-[#00B578]' : 'bg-gray-300'}`}>
          <div className={`absolute top-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform ${shopOpen ? 'translate-x-[25px]' : 'translate-x-[3px]'}`} />
        </button>
      </div>

      {/* Setting sections */}
      {sections.map((sec, si) => (
        <div key={si} className="bg-white mx-4 mt-3 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100"><h3 className="font-bold text-[14px] text-gray-900">{sec.title}</h3></div>
          {sec.items.map((item, ii) => (
            <button key={ii} onClick={item.action}
              className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors ${ii < sec.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-[#0085FF]" />
                <span className="text-[14px] font-medium text-gray-800">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && <span className="px-2 py-0.5 rounded text-[10px] bg-red-50 text-[#FF5000] font-medium">{item.badge}</span>}
                <span className="text-[12px] text-gray-400 truncate max-w-[100px]">{item.value}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      ))}

      {/* Management */}
      <div className="bg-white mx-4 mt-3 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
        {[
          { icon: Star, label: '评价管理', badge: true, action: () => openSubPage('reviews') },
          { icon: UserCog, label: '账号设置', action: () => toast('账号设置') },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors ${i === 0 ? 'border-b border-gray-50' : ''}`}>
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-[#0085FF]" />
              <span className="text-[14px] font-medium text-gray-800">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && <div className="w-2 h-2 bg-[#FF5000] rounded-full" />}
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </button>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
