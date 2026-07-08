import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { productAPI } from '../../api';
import { toast } from '../../utils/toast';
import { Product, Category } from '../../types';

// 移植自 fronted/Merchant/src/components/ProductsTab.tsx
// Web 端用左侧分类栏 + 右侧商品列表的双栏布局，小程序保留该结构。
// 新增 / 编辑商品改为跳转独立页面 product-edit（替代 Web 端的 Modal 表单）。

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = Taro.getStorageSync('access_token');
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }
    setLoading(true);
    try {
      const [productsRes, categoriesRes]: any[] = await Promise.all([
        productAPI.list(),
        productAPI.categories(),
      ]);
      if (productsRes.code === 0) setProducts(productsRes.data.items || []);
      if (categoriesRes.code === 0) setCategories(categoriesRes.data || []);
    } catch {
      toast('加载商品失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    load();
  });

  const filtered =
    activeCat === 'all'
      ? products
      : products.filter((p) => p.category?.id === activeCat);
  const catName =
    activeCat === 'all'
      ? '全部'
      : categories.find((c) => c.id === activeCat)?.name || '全部';

  const toggleProduct = async (p: Product) => {
    const nextStatus = p.status === 'on' ? 'off' : 'on';
    try {
      const res: any = await productAPI.toggle(p.id, nextStatus);
      if (res.code === 0) {
        toast(p.name + (nextStatus === 'on' ? ' 已重新上架' : ' 已下架'));
        load();
      } else toast(res.message || '操作失败');
    } catch (e: any) {
      toast(e?.data?.message || '操作失败');
    }
  };

  const deleteProduct = (p: Product) => {
    Taro.showModal({
      title: '删除商品',
      content: `确定要删除「${p.name}」吗？删除后不可恢复。`,
      confirmText: '删除',
      confirmColor: '#FF5000',
      success: async (r) => {
        if (!r.confirm) return;
        try {
          const res: any = await productAPI.delete(p.id);
          if (res.code === 0) {
            toast('已删除');
            load();
          } else toast(res.message || '删除失败');
        } catch (e: any) {
          toast(e?.data?.message || '删除失败');
        }
      },
    });
  };

  // 跳转到商品编辑页；带 id 为编辑，不带为新增
  const goEdit = (id?: number) => {
    const cat = activeCat !== 'all' ? `&category_id=${activeCat}` : '';
    Taro.navigateTo({
      url: `/pages/product-edit/index?${id ? `id=${id}` : ''}${cat}`,
    });
  };

  return (
    <View className="w-full min-h-screen bg-white flex flex-col">
      {/* 顶部栏 */}
      <View className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <Text className="font-bold text-[17px] text-gray-900">商品管理</Text>
        <View
          onClick={() => goEdit()}
          className="px-3 py-1.5 rounded-[12px] bg-[#0085FF]"
        >
          <Text className="text-white text-[13px] font-bold">+ 新增</Text>
        </View>
      </View>

      {loading ? (
        <View className="text-center py-16">
          <Text className="text-gray-400">加载中...</Text>
        </View>
      ) : (
        <View className="flex flex-1 overflow-hidden">
          {/* 左侧分类栏 */}
          <ScrollView
            scrollY
            className="w-[84px] bg-gray-50 flex-shrink-0 border-r border-gray-100"
          >
            <View
              onClick={() => setActiveCat('all')}
              className={`py-3.5 px-2 text-center border-l-2 ${
                activeCat === 'all'
                  ? 'bg-white border-l-[#0085FF]'
                  : 'border-l-transparent'
              }`}
            >
              <Text
                className={`text-[12px] ${
                  activeCat === 'all'
                    ? 'text-[#0085FF] font-bold'
                    : 'text-gray-500'
                }`}
              >
                全部
              </Text>
            </View>
            {categories.map((c) => (
              <View
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`py-3.5 px-2 text-center border-l-2 ${
                  activeCat === c.id
                    ? 'bg-white border-l-[#0085FF]'
                    : 'border-l-transparent'
                }`}
              >
                <Text
                  className={`text-[12px] ${
                    activeCat === c.id
                      ? 'text-[#0085FF] font-bold'
                      : 'text-gray-500'
                  }`}
                >
                  {c.name}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* 右侧商品列表 */}
          <ScrollView scrollY className="flex-1 bg-white px-3">
            <Text className="block font-bold text-[13px] text-gray-800 py-3">
              {catName}
            </Text>
            {filtered.length === 0 && (
              <Text className="block text-center text-gray-400 text-[13px] py-8">
                暂无商品
              </Text>
            )}
            {filtered.map((p) => (
              <View
                key={p.id}
                className={`flex gap-3 mb-4 ${p.status === 'off' ? 'opacity-60' : ''}`}
              >
                <View
                  onClick={() => goEdit(p.id)}
                  className="w-[80px] h-[80px] rounded-xl bg-gray-50 flex-shrink-0 relative overflow-hidden"
                >
                  {p.image ? (
                    <Image src={p.image} className="w-full h-full" mode="aspectFill" />
                  ) : (
                    <View className="w-full h-full flex items-center justify-center">
                      <Text className="text-gray-300 text-[20px]">🍽️</Text>
                    </View>
                  )}
                  {p.stock === 0 && (
                    <View className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Text className="text-white text-[10px] font-bold border border-white rounded px-2 py-0.5">
                        已售罄
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex justify-between items-start">
                    <Text
                      onClick={() => goEdit(p.id)}
                      className="font-bold text-[14px] text-gray-900"
                    >
                      {p.name}
                    </Text>
                    <Text
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        p.status === 'on'
                          ? 'bg-green-50 text-[#00B578]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.status === 'on' ? '上架' : '下架'}
                    </Text>
                  </View>
                  <Text className="block text-[10px] text-gray-400 mt-0.5">
                    月售 {p.sales_count} | 库存 {p.stock}
                  </Text>
                  <View className="flex justify-between items-end mt-1">
                    <Text className="font-bold text-[#FF5000] text-[16px]">
                      ¥{p.price}
                    </Text>
                    <View className="flex gap-2">
                      <View
                        onClick={() => toggleProduct(p)}
                        className="px-3 py-1 rounded-full border border-[#0085FF]"
                      >
                        <Text className="text-[11px] text-[#0085FF] font-medium">
                          {p.status === 'on' ? '下架' : '上架'}
                        </Text>
                      </View>
                      <View
                        onClick={() => deleteProduct(p)}
                        className="px-3 py-1 rounded-full border border-gray-300"
                      >
                        <Text className="text-[11px] text-gray-500 font-medium">
                          删除
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <View className="h-6" />
          </ScrollView>
        </View>
      )}
    </View>
  );
}
