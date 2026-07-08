import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { toast } from '../../utils/toast';

interface FavMerchant {
  id: number;
  store_name: string;
  logo: string;
  rating: string;
  monthly_sales: number;
  min_order: string;
  delivery_fee: string;
}

export default function Favorites() {
  // Mock 数据,真实场景从后端 GET /user/favorites/ 获取
  const [favorites, setFavorites] = useState<FavMerchant[]>([
    {
      id: 1,
      store_name: '麦当劳(朝阳店)',
      logo: 'https://images.unsplash.com/photo-1619454016518-697bc231e7cb?w=400',
      rating: '4.8',
      monthly_sales: 2580,
      min_order: '20',
      delivery_fee: '5',
    },
    {
      id: 2,
      store_name: '星巴克(国贸店)',
      logo: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
      rating: '4.9',
      monthly_sales: 1820,
      min_order: '15',
      delivery_fee: '6',
    },
  ]);

  const removeFavorite = (id: number, name: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
    toast(`已取消收藏 ${name}`);
  };

  const openStore = (id: number) => {
    Taro.navigateTo({ url: `/pages/store/index?id=${id}` });
  };

  return (
    <View className="w-full min-h-screen bg-gray-50 p-4">
      <Text className="block font-bold text-lg mb-3">我的收藏</Text>

      {favorites.length === 0 ? (
        <View className="text-center py-20">
          <Text className="text-6xl mb-4">❤️</Text>
          <Text className="block text-gray-400 text-sm">还没有收藏商家</Text>
          <View
            onClick={() => Taro.switchTab({ url: '/pages/home/index' })}
            className="inline-block mt-6 px-6 py-2 bg-blue-500 rounded-full"
          >
            <Text className="text-white text-sm">去逛逛</Text>
          </View>
        </View>
      ) : (
        favorites.map(merchant => (
          <View
            key={merchant.id}
            className="bg-white rounded-2xl p-4 shadow-sm mb-3 relative"
          >
            <View
              onClick={() => removeFavorite(merchant.id, merchant.store_name)}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center"
            >
              <Text className="text-2xl">❤️</Text>
            </View>

            <View onClick={() => openStore(merchant.id)} className="flex gap-3">
              <Image
                src={merchant.logo}
                mode="aspectFill"
                className="w-20 h-20 rounded-xl"
              />
              <View className="flex-1 pr-8">
                <Text className="block font-bold text-base">{merchant.store_name}</Text>
                <View className="flex items-center gap-2 mt-1">
                  <Text className="text-orange-500 text-sm">⭐ {merchant.rating}</Text>
                  <Text className="text-gray-400 text-sm">月售{merchant.monthly_sales}</Text>
                </View>
                <View className="flex items-center gap-2 mt-2">
                  <Text className="text-xs text-gray-500">起送¥{merchant.min_order}</Text>
                  <Text className="text-xs text-gray-500">配送¥{merchant.delivery_fee}</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
