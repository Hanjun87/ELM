import { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderAPI, riderAPI } from '../../api';
import { toast } from '../../utils/toast';
import { RiderOrder } from '../../types';

// 移植自 fronted/Rider/src/App.tsx 的「工作台」：开工开关 + 搜索 + 待抢订单列表。

export default function Available() {
  const [isWorking, setIsWorking] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    try {
      setLoading(true);
      const res: any = await orderAPI.available();
      if (res.code === 0) setOrders(res.data.items || []);
    } catch {
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
    // 同步开工状态
    try {
      const me: any = await riderAPI.me();
      if (me.code === 0) setIsWorking(me.data.work_status !== 'offline');
    } catch {
      /* 忽略 */
    }
  };

  useDidShow(() => {
    load();
  });

  const toggleWorking = async () => {
    const next = !isWorking;
    try {
      const res: any = await riderAPI.setStatus(next ? 'idle' : 'offline');
      if (res.code === 0) {
        setIsWorking(next);
        toast(next ? '已开工' : '已下线');
      } else toast(res.message || '操作失败');
    } catch (e: any) {
      toast(e?.data?.message || '操作失败');
    }
  };

  const handleGrab = async (id: number, orderNo: string) => {
    try {
      const res: any = await orderAPI.grab(id);
      if (res.code === 0) {
        toast('抢单成功 ' + orderNo);
        load();
      } else toast(res.message || '抢单失败');
    } catch (e: any) {
      toast(e?.data?.message || '抢单失败');
    }
  };

  const visibleOrders = searchText.trim()
    ? orders.filter(
        (o) =>
          o.merchant_name.includes(searchText) || o.order_no.includes(searchText)
      )
    : orders;

  return (
    <ScrollView scrollY className="w-full min-h-screen bg-[#F5F5F5] px-4 pb-4">
      {/* 开工状态卡片 */}
      <View className="mt-4 p-4 bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center justify-between">
        <View className="flex flex-col">
          <Text className="text-gray-500 text-[12px] font-medium">当前状态</Text>
          <Text className="font-bold text-[18px] text-gray-900 mt-0.5">
            {isWorking ? '正在开工' : '休息中'}
          </Text>
        </View>
        <View
          onClick={toggleWorking}
          className={`relative w-[52px] h-[30px] rounded-full ${
            isWorking ? 'bg-[#00B578]' : 'bg-gray-300'
          }`}
        >
          <View
            className={`absolute top-1 w-[22px] h-[22px] bg-white rounded-full shadow-sm ${
              isWorking ? 'translate-x-[24px]' : 'translate-x-[4px]'
            }`}
          />
        </View>
      </View>

      {/* 搜索框 */}
      <View className="mt-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-2.5 px-4 rounded-full flex items-center gap-2.5 border border-gray-100">
        <Text className="text-gray-400 text-[16px]">🔍</Text>
        <Input
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          placeholder="搜索订单或商户"
          className="flex-1 text-[14px] text-gray-800"
        />
      </View>

      {/* 待抢订单 */}
      <View className="flex items-center gap-2 mt-7 mb-4 px-1">
        <Text className="font-bold text-gray-900 text-[17px]">待抢订单</Text>
        <Text className="bg-[#FF5000] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
          {visibleOrders.length}
        </Text>
      </View>

      {loading ? (
        <View className="text-center py-16">
          <Text className="text-gray-400">加载中...</Text>
        </View>
      ) : visibleOrders.length === 0 ? (
        <View className="text-center py-8">
          <Text className="text-gray-400 text-[13px]">暂无可接订单</Text>
        </View>
      ) : (
        visibleOrders.map((order) => (
          <View
            key={order.id}
            className="bg-white p-4 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-3.5"
          >
            <View className="flex justify-between items-start mb-4">
              <View className="flex items-center gap-2.5">
                <Text className="text-gray-900 font-bold text-[14px]">
                  {order.merchant_name}
                </Text>
                <Text className="text-gray-500 text-[12px] font-medium">
                  {order.order_no}
                </Text>
              </View>
              <Text className="text-[#FF5000] font-bold text-[20px]">
                ¥{order.paid_amount}
              </Text>
            </View>

            <View className="flex gap-3">
              <View className="w-2 h-2 rounded-full bg-[#FF5000] mt-1.5" />
              <Text className="text-gray-700 text-[14px] flex-1">
                {order.address_snapshot.address || '地址信息缺失'}
              </Text>
            </View>

            <View
              onClick={() => handleGrab(order.id, order.order_no)}
              className="w-full bg-[#0085FF] py-3.5 rounded-[12px] mt-5 flex items-center justify-center"
            >
              <Text className="text-white font-bold text-[16px]">立即抢单</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
