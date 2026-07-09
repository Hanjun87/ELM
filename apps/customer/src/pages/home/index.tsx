import { useState } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { merchantAPI } from '../../api';
import { toast } from '../../utils/toast';
import type { Merchant } from '../../types';

type CategoryType = 'all' | 'fast' | 'meal' | 'drink' | 'fruit';
type SortType = 'default' | 'distance' | 'rating' | 'sales';

const CATEGORIES = [
  { key: 'all' as CategoryType, label: '全部' },
  { key: 'fast' as CategoryType, label: '快餐' },
  { key: 'meal' as CategoryType, label: '正餐' },
  { key: 'drink' as CategoryType, label: '奶茶饮品' },
  { key: 'fruit' as CategoryType, label: '果蔬生鲜' },
];

export default function Home() {
  const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [sortBy, setSortBy] = useState<SortType>('default');

  const loadMerchants = async () => {
    try {
      const response: any = await merchantAPI.list();
      if (response.code === 0) {
        const items = response.data.items || [];
        setAllMerchants(items);
        applyFilters(items, activeCategory, sortBy);
      }
    } catch (error) {
      toast('加载商家失败');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: Merchant[], category: CategoryType, sort: SortType) => {
    let filtered = [...data];

    // 分类筛选(mock:随机分配,真实需后端返回 category 字段)
    if (category !== 'all') {
      const categoryMap: Record<CategoryType, string[]> = {
        all: [],
        fast: ['麦当劳', 'KFC', '汉堡'],
        meal: ['湘菜', '川菜', '正餐'],
        drink: ['奶茶', '饮品', '咖啡'],
        fruit: ['水果', '生鲜', '超市'],
      };
      const keywords = categoryMap[category] || [];
      filtered = filtered.filter(m =>
        keywords.some(kw => m.store_name.includes(kw))
      );
    }

    // 排序
    if (sort === 'rating') {
      filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sort === 'sales') {
      filtered.sort((a, b) => b.monthly_sales - a.monthly_sales);
    } else if (sort === 'distance') {
      // mock:距离随机,真实需后端返回 distance 字段
      filtered.sort(() => Math.random() - 0.5);
    }

    setMerchants(filtered);
  };

  const switchCategory = (cat: CategoryType) => {
    setActiveCategory(cat);
    applyFilters(allMerchants, cat, sortBy);
  };

  const switchSort = (s: SortType) => {
    setSortBy(s);
    applyFilters(allMerchants, activeCategory, s);
  };

  // 每次显示时检查登录态；未登录跳登录页
  useDidShow(() => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    loadMerchants();
  });

  usePullDownRefresh(async () => {
    await loadMerchants();
    Taro.stopPullDownRefresh();
  });

  const openStore = (id: number) => {
    Taro.navigateTo({ url: `/pages/store/index?id=${id}` });
  };

  return (
    <ScrollView scrollY className="w-full min-h-screen bg-gray-50">
      {/* 搜索栏 */}
      <View className="p-4 bg-white shadow-sm">
        <View className="flex gap-2">
          <View className="flex-1 bg-gray-50 rounded-full px-4 py-2 flex items-center gap-2">
            <Text className="text-gray-400 text-sm">🔍</Text>
            <Input placeholder="搜索商家或商品" className="bg-transparent flex-1 text-sm" />
          </View>
        </View>
      </View>

      {/* 分类筛选 */}
      <View className="bg-white px-4 py-3">
        <ScrollView scrollX className="whitespace-nowrap">
          <View className="flex gap-2">
            {CATEGORIES.map(cat => (
              <View
                key={cat.key}
                onClick={() => switchCategory(cat.key)}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  activeCategory === cat.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Text>{cat.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 排序按钮 */}
      <View className="bg-white px-4 py-2 flex gap-2 shadow-sm">
        {[
          { key: 'default' as SortType, label: '综合排序' },
          { key: 'distance' as SortType, label: '距离优先' },
          { key: 'rating' as SortType, label: '评分最高' },
          { key: 'sales' as SortType, label: '销量最高' },
        ].map(s => (
          <View
            key={s.key}
            onClick={() => switchSort(s.key)}
            className={`px-3 py-1 rounded-full text-xs ${
              sortBy === s.key
                ? 'bg-blue-50 text-blue-500 border border-blue-500'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Text>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* 商家列表 */}
      <View className="p-4">
        {loading ? (
          <View className="text-center py-12">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : merchants.length === 0 ? (
          <View className="text-center py-12">
            <Text className="text-gray-400">暂无商家</Text>
          </View>
        ) : (
          merchants.map((merchant) => (
            <View
              key={merchant.id}
              onClick={() => openStore(merchant.id)}
              className="bg-white rounded-2xl p-4 shadow-sm mb-3"
            >
              <View className="flex gap-3">
                <Image
                  src={merchant.logo}
                  mode="aspectFill"
                  className="w-20 h-20 rounded-xl"
                />
                <View className="flex-1">
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
                <Text className="text-gray-300 text-xl">›</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
