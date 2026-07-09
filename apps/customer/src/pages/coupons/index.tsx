import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { http } from '../../api/config';

interface Coupon {
  id: number;
  name: string;
  discount_amount: string;
  min_spend: string;
  valid_until: string;
  status: string;
}

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<'unused' | 'used'>('unused');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoupons = async (tab: 'unused' | 'used') => {
    try {
      setLoading(true);
      // 注意：promotions 应用后端未接入路由，此接口可能 404，页面降级为空态
      const response: any = await http.get('/user/coupons/', { status: tab });
      if (response.code === 0) {
        setCoupons(
          (response.data.items || []).map((item: any) => ({
            id: item.id,
            name: item.coupon.name,
            discount_amount: item.coupon.discount_amount,
            min_spend: item.coupon.min_spend,
            valid_until: item.coupon.valid_until,
            status: item.status,
          }))
        );
      } else {
        setCoupons([]);
      }
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    loadCoupons(activeTab);
  });

  const switchTab = (tab: 'unused' | 'used') => {
    setActiveTab(tab);
    loadCoupons(tab);
  };

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5]">
      <View className="bg-white flex">
        {(['unused', 'used'] as const).map((tab) => (
          <View
            key={tab}
            onClick={() => switchTab(tab)}
            className={`flex-1 py-3 text-center ${
              activeTab === tab ? 'border-b-2 border-[#0085FF]' : ''
            }`}
          >
            <Text className={activeTab === tab ? 'text-[#0085FF] font-medium' : 'text-gray-600'}>
              {tab === 'unused' ? '未使用' : '已使用'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className="p-4">
        {loading ? (
          <View className="text-center py-12">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : coupons.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Text className="text-4xl mb-3">🎫</Text>
            <Text className="text-gray-400">暂无优惠券</Text>
          </View>
        ) : (
          coupons.map((coupon) => (
            <View
              key={coupon.id}
              className={`bg-white rounded-2xl p-4 shadow-sm mb-3 ${
                coupon.status === 'used' ? 'opacity-50' : ''
              }`}
            >
              <View className="flex items-center gap-3">
                <View className="flex-1">
                  <Text className="block font-bold text-lg text-[#FF5000]">
                    ¥{coupon.discount_amount}
                  </Text>
                  <Text className="block text-sm text-gray-600 mt-1">{coupon.name}</Text>
                  <Text className="block text-xs text-gray-400 mt-1">满¥{coupon.min_spend}可用</Text>
                </View>
                {coupon.status === 'unused' && (
                  <View className="px-6 py-2 bg-[#0085FF] rounded-full">
                    <Text className="text-white text-sm font-bold">立即使用</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
