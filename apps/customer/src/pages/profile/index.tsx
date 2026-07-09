import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toast';

const TOOLS = [
  { icon: '📍', label: '收货地址', url: '/pages/address/index' },
  { icon: '🎫', label: '优惠券', url: '/pages/coupons/index' },
  { icon: '❤️', label: '我的收藏', url: '/pages/favorites/index' },
  { icon: '💬', label: '我的评价', url: '' },
  { icon: '🎧', label: '联系客服', url: '' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [phone, setPhone] = useState('');

  useDidShow(() => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    setPhone(user?.phone || Taro.getStorageSync('user')?.phone || '');
  });

  const handleTool = (url: string, label: string) => {
    if (url) {
      Taro.navigateTo({ url });
    } else {
      toast(`${label}功能开发中`);
    }
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  const maskPhone = (p: string) =>
    p && p.length === 11 ? `${p.slice(0, 3)}****${p.slice(7)}` : p;

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5]">
      {/* 用户信息 */}
      <View className="px-5 pt-6 pb-7 bg-white rounded-b-[24px] shadow-sm">
        <View className="flex items-center gap-4">
          <Image
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
            className="w-16 h-16 rounded-full"
          />
          <View className="flex-1">
            <Text className="block text-[20px] font-extrabold text-gray-900">美食家</Text>
            <Text className="block text-[13px] text-gray-500 mt-1">
              {maskPhone(phone) || '未登录'}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        {/* 资产 */}
        <View className="bg-white rounded-[16px] p-4 shadow-sm flex">
          {[
            { val: '12', label: '红包' },
            { val: '5', label: '优惠券' },
            { val: '500', label: '金币' },
          ].map((item) => (
            <View key={item.label} className="flex-1 flex flex-col items-center py-2">
              <Text className="font-extrabold text-[22px] text-[#FF5000]">{item.val}</Text>
              <Text className="text-[12px] text-gray-600 mt-2">{item.label}</Text>
            </View>
          ))}
        </View>

        {/* 常用功能 */}
        <Text className="block font-bold text-[15px] text-gray-900 mb-3 mt-5 px-2">常用功能</Text>
        <View className="bg-white rounded-[16px] p-5 shadow-sm flex flex-wrap">
          {TOOLS.map((tool) => (
            <View
              key={tool.label}
              onClick={() => handleTool(tool.url, tool.label)}
              className="w-1/4 flex flex-col items-center gap-2 mb-2"
            >
              <View className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Text className="text-xl">{tool.icon}</Text>
              </View>
              <Text className="text-[12px] text-gray-600">{tool.label}</Text>
            </View>
          ))}
        </View>

        {/* 退出登录 */}
        <View
          onClick={handleLogout}
          className="w-full bg-white py-3.5 rounded-[12px] shadow-sm mt-5 flex items-center justify-center"
        >
          <Text className="text-red-500 font-bold text-[15px]">退出登录</Text>
        </View>
      </View>
    </View>
  );
}
