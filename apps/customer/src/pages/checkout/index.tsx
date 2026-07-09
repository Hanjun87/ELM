import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderAPI, addressAPI } from '../../api';
import { toast } from '../../utils/toast';
import { cartStore, clearCart } from '../../cartStore';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const { merchant, lines } = cartStore;

  const goodsTotal = lines.reduce(
    (sum, l) => sum + parseFloat(l.product.price) * l.quantity,
    0
  );
  const deliveryFee = merchant?.delivery_fee ? parseFloat(merchant.delivery_fee) : 5;
  const discountAmount = selectedCoupon ? parseFloat(selectedCoupon.discount_amount) : 0;

  // 满减计算(mock: 满30减5, 满50减10)
  let fullReductionAmount = 0;
  if (goodsTotal >= 50) {
    fullReductionAmount = 10;
  } else if (goodsTotal >= 30) {
    fullReductionAmount = 5;
  }

  const totalAmount = Math.max(0, goodsTotal + deliveryFee - discountAmount - fullReductionAmount);

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

  const openCoupons = () => {
    // 优惠券选择页(后端 promotions 未接路由,降级为 toast)
    toast('优惠券功能开发中');
    // 真实场景: Taro.navigateTo({ url: '/pages/coupons/index?select=1' });
    // 然后通过 eventChannel 或全局事件回传选中的券
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
    <View className="w-full min-h-screen bg-gray-50 pb-28">
      {/* 收货地址 */}
      <View
        onClick={() => Taro.navigateTo({ url: '/pages/address/index' })}
        className="bg-white p-4 mb-2 flex items-center justify-between"
      >
        {address ? (
          <View className="flex-1">
            <View className="flex items-center gap-2 mb-1">
              <Text className="font-bold text-base">{address.contact_name || address.name}</Text>
              <Text className="text-sm text-gray-500">{address.contact_phone || address.phone}</Text>
            </View>
            <Text className="block text-sm text-gray-600">
              {address.address || address.detail || ''}
            </Text>
          </View>
        ) : (
          <Text className="text-gray-400">请选择收货地址</Text>
        )}
        <Text className="text-gray-300 text-xl ml-2">›</Text>
      </View>

      {/* 商家与商品 */}
      <View className="bg-white p-4 mb-2">
        <View className="flex items-center gap-2 mb-3">
          <Text className="font-bold text-base">{merchant?.store_name || '商家'}</Text>
        </View>
        {lines.length === 0 ? (
          <Text className="text-gray-400 text-center py-4">购物车为空，请返回商家页添加商品</Text>
        ) : (
          lines.map((l) => (
            <View key={l.product.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <Image src={l.product.image} mode="aspectFill" className="w-14 h-14 rounded-lg" />
              <View className="flex-1">
                <Text className="block font-medium text-sm">{l.product.name}</Text>
                <Text className="block text-xs text-gray-400 mt-1">x{l.quantity}</Text>
              </View>
              <Text className="text-base font-medium">
                ¥{(parseFloat(l.product.price) * l.quantity).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* 优惠券 */}
      <View onClick={openCoupons} className="bg-white p-4 mb-2 flex items-center justify-between">
        <Text className="text-gray-700">优惠券</Text>
        <View className="flex items-center gap-2">
          {selectedCoupon ? (
            <Text className="text-orange-500 text-sm">-¥{selectedCoupon.discount_amount}</Text>
          ) : (
            <Text className="text-gray-400 text-sm">暂无可用</Text>
          )}
          <Text className="text-gray-300 text-xl">›</Text>
        </View>
      </View>

      {/* 满减提示 */}
      {fullReductionAmount > 0 && (
        <View className="bg-orange-50 mx-4 px-3 py-2 rounded-lg mb-2">
          <Text className="text-orange-600 text-xs">🎉 已享满减优惠 -¥{fullReductionAmount}</Text>
        </View>
      )}
      {goodsTotal < 30 && goodsTotal > 0 && (
        <View className="bg-blue-50 mx-4 px-3 py-2 rounded-lg mb-2">
          <Text className="text-blue-600 text-xs">💰 再买¥{(30 - goodsTotal).toFixed(2)}享满30减5</Text>
        </View>
      )}

      {/* 费用明细 */}
      <View className="bg-white p-4">
        <Text className="block font-bold mb-3">费用明细</Text>
        <View className="flex justify-between py-2">
          <Text className="text-gray-600">商品金额</Text>
          <Text>¥{goodsTotal.toFixed(2)}</Text>
        </View>
        <View className="flex justify-between py-2">
          <Text className="text-gray-600">配送费</Text>
          <Text>¥{deliveryFee.toFixed(2)}</Text>
        </View>
        {fullReductionAmount > 0 && (
          <View className="flex justify-between py-2">
            <Text className="text-gray-600">满减优惠</Text>
            <Text className="text-orange-500">-¥{fullReductionAmount.toFixed(2)}</Text>
          </View>
        )}
        {discountAmount > 0 && (
          <View className="flex justify-between py-2">
            <Text className="text-gray-600">优惠券</Text>
            <Text className="text-orange-500">-¥{discountAmount.toFixed(2)}</Text>
          </View>
        )}
        <View className="flex justify-between py-3 mt-2 border-t border-gray-100">
          <Text className="font-bold">实付</Text>
          <Text className="text-orange-500 text-xl font-bold">¥{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* 底部提交栏 */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center gap-3 shadow-lg">
        <View className="flex-1">
          <View className="flex items-center gap-2">
            <Text className="text-xs text-gray-500">实付</Text>
            <Text className="text-2xl font-bold text-orange-500">¥{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
        <View
          onClick={loading ? undefined : handleSubmit}
          className={`px-12 py-3 rounded-full ${loading ? 'bg-gray-300' : 'bg-blue-500'}`}
        >
          <Text className="text-white font-bold text-base">{loading ? '提交中...' : '提交订单'}</Text>
        </View>
      </View>
    </View>
  );
}
