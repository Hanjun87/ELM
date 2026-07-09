import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

export default function Cart() {
  return (
    <View className="w-full min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center">
      <Text className="text-6xl mb-4">🛒</Text>
      <Text className="text-gray-400">购物车是空的</Text>
      <Text className="text-sm text-gray-400 mt-2">去商家页面添加商品吧</Text>
      <View
        onClick={() => Taro.switchTab({ url: '/pages/home/index' })}
        className="mt-6 px-8 py-3 bg-[#0085FF] rounded-full"
      >
        <Text className="text-white font-bold">去逛逛</Text>
      </View>
    </View>
  );
}
