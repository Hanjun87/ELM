import { useState } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderAPI } from '../../api';
import { toast } from '../../utils/toast';
import { RiderOrder } from '../../types';

// 移植自 fronted/Rider/src/components/TasksTab.tsx 的「进行中」部分：
// 已接单（ready 待取餐 / picked 配送中）的取餐、送达操作 + 异常上报。

const STATUS_TEXT: Record<string, string> = {
  ready: '待取餐',
  picked: '配送中',
  delivered: '已送达',
};

const EXCEPTION_TYPES: { key: string; label: string }[] = [
  { key: 'address_error', label: '地址错误' },
  { key: 'contact_failed', label: '联系不上客户' },
  { key: 'item_damaged', label: '餐品损坏' },
  { key: 'other', label: '其他' },
];

export default function Deliveries() {
  const [mine, setMine] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [exceptionOrder, setExceptionOrder] = useState<number | null>(null);
  const [exType, setExType] = useState('');
  const [exDesc, setExDesc] = useState('');

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
      toast('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    load();
  });

  // 进行中 = 待取餐 + 配送中（已送达归入历史页）
  const inProgress = mine.filter((o) => ['ready', 'picked'].includes(o.status));

  const pickupOrder = async (id: number) => {
    try {
      const res: any = await orderAPI.pickup(id);
      if (res.code === 0) {
        toast('已取餐');
        load();
      } else toast(res.message || '取餐失败');
    } catch (e: any) {
      toast(e?.data?.message || '取餐失败');
    }
  };

  const deliverOrder = async (id: number) => {
    try {
      const res: any = await orderAPI.deliver(id);
      if (res.code === 0) {
        toast('送达成功');
        load();
      } else toast(res.message || '送达失败');
    } catch (e: any) {
      toast(e?.data?.message || '送达失败');
    }
  };

  const openException = (id: number) => {
    setExceptionOrder(id);
    setExType('');
    setExDesc('');
  };

  // TODO(扩展点): 后端暂无异常上报接口，仅前端提示；接入后调用对应 API。
  const submitException = () => {
    if (!exType) {
      toast('请选择异常类型');
      return;
    }
    toast('异常已提交');
    setExceptionOrder(null);
  };

  const notifyCall = () => toast('拨号功能暂未开放');
  const notifyNav = () => toast('导航功能暂未开放');

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5]">
      <ScrollView scrollY className="px-4 pt-4 pb-4">
        {loading ? (
          <View className="text-center py-16">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : inProgress.length === 0 ? (
          <View className="text-center py-16">
            <Text className="text-gray-400 text-[13px]">暂无配送中的订单</Text>
          </View>
        ) : (
          inProgress.map((o) => (
            <View
              key={o.id}
              className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-3"
            >
              <View className="flex justify-between items-start">
                <View>
                  <Text className="font-bold text-[16px] text-gray-900">
                    {o.order_no}
                  </Text>
                  <View className="flex items-center gap-2 mt-1">
                    <Text className="text-[11px] text-gray-500">
                      {o.merchant_name}
                    </Text>
                    <Text className="px-2 py-0.5 bg-blue-50 text-[#0085FF] rounded text-[10px] font-medium">
                      {STATUS_TEXT[o.status] || o.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-[18px] font-bold text-[#0085FF]">
                  ¥{o.paid_amount}
                </Text>
              </View>

              {/* 收货地址 */}
              <View className="bg-gray-50 rounded-xl p-3 flex items-start gap-3 mt-3">
                <Text className="text-[#0085FF] text-[16px]">📍</Text>
                <View className="flex-1 min-w-0">
                  <Text className="block font-medium text-[14px] text-gray-900">
                    {o.address_snapshot.address || '地址信息缺失'}
                  </Text>
                  <Text className="block text-[12px] text-gray-500 mt-1">
                    {o.address_snapshot.name || '客户'}{' '}
                    {o.address_snapshot.phone || ''}
                  </Text>
                </View>
                <View
                  onClick={notifyCall}
                  className="w-9 h-9 rounded-full bg-[#0085FF] flex items-center justify-center"
                >
                  <Text className="text-white text-[16px]">📞</Text>
                </View>
              </View>

              {o.note ? (
                <View className="bg-orange-50 rounded-xl p-3 mt-3">
                  <Text className="text-[12px] text-gray-700">
                    <Text className="font-bold text-[#FF5000]">备注: </Text>
                    {o.note}
                  </Text>
                </View>
              ) : null}

              {/* 操作按钮 */}
              <View className="flex gap-2 mt-3">
                <View
                  onClick={notifyNav}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 flex items-center justify-center"
                >
                  <Text className="text-gray-700 font-medium text-[13px]">导航</Text>
                </View>
                {o.status === 'ready' && (
                  <View
                    onClick={() => pickupOrder(o.id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#0085FF] flex items-center justify-center"
                  >
                    <Text className="text-white font-bold text-[13px]">
                      确认取餐
                    </Text>
                  </View>
                )}
                {o.status === 'picked' && (
                  <>
                    <View
                      onClick={() => openException(o.id)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 flex items-center justify-center"
                    >
                      <Text className="text-gray-700 font-medium text-[13px]">
                        异常
                      </Text>
                    </View>
                    <View
                      onClick={() => deliverOrder(o.id)}
                      className="flex-1 py-2.5 rounded-xl bg-[#0085FF] flex items-center justify-center"
                    >
                      <Text className="text-white font-bold text-[13px]">送达</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 异常上报底部弹层 */}
      {exceptionOrder !== null && (
        <View
          className="fixed inset-0 bg-black/40 flex items-end z-50"
          onClick={() => setExceptionOrder(null)}
        >
          <View
            className="bg-white w-full rounded-t-[24px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Text className="block font-bold text-[18px] text-gray-900 mb-4">
              ⚠️ 上报异常
            </Text>
            {EXCEPTION_TYPES.map((t) => (
              <View
                key={t.key}
                onClick={() => setExType(t.key)}
                className={`w-full py-3 rounded-xl mb-3 flex items-center justify-center ${
                  exType === t.key ? 'bg-[#FF5000]' : 'bg-gray-50'
                }`}
              >
                <Text
                  className={`text-[14px] font-medium ${
                    exType === t.key ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {t.label}
                </Text>
              </View>
            ))}
            <Textarea
              value={exDesc}
              onInput={(e) => setExDesc(e.detail.value)}
              placeholder="补充说明..."
              className="w-full bg-gray-50 rounded-xl p-3 text-[13px] border border-gray-100 h-20"
            />
            <View className="flex gap-3 mt-4">
              <View
                onClick={() => setExceptionOrder(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 flex items-center justify-center"
              >
                <Text className="text-gray-700 font-medium text-[14px]">取消</Text>
              </View>
              <View
                onClick={submitException}
                className="flex-1 py-3 rounded-xl bg-[#FF5000] flex items-center justify-center"
              >
                <Text className="text-white font-bold text-[14px]">提交异常</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
