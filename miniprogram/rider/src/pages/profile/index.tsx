import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { riderAPI } from '../../api';
import { toast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import { RiderProfile } from '../../types';

// 移植自 fronted/Rider/src/components/MineTab.tsx：骑手资料 + 余额/评分 + 菜单 + 退出。

export default function Profile() {
  const { logout } = useAuth();
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    try {
      const res: any = await riderAPI.me();
      if (res.code === 0) setRider(res.data);
    } catch {
      toast('加载个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    load();
  });

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '退出后需要重新登录才能继续接单。确认要退出吗？',
      success: (r) => {
        if (r.confirm) {
          logout();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  // TODO(扩展点): 个人资质/站点/历史记录/设置 —— 后端暂无对应接口，先占位提示。
  const menu = [
    { label: '个人资质', value: '已审核' },
    { label: '我的站点', value: rider?.station || '未分配' },
    { label: '历史记录', value: '' },
    { label: '设置', value: '' },
  ];

  if (loading) {
    return (
      <View className="w-full min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5] px-4 pt-4 pb-6">
      {/* 骑手资料 */}
      <View className="bg-white rounded-[16px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
        <View className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center">
          <Text className="text-[#0085FF] font-bold text-[24px]">骑</Text>
        </View>
        <View className="flex-1">
          <Text className="block font-bold text-[18px] text-gray-900">
            {rider?.real_name || '骑手'}
          </Text>
          <Text className="block text-gray-500 text-[13px] mt-1">
            评分: {rider?.rating} · 累计 {rider?.total_orders} 单
          </Text>
          <Text className="block text-[#00B578] text-[11px] font-bold mt-1.5">
            ✓ 实名已认证
          </Text>
        </View>
      </View>

      {/* 余额 / 评分 */}
      <View className="flex gap-3 mt-4">
        <View className="flex-1 bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <Text className="block text-gray-500 text-[12px]">账户余额</Text>
          <Text className="block text-[24px] font-bold text-[#0085FF] mt-1">
            ¥{rider?.balance || '0.00'}
          </Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <Text className="block text-gray-500 text-[12px]">综合评分</Text>
          <Text className="block text-[24px] font-bold text-[#00B578] mt-1">
            {rider?.rating}
            <Text className="text-[13px] font-normal">/5</Text>
          </Text>
        </View>
      </View>

      {/* 菜单 */}
      <View className="bg-white rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden mt-4">
        {menu.map((item, i) => (
          <View
            key={i}
            onClick={() => toast(`${item.label}功能开发中`)}
            className={`flex items-center justify-between p-4 ${
              i !== menu.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <Text className="font-bold text-gray-900 text-[15px]">{item.label}</Text>
            <View className="flex items-center gap-1">
              {item.value ? (
                <Text className="text-[13px] text-gray-400">{item.value}</Text>
              ) : null}
              <Text className="text-gray-400 text-[14px]">›</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 退出 */}
      <View
        onClick={handleLogout}
        className="w-full bg-[#FFDAD6] py-3.5 rounded-[16px] mt-6 flex items-center justify-center"
      >
        <Text className="text-[#93000A] font-bold text-[16px]">退出账号</Text>
      </View>
    </View>
  );
}
