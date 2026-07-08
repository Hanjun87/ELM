import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderAPI } from '../../api';
import { toast } from '../../utils/toast';
import { Order, itemsSummary, itemsQty } from '../../types';

// 移植自 fronted/Merchant/src/components/OrdersTab.tsx

const STATUS_LABELS: Record<string, string> = {
  pending: '待支付',
  paid: '待接单',
  accepted: '待出餐',
  preparing: '备餐中',
  ready: '待取餐',
  picked: '配送中',
  delivered: '已送达',
  finished: '已完成',
  cancelled: '已取消',
};

const TABS: { key: string; label: string }[] = [
  { key: 'paid', label: '待处理' },
  { key: 'progress', label: '进行中' },
  { key: 'all', label: '全部' },
];

export default function Orders() {
  const [filter, setFilter] = useState('paid');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    try {
      setLoading(true);
      // 商家端订单接口一次返回全部，前端按 status 本地分组
      const response: any = await orderAPI.list();
      if (response.code === 0) setOrders(response.data.items || []);
    } catch {
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    load();
  });

  const pendingCount = orders.filter((o) => o.status === 'paid').length;
  const progressCount = orders.filter((o) =>
    ['accepted', 'preparing'].includes(o.status)
  ).length;

  const counts: Record<string, number> = {
    paid: pendingCount,
    progress: progressCount,
    all: orders.length,
  };

  const filtered = orders.filter((o) => {
    if (filter === 'paid') return o.status === 'paid';
    if (filter === 'progress')
      return ['accepted', 'preparing', 'ready'].includes(o.status);
    return true;
  });

  const acceptOrder = async (id: number) => {
    try {
      const res: any = await orderAPI.accept(id);
      if (res.code === 0) {
        toast('已接单 #' + id);
        load();
      } else toast(res.message || '接单失败');
    } catch (e: any) {
      toast(e?.data?.message || '接单失败');
    }
  };

  const rejectOrder = (id: number) => {
    Taro.showModal({
      title: '拒单确认',
      content: '拒单后订单将被取消，商品库存会自动恢复。确定要拒绝该订单吗？',
      confirmText: '确定拒单',
      confirmColor: '#FF5000',
      success: async (r) => {
        if (!r.confirm) return;
        try {
          const res: any = await orderAPI.reject(id);
          if (res.code === 0) {
            toast('已拒单 #' + id);
            load();
          } else toast(res.message || '拒单失败');
        } catch (e: any) {
          toast(e?.data?.message || '拒单失败');
        }
      },
    });
  };

  const prepareOrder = async (id: number) => {
    try {
      const res: any = await orderAPI.prepare(id);
      if (res.code === 0) {
        toast('已确认出餐 #' + id);
        load();
      } else toast(res.message || '操作失败');
    } catch (e: any) {
      toast(e?.data?.message || '操作失败');
    }
  };

  const readyOrder = async (id: number) => {
    try {
      const res: any = await orderAPI.ready(id);
      if (res.code === 0) {
        toast('出餐完成 #' + id);
        load();
      } else toast(res.message || '操作失败');
    } catch (e: any) {
      toast(e?.data?.message || '操作失败');
    }
  };

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5]">
      {/* 筛选 Tab */}
      <View className="bg-white flex px-4 border-b border-gray-100">
        {TABS.map((t) => (
          <View
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`py-3 mr-6 relative ${
              filter === t.key ? '' : ''
            }`}
          >
            <Text
              className={`text-[14px] font-bold ${
                filter === t.key ? 'text-[#0085FF]' : 'text-gray-500'
              }`}
            >
              {t.label}
              {counts[t.key] > 0 ? ` (${counts[t.key]})` : ''}
            </Text>
            {filter === t.key && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0085FF] rounded-full" />
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY className="p-4">
        {loading ? (
          <View className="text-center py-16">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="text-center py-16">
            <Text className="text-gray-400">暂无订单</Text>
          </View>
        ) : (
          filtered.map((o) => (
            <View
              key={o.id}
              className={`bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-3 ${
                o.status !== 'paid' ? 'opacity-90' : ''
              }`}
            >
              <View className="flex items-center justify-between mb-3">
                <View className="flex items-center gap-2">
                  <Text className="text-[12px] font-bold text-gray-400">
                    {o.order_no}
                  </Text>
                </View>
                <Text
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    o.status === 'paid'
                      ? 'bg-red-50 text-[#FF5000]'
                      : 'bg-green-50 text-[#00B578]'
                  }`}
                >
                  {STATUS_LABELS[o.status] || o.status}
                </Text>
              </View>

              <Text className="block font-bold text-[14px] text-gray-900 mb-1">
                {itemsSummary(o.items_snapshot)}
              </Text>
              {o.note ? (
                <Text className="block text-[11px] text-[#FF5000] mt-1">
                  备注：{o.note}
                </Text>
              ) : null}

              <View className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <Text className="text-[12px] text-gray-500">
                  共 {itemsQty(o.items_snapshot)} 件 · 实付{' '}
                  <Text className="font-bold text-[16px] text-gray-900">
                    ¥{o.paid_amount}
                  </Text>
                </Text>
                <View className="flex gap-2">
                  {o.status === 'paid' && (
                    <>
                      <View
                        onClick={() => rejectOrder(o.id)}
                        className="px-4 py-2 rounded-[12px] border border-gray-200"
                      >
                        <Text className="text-[13px] text-gray-700">拒绝单</Text>
                      </View>
                      <View
                        onClick={() => acceptOrder(o.id)}
                        className="px-5 py-2 rounded-[12px] bg-[#0085FF]"
                      >
                        <Text className="text-[13px] text-white font-bold">
                          立即接单
                        </Text>
                      </View>
                    </>
                  )}
                  {o.status === 'accepted' && (
                    <View
                      onClick={() => prepareOrder(o.id)}
                      className="px-5 py-2 rounded-[12px] bg-[#0085FF]"
                    >
                      <Text className="text-[13px] text-white font-bold">
                        确认出餐
                      </Text>
                    </View>
                  )}
                  {o.status === 'preparing' && (
                    <View
                      onClick={() => readyOrder(o.id)}
                      className="px-5 py-2 rounded-[12px] bg-[#0085FF]"
                    >
                      <Text className="text-[13px] text-white font-bold">
                        出餐完成
                      </Text>
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
