import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { productAPI, merchantAPI } from '../../api';
import { toast } from '../../utils/toast';
import { cartStore } from '../../cartStore';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  original_price?: string;
}

export default function Store() {
  const [storeId, setStoreId] = useState<number>(0);
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useLoad((options) => {
    const id = Number(options.id || 1);
    setStoreId(id);
    loadData(id);
  });

  const loadData = async (id: number) => {
    try {
      const [merchantRes, productsRes]: any[] = await Promise.all([
        merchantAPI.detail(id),
        productAPI.list(id),
      ]);
      if (merchantRes.code === 0) setMerchant(merchantRes.data);
      if (productsRes.code === 0) setProducts(productsRes.data.items || []);
    } catch (error) {
      toast('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((s, n) => s + n, 0);
  const totalAmount = products.reduce(
    (sum, p) => sum + parseFloat(p.price) * (cart[p.id] || 0),
    0
  );

  const goCheckout = () => {
    // 写入模块级购物车，供结算页读取
    cartStore.merchant = merchant;
    cartStore.lines = products
      .filter((p) => cart[p.id] > 0)
      .map((p) => ({
        product: { id: p.id, name: p.name, price: p.price, image: p.image },
        quantity: cart[p.id],
      }));
    Taro.navigateTo({ url: '/pages/checkout/index' });
  };

  if (loading) {
    return (
      <View className="w-full min-h-screen flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="w-full min-h-screen bg-gray-50 pb-24">
      <Image src={merchant?.logo} mode="aspectFill" className="w-full h-48" />

      <View className="bg-white p-4">
        <Text className="block text-xl font-bold">{merchant?.store_name}</Text>
        <View className="flex items-center gap-4 mt-2">
          <Text className="text-sm text-gray-600">⭐ {merchant?.rating}</Text>
          <Text className="text-sm text-gray-600">月售{merchant?.monthly_sales}</Text>
          <Text className="text-sm text-gray-600">起送¥{merchant?.min_order}</Text>
        </View>
      </View>

      <View className="mt-2 bg-white p-4">
        <Text className="block font-bold mb-3">商品列表</Text>
        {products.map((product) => {
          const count = cart[product.id] || 0;
          return (
            <View
              key={product.id}
              className="flex gap-3 pb-3 mb-3 border-b border-gray-100"
            >
              <Image src={product.image} mode="aspectFill" className="w-20 h-20 rounded-lg" />
              <View className="flex-1">
                <Text className="block font-medium">{product.name}</Text>
                <Text className="block text-xs text-gray-500 mt-1">{product.description}</Text>
                <View className="flex items-center justify-between mt-2">
                  <View className="flex items-center">
                    <Text className="text-[#FF5000] font-bold">¥{product.price}</Text>
                    {product.original_price && (
                      <Text className="text-xs text-gray-400 line-through ml-2">
                        ¥{product.original_price}
                      </Text>
                    )}
                  </View>
                  <View className="flex items-center gap-2">
                    {count > 0 && (
                      <>
                        <View
                          onClick={() => removeFromCart(product.id)}
                          className="w-6 h-6 rounded-full bg-[#0085FF] text-white flex items-center justify-center"
                        >
                          <Text className="text-white text-lg leading-none">-</Text>
                        </View>
                        <Text className="w-6 text-center">{count}</Text>
                      </>
                    )}
                    <View
                      onClick={() => addToCart(product.id)}
                      className="w-6 h-6 rounded-full bg-[#0085FF] flex items-center justify-center"
                    >
                      <Text className="text-white text-lg leading-none">+</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {totalItems > 0 && (
        <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center gap-3">
          <View className="flex-1">
            <Text className="block text-lg font-bold">¥{totalAmount.toFixed(2)}</Text>
            <Text className="block text-xs text-gray-500">{totalItems}件商品</Text>
          </View>
          <View
            onClick={goCheckout}
            className="px-8 py-3 bg-[#0085FF] rounded-full"
          >
            <Text className="text-white font-bold">去结算</Text>
          </View>
        </View>
      )}
    </View>
  );
}
