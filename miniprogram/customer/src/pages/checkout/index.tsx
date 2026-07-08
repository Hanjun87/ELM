import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderAPI, addressAPI } from '../../api';
import { toast } from '../../utils/toast';
import { cartStore, clearCart } from '../../cartStore';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const { merchant, lines } = cartStore;

  const total = lines.reduce(
    (sum, l) => sum + parseFloat(l.product.price) * l.quantity,
    0
  );

  useDidShow(() => {
    loadDefaultAddress();
  });

  const loadDefaultAddress = async () => {
    try {
      const res: any = await addressAPI.list();
      if (res.code === 0) {
        const items = res.data.items || res.data || [];
        const def = items.find((a: any) => a.is_default) || items[0];
        setAddress(def || null);
      }
    } catch {
      // 地址加载失败不阻塞下单流程
    }
  };

  const handleSubmit = async () => {
    if (!merchant || lines.length === 0) {
      toast('购物车为空');
      return;
    }
    if (!address) {
      toast('请先添加收货地址');
      Taro.navigateTo({ url: '/pages/address/index' });
      return;
    }

    setLoading(true);
    try {
      const response: any = await orderAPI.create({
        merchant_id: merchant.id,
        items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
        address_snapshot: {
          name: address.contact_name || address.name,
          phone: address.contact_phone || address.phone,
          address: address.address || address.detail || '',
        },
      });

      if (response.code === 0) {
        toast('下单成功');
        clearCart();
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/orders/index' });
        }, 800);
      } else {
        toast(response.message || '下单失败');
      }
    } catch (error: any) {
      toast(error?.data?.message || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5] pb-24">
      {/* 收货地址 */}
      <View
        onClick={() => Taro.navigateTo({ url: '/pages/address/index' })}
        className="bg-white p-4 mb-2 flex items-center justify-between"
      >
        {address ? (
          <View className="flex-1">
            <View className="flex items-center gap-2">
              <Text className="font-bold text-base">{address.contact_name || address.name}</Text>
              <Text className="text-sm text-gray-500">{address.contact_phone || address.phone}</Text>
            </View>
            <Text className="block text-sm text-gray-600 mt-1">
              {address.address || address.detail || ''}
            </Text>
          </View>
        ) : (
          <Text className="text-gray-400">请选择收货地址 ></Text>
        )}
      </View>

      {/* 商品清单 */}
      <View className="bg-white p-4">
        <Text className="block font-bold mb-3">{merchant?.store_name || '订单信息'}</Text>
        {lines.length === 0 ? (
          <Text className="text-gray-400">购物车为空，请返回商家页添加商品</Text>
        ) : (
          lines.map((l) => (
            <View key={l.product.id} className="flex items-center gap-3 py-2">
              <Image src={l.product.image} mode="aspectFill" className="w-12 h-12 rounded-lg" />
              <Text className="flex-1">{l.product.name}</Text>
              <Text className="text-gray-500">x{l.quantity}</Text>
              <Text className="text-[#FF5000] font-medium w-16 text-right">
                ¥{(parseFloat(l.product.price) * l.quantity).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View className="bg-white p-4 mt-2 flex items-center justify-between">
        <Text className="text-gray-600">合计</Text>
        <Text className="text-[#FF5000] text-lg font-bold">¥{total.toFixed(2)}</Text>
      </View>

      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center gap-3">
        <View className="flex-1">
          <Text className="text-lg font-bold">¥{total.toFixed(2)}</Text>
        </View>
        <View
          onClick={loading ? undefined : handleSubmit}
          className={`px-10 py-3 rounded-full ${loading ? 'bg-gray-300' : 'bg-[#0085FF]'}`}
        >
          <Text className="text-white font-bold">{loading ? '提交中...' : '提交订单'}</Text>
        </View>
      </View>
    </View>
  );
}
