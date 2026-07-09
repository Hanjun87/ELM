import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderAPI } from '../../api';
import { toast } from '../../utils/toast';
import { RiderOrder } from '../../types';

// 历史配送：从 /rider/orders/mine/ 里筛出已送达（delivered）的订单。
// 对应 Web 端 TasksTab 的「已完成」分组。

function itemsSummaryLocal(items: RiderOrder['items_snapshot']): string {
  return (items || []).map((i) => `${i.name} x${i.quantity}`).join('、') || '无商品明细';
}

export default function History() {
  const [mine, setMine] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    try {
      setLoading(true);
      const res: any = await orderAPI.mine();
      if (res.code === 0) setMine(res.data.items || []);
    } catch {
      toast('加载历史失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    load();
  });

  const completed = mine.filter((o) => o.status === 'delivered');

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5]">
      <ScrollView scrollY className="px-4 pt-4 pb-4">
        {loading ? (
          <View className="text-center py-16">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : completed.length === 0 ? (
          <View className="text-center py-16">
            <Text className="text-gray-400 text-[13px]">暂无历史配送</Text>
          </View>
        ) : (
          completed.map((o) => (
            <View
              key={o.id}
              className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-3"
            >
              <View className="flex justify-between items-center mb-2">
                <Text className="font-bold text-[15px] text-gray-900">
                  {o.order_no}
                </Text>
                <Text className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-[#00B578]">
                  已送达
                </Text>
              </View>
              <Text className="block text-[12px] text-gray-500">
                {o.merchant_name}
              </Text>
              <Text className="block text-[13px] text-gray-700 mt-1">
                {itemsSummaryLocal(o.items_snapshot)}
              </Text>
              <View className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <Text className="text-[12px] text-gray-500">
                  {o.address_snapshot.address || '地址信息缺失'}
                </Text>
                <Text className="font-bold text-[16px] text-[#0085FF]">
                  ¥{o.paid_amount}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
