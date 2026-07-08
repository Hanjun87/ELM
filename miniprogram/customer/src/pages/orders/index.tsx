import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderAPI } from '../../api';
import { toast } from '../../utils/toast';

const TABS = ['全部', '待付款', '进行中', '已完成'];

const statusMap: Record<string, string | undefined> = {
  全部: undefined,
  待付款: 'pending',
  进行中: 'paid,accepted,preparing,picked',
  已完成: 'delivered,finished',
};

const statusText: Record<string, string> = {
  pending: '待支付',
  paid: '待接单',
  accepted: '已接单',
  preparing: '准备中',
  ready: '待取餐',
  picked: '配送中',
  delivered: '已送达',
  finished: '已完成',
  cancelled: '已取消',
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState('全部');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async (tab: string) => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    try {
      setLoading(true);
      const response: any = await orderAPI.list(statusMap[tab]);
      if (response.code === 0) {
        setOrders(response.data.items || []);
      }
    } catch (error) {
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    loadOrders(activeTab);
  });

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    loadOrders(tab);
  };

  const pay = async (id: number) => {
    try {
      const res: any = await orderAPI.pay(id);
      if (res.code === 0) {
        toast('支付成功');
        loadOrders(activeTab);
      } else {
        toast(res.message || '支付失败');
      }
    } catch {
      toast('支付失败');
    }
  };

  const cancel = async (id: number) => {
    try {
      const res: any = await orderAPI.cancel(id);
      if (res.code === 0) {
        toast('已取消');
        loadOrders(activeTab);
      } else {
        toast(res.message || '取消失败');
      }
    } catch {
      toast('取消失败');
    }
  };

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5]">
      <View className="bg-white flex">
        {TABS.map((tab) => (
          <View
            key={tab}
            onClick={() => switchTab(tab)}
            className={`flex-1 py-3 text-center ${
              activeTab === tab
                ? 'text-[#0085FF] border-b-2 border-[#0085FF]'
                : 'text-gray-600'
            }`}
          >
            <Text className={activeTab === tab ? 'text-[#0085FF] font-medium' : 'text-gray-600'}>
              {tab}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className="p-4">
        {loading ? (
          <View className="text-center py-12">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="text-center py-12">
            <Text className="text-gray-400">暂无订单</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <View className="flex items-center justify-between mb-3">
                <View className="flex items-center gap-2">
                  {order.merchant_logo && (
                    <Image src={order.merchant_logo} className="w-8 h-8 rounded-full" />
                  )}
                  <Text className="font-bold text-[15px]">{order.merchant_name}</Text>
                </View>
                <Text className="text-[#0085FF] text-[13px] font-medium">
                  {statusText[order.status] || order.status}
                </Text>
              </View>

              <View className="mb-3">
                {(order.items_snapshot || []).slice(0, 3).map((item: any, idx: number) => (
                  <Text key={idx} className="block text-sm text-gray-600">
                    {item.name} x{item.quantity}
                  </Text>
                ))}
              </View>

              <View className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Text className="text-sm text-gray-500">
                  共 {(order.items_snapshot || []).length} 件
                  <Text className="ml-3 text-[16px] text-gray-900 font-bold">
                    ¥{order.paid_amount || order.total_amount}
                  </Text>
                </Text>
                <View className="flex gap-2">
                  {order.status === 'pending' && (
                    <>
                      <View
                        onClick={() => cancel(order.id)}
                        className="px-4 py-1.5 rounded-full border border-gray-300"
                      >
                        <Text className="text-[13px] text-gray-600">取消</Text>
                      </View>
                      <View
                        onClick={() => pay(order.id)}
                        className="px-4 py-1.5 rounded-full bg-[#0085FF]"
                      >
                        <Text className="text-[13px] text-white font-bold">去支付</Text>
                      </View>
                    </>
                  )}
                  {['paid', 'accepted', 'preparing', 'picked'].includes(order.status) && (
                    <View
                      onClick={() => Taro.navigateTo({ url: '/pages/order-progress/index' })}
                      className="px-4 py-1.5 rounded-full border border-[#0085FF]"
                    >
                      <Text className="text-[13px] text-[#0085FF] font-bold">查看进度</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
