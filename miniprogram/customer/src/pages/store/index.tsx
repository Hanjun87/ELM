import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { productAPI, merchantAPI } from '../../api';
import { toast } from '../../utils/toast';
import { cartStore } from '../../cartStore';

interface Category {
  id: number;
  name: string;
  icon?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  original_price?: string;
  category?: Category;
}

export default function Store() {
  const [storeId, setStoreId] = useState<number>(0);
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<number | 'all'>('all');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [specModalVisible, setSpecModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('大份');
  const [selectedSpicy, setSelectedSpicy] = useState('不辣');

  useLoad((options) => {
    const id = Number(options.id || 1);
    setStoreId(id);
    loadData(id);
  });

  const loadData = async (id: number) => {
    try {
      const [merchantRes, productsRes, categoriesRes]: any[] = await Promise.all([
        merchantAPI.detail(id),
        productAPI.list(id),
        productAPI.categories(),
      ]);
      if (merchantRes.code === 0) setMerchant(merchantRes.data);
      if (productsRes.code === 0) setProducts(productsRes.data.items || []);
      if (categoriesRes.code === 0) setCategories(categoriesRes.data || []);
    } catch (error) {
      toast('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    setFavorited(!favorited);
    toast(favorited ? '已取消收藏' : '收藏成功');
  };

  const openSpecModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize('大份');
    setSelectedSpicy('不辣');
    setSpecModalVisible(true);
  };

  const confirmSpec = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct.id);
    setSpecModalVisible(false);
    toast(`已添加 ${selectedSize} ${selectedSpicy}`);
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

  const filtered =
    activeCat === 'all'
      ? products
      : products.filter((p) => p.category?.id === activeCat);

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
    <View className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* 店铺头图+收藏按钮 */}
      <View className="relative flex-shrink-0">
        <Image src={merchant?.logo} mode="aspectFill" className="w-full h-48" />
        <View
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
        >
          <Text className={`text-2xl ${favorited ? 'text-red-500' : 'text-gray-400'}`}>
            {favorited ? '❤️' : '🤍'}
          </Text>
        </View>
      </View>

      <View className="bg-white p-4 flex-shrink-0">
        <Text className="block text-xl font-bold">{merchant?.store_name}</Text>
        <View className="flex items-center gap-4 mt-2">
          <Text className="text-sm text-gray-600">⭐ {merchant?.rating}</Text>
          <Text className="text-sm text-gray-600">月售{merchant?.monthly_sales}</Text>
          <Text className="text-sm text-gray-600">起送¥{merchant?.min_order}</Text>
        </View>
      </View>

      {/* 左侧分类栏 + 右侧商品列表 */}
      <View className="flex flex-1 overflow-hidden mt-2">
        {/* 左侧分类 */}
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
        <ScrollView scrollY className="flex-1 bg-white p-4">
          {filtered.map((product) => {
          const count = cart[product.id] || 0;
          return (
            <View
              key={product.id}
              className="flex gap-3 pb-3 mb-3 border-b border-gray-100 last:border-0"
            >
              <Image
                src={product.image}
                mode="aspectFill"
                className="w-20 h-20 rounded-lg"
                onClick={() => openSpecModal(product)}
              />
              <View className="flex-1">
                <Text className="block font-medium">{product.name}</Text>
                <Text className="block text-xs text-gray-500 mt-1">{product.description}</Text>
                <View className="flex items-center justify-between mt-2">
                  <View className="flex items-center">
                    <Text className="text-orange-500 font-bold text-base">¥{product.price}</Text>
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
                          className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center"
                        >
                          <Text className="text-white font-bold">−</Text>
                        </View>
                        <Text className="w-6 text-center font-medium">{count}</Text>
                      </>
                    )}
                    <View
                      onClick={() => openSpecModal(product)}
                      className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center"
                    >
                      <Text className="text-white font-bold">+</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        <View className="h-6" />
        </ScrollView>
      </View>

      {/* 底部购物车栏 */}
      {totalItems > 0 && (
        <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center gap-3 shadow-lg">
          <View className="flex-1">
            <Text className="block text-xl font-bold text-orange-500">¥{totalAmount.toFixed(2)}</Text>
            <Text className="block text-xs text-gray-500">{totalItems}件商品</Text>
          </View>
          <View
            onClick={goCheckout}
            className="px-10 py-3 bg-blue-500 rounded-full"
          >
            <Text className="text-white font-bold">去结算</Text>
          </View>
        </View>
      )}

      {/* 规格选择弹窗 */}
      {specModalVisible && selectedProduct && (
        <View
          onClick={() => setSpecModalVisible(false)}
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-end"
        >
          <View
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl p-6 w-full"
          >
            <View className="flex gap-4 mb-6">
              <Image src={selectedProduct.image} mode="aspectFill" className="w-24 h-24 rounded-xl" />
              <View className="flex-1">
                <Text className="block font-bold text-lg">{selectedProduct.name}</Text>
                <Text className="block text-orange-500 font-bold text-xl mt-2">¥{selectedProduct.price}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="block font-medium mb-2">选择份量</Text>
              <View className="flex gap-2">
                {['小份', '大份', '超大份'].map(size => (
                  <View
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-full ${
                      selectedSize === size
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Text className={selectedSize === size ? 'text-white' : ''}>{size}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="block font-medium mb-2">辣度</Text>
              <View className="flex gap-2">
                {['不辣', '微辣', '中辣', '特辣'].map(spicy => (
                  <View
                    key={spicy}
                    onClick={() => setSelectedSpicy(spicy)}
                    className={`px-4 py-2 rounded-full ${
                      selectedSpicy === spicy
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Text className={selectedSpicy === spicy ? 'text-white' : ''}>{spicy}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View onClick={confirmSpec} className="w-full py-3 bg-blue-500 rounded-full text-center">
              <Text className="text-white font-bold text-base">确认</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
