import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { storeAPI } from '../../api';
import { toast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import { Merchant } from '../../types';

// 移植自 fronted/Merchant/src/components/SettingsTab.tsx
// 店铺信息 + 营业开关 + 可编辑字段（弹窗输入）+ 退出登录。

export default function Profile() {
  const { logout } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    try {
      const res: any = await storeAPI.me();
      if (res.code === 0) setMerchant(res.data);
    } catch {
      toast('加载店铺信息失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    load();
  });

  const toggleShop = async () => {
    if (!merchant) return;
    const next = merchant.status === 'open' ? 'closed' : 'open';
    try {
      const res: any = await storeAPI.toggle(next);
      if (res.code === 0) {
        setMerchant(res.data);
        toast(next === 'open' ? '店铺已恢复营业' : '店铺已休息');
      } else toast(res.message || '操作失败');
    } catch (e: any) {
      toast(e?.data?.message || '操作失败');
    }
  };

  // 用微信原生 showModal + editable 弹窗输入更新单个字段
  const editSetting = (title: string, field: keyof Merchant, currentValue: string) => {
    // Taro 类型未覆盖 editable/content，用 any 传入（微信原生支持）
    Taro.showModal({
      title: `修改${title}`,
      editable: true,
      placeholderText: `请输入${title}`,
      content: currentValue,
      success: async (r: any) => {
        if (!r.confirm) return;
        const next = (r.content || '').trim();
        if (!next) {
          toast(`${title}不能为空`);
          return;
        }
        try {
          const res: any = await storeAPI.update({ [field]: next });
          if (res.code === 0) {
            setMerchant(res.data);
            toast(`${title} 已更新`);
          } else toast(res.message || '更新失败');
        } catch (e: any) {
          toast(e?.data?.message || '更新失败');
        }
      },
    } as any);
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (r) => {
        if (r.confirm) {
          logout();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  if (loading || !merchant) {
    return (
      <View className="w-full min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    );
  }

  const sections: { title: string; items: { label: string; value: string; action: () => void }[] }[] = [
    {
      title: '店铺信息设置',
      items: [
        { label: '店铺名', value: merchant.store_name, action: () => editSetting('店铺名', 'store_name', merchant.store_name) },
        { label: '地址', value: merchant.address, action: () => editSetting('地址', 'address', merchant.address) },
      ],
    },
    {
      title: '配送设置',
      items: [
        { label: '起送价', value: '¥' + merchant.min_order, action: () => editSetting('起送价', 'min_order', merchant.min_order) },
        { label: '配送费', value: '¥' + merchant.delivery_fee, action: () => editSetting('配送费', 'delivery_fee', merchant.delivery_fee) },
      ],
    },
  ];

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5] pb-6">
      {/* 店铺头部 + 营业开关 */}
      <View className="bg-white mx-4 mt-4 rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <View className="flex items-center gap-4">
          <View className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <Text className="text-[#0085FF] text-[24px] font-bold">店</Text>
          </View>
          <View>
            <Text className="block font-bold text-[17px] text-gray-900">
              {merchant.store_name}
            </Text>
            <View className="flex items-center gap-1.5 mt-1">
              <View
                className={`w-2 h-2 rounded-full ${
                  merchant.status === 'open' ? 'bg-[#00B578]' : 'bg-gray-400'
                }`}
              />
              <Text className="text-[12px] text-gray-500">
                {merchant.status === 'open' ? '营业中' : '休息中'}
              </Text>
            </View>
          </View>
        </View>
        <View
          onClick={toggleShop}
          className={`relative w-14 h-7 rounded-full ${
            merchant.status === 'open' ? 'bg-[#00B578]' : 'bg-gray-300'
          }`}
        >
          <View
            className={`absolute top-[3px] w-5 h-5 bg-white rounded-full shadow ${
              merchant.status === 'open' ? 'translate-x-[25px]' : 'translate-x-[3px]'
            }`}
          />
        </View>
      </View>

      {/* 设置分组 */}
      {sections.map((sec, si) => (
        <View
          key={si}
          className="bg-white mx-4 mt-3 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden"
        >
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="font-bold text-[14px] text-gray-900">{sec.title}</Text>
          </View>
          {sec.items.map((item, ii) => (
            <View
              key={ii}
              onClick={item.action}
              className={`flex items-center justify-between px-4 py-3.5 ${
                ii < sec.items.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <Text className="text-[14px] font-medium text-gray-800">{item.label}</Text>
              <View className="flex items-center gap-2">
                <Text className="text-[12px] text-gray-400">{item.value}</Text>
                <Text className="text-gray-300 text-[14px]">›</Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* 其他 */}
      <View className="bg-white mx-4 mt-3 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* TODO(扩展点): 评价管理 —— 后端 reviewAPI 已就绪，可新增 reviews 页面接入 */}
        <View
          onClick={() => toast('评价管理开发中')}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
        >
          <Text className="text-[14px] font-medium text-gray-800">评价管理</Text>
          <Text className="text-gray-300 text-[14px]">›</Text>
        </View>
        <View
          onClick={() => toast('账号设置开发中')}
          className="flex items-center justify-between px-4 py-3.5"
        >
          <Text className="text-[14px] font-medium text-gray-800">账号设置</Text>
          <Text className="text-gray-300 text-[14px]">›</Text>
        </View>
      </View>

      {/* 退出登录 */}
      <View
        onClick={handleLogout}
        className="bg-white mx-4 mt-3 py-3.5 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center"
      >
        <Text className="text-red-500 font-bold text-[15px]">退出登录</Text>
      </View>
    </View>
  );
}
