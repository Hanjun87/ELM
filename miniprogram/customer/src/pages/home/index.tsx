import { useState } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { merchantAPI } from '../../api';
import { toast } from '../../utils/toast';
import type { Merchant } from '../../types';

export default function Home() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMerchants = async () => {
    try {
      const response: any = await merchantAPI.list();
      if (response.code === 0) {
        setMerchants(response.data.items || []);
      }
    } catch (error) {
      toast('加载商家失败');
    } finally {
      setLoading(false);
    }
  };

  // 每次显示时检查登录态；未登录跳登录页
  useDidShow(() => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    loadMerchants();
  });

  usePullDownRefresh(async () => {
    await loadMerchants();
    Taro.stopPullDownRefresh();
  });

  const openStore = (id: number) => {
    Taro.navigateTo({ url: `/pages/store/index?id=${id}` });
  };

  return (
    <ScrollView scrollY className="w-full min-h-screen">
      <View className="p-4 bg-white shadow-sm">
        <View className="flex gap-2">
          <View className="flex-1 bg-gray-50 rounded-full px-4 py-2 flex items-center gap-2">
            <Text className="text-gray-400 text-sm">🔍</Text>
            <Input placeholder="搜索商家或商品" className="bg-transparent flex-1 text-sm" />
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="block font-bold text-lg mb-3">附近商家</Text>

        {loading ? (
          <View className="text-center py-12">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : merchants.length === 0 ? (
          <View className="text-center py-12">
            <Text className="text-gray-400">暂无商家</Text>
          </View>
        ) : (
          merchants.map((merchant) => (
            <View
              key={merchant.id}
              onClick={() => openStore(merchant.id)}
              className="bg-white rounded-2xl p-4 shadow-sm mb-3"
            >
              <View className="flex gap-3">
                <Image
                  src={merchant.logo}
                  mode="aspectFill"
                  className="w-20 h-20 rounded-xl"
                />
                <View className="flex-1">
                  <Text className="block font-bold text-base">{merchant.store_name}</Text>
                  <View className="flex items-center gap-2 mt-1">
                    <Text className="text-orange-500 text-sm">⭐ {merchant.rating}</Text>
                    <Text className="text-gray-400 text-sm">月售{merchant.monthly_sales}</Text>
                  </View>
                  <View className="flex items-center gap-2 mt-2">
                    <Text className="text-xs text-gray-500">起送¥{merchant.min_order}</Text>
                    <Text className="text-xs text-gray-500">配送¥{merchant.delivery_fee}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
