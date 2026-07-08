import { useState, useEffect, useCallback } from 'react';
import { MapPin, Megaphone, Banknote, Bike, BadgePercent, Star, UserCog, ChevronRight, Loader2, LogOut } from 'lucide-react';
import { storeAPI } from '../api';
import { showModal, toast } from '@shared';
import { useAuth } from '../contexts/AuthContext';
import { Merchant } from '../types';

export default function SettingsTab({ openSubPage }: { openSubPage: (p: 'reviews' | 'campaigns') => void }) {
  const { logout } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response: any = await storeAPI.me();
      if (response.code === 0) setMerchant(response.data);
    } catch {
      toast('加载店铺信息失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleShop = async () => {
    if (!merchant) return;
    const next = merchant.status === 'open' ? 'closed' : 'open';
    try {
      const response: any = await storeAPI.toggle(next);
      if (response.code === 0) {
        setMerchant(response.data);
        toast(next === 'open' ? '店铺已恢复营业' : '店铺已休息');
      } else {
        toast(response.message || '操作失败');
      }
    } catch (e: any) {
      toast(e.response?.data?.message || '操作失败');
    }
  };

  const editSetting = (title: string, field: keyof Merchant, currentValue: string) => {
    let next = currentValue;
    showModal(title, '', <input defaultValue={currentValue} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" onChange={e => { next = e.target.value; }} />, async () => {
      try {
        const response: any = await storeAPI.update({ [field]: next });
        if (response.code === 0) { setMerchant(response.data); toast(title + ' 已更新'); }
        else toast(response.message || '更新失败');
      } catch (e: any) {
        toast(e.response?.data?.message || '更新失败');
      }
    });
  };

  if (loading || !merchant) {
    return <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>;
  }

  const sections = [
    {
      title: '店铺信息设置',
      items: [
        { icon: MapPin, label: '地址', value: merchant.address, action: () => editSetting('地址', 'address', merchant.address) },
        { icon: Megaphone, label: '店铺名', value: merchant.store_name, action: () => editSetting('店铺名', 'store_name', merchant.store_name) },
      ]
    },
    {
      title: '配送设置',
      items: [
        { icon: Banknote, label: '起送价', value: '¥' + merchant.min_order, action: () => editSetting('起送价', 'min_order', merchant.min_order) },
        { icon: Bike, label: '配送费', value: '¥' + merchant.delivery_fee, action: () => editSetting('配送费', 'delivery_fee', merchant.delivery_fee) },
      ]
    },
    {
      title: '营销活动配置',
      items: [
        { icon: BadgePercent, label: '营销活动', value: '查看全部', action: () => openSubPage('campaigns') },
      ]
    },
  ];

  return (
    <div className="pb-4">
      <div className="bg-white mx-4 mt-4 rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#0085FF] text-[24px] font-bold">店</div>
          <div>
            <h2 className="font-bold text-[17px] text-gray-900">{merchant.store_name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full ${merchant.status === 'open' ? 'bg-[#00B578]' : 'bg-gray-400'}`} />
              <span className="text-[12px] text-gray-500">{merchant.status === 'open' ? '营业中' : '休息中'}</span>
            </div>
          </div>
        </div>
        <button onClick={toggleShop}
          className={`relative w-14 h-7 rounded-full transition-colors ${merchant.status === 'open' ? 'bg-[#00B578]' : 'bg-gray-300'}`}>
          <div className={`absolute top-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform ${merchant.status === 'open' ? 'translate-x-[25px]' : 'translate-x-[3px]'}`} />
        </button>
      </div>

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
                <span className="text-[12px] text-gray-400 truncate max-w-[100px]">{item.value}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      ))}

      <div className="bg-white mx-4 mt-3 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
        {[
          { icon: Star, label: '评价管理', action: () => openSubPage('reviews') },
          { icon: UserCog, label: '账号设置', action: () => toast('账号设置') },
          { icon: LogOut, label: '退出登录', action: logout },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < 2 ? 'border-b border-gray-50' : ''}`}>
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-[#0085FF]" />
              <span className="text-[14px] font-medium text-gray-800">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
