import { useState } from 'react';
import { View, Text, Input, Textarea, Button, Picker, ScrollView } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { productAPI } from '../../api';
import { toast } from '../../utils/toast';
import { Category } from '../../types';

// 商品新增 / 编辑页，替代 Web 端 ProductsTab 里的 showModal 表单。
// 路由参数：id（编辑时传）、category_id（新增时默认分类）
// TODO(扩展点): 图片上传 —— 接入 /uploads 后用 Taro.chooseImage + uploadFile，
//               当前仅支持文本字段，image 字段暂不在小程序端编辑。

export default function ProductEdit() {
  const [id, setId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catIndex, setCatIndex] = useState(0);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('999');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useLoad(async (params) => {
    const editId = params.id ? Number(params.id) : null;
    const defaultCatId = params.category_id ? Number(params.category_id) : null;
    setId(editId);
    setLoading(true);
    try {
      const catRes: any = await productAPI.categories();
      const cats: Category[] = catRes.code === 0 ? catRes.data || [] : [];
      setCategories(cats);

      if (editId) {
        // 编辑：商家商品列表里带全部字段，这里单独拉一次列表定位该商品
        const listRes: any = await productAPI.list();
        if (listRes.code === 0) {
          const p = (listRes.data.items || []).find((x: any) => x.id === editId);
          if (p) {
            setName(p.name);
            setPrice(String(p.price));
            setStock(String(p.stock));
            setDescription(p.description || '');
            const idx = cats.findIndex((c) => c.id === p.category?.id);
            if (idx >= 0) setCatIndex(idx);
          }
        }
      } else if (defaultCatId) {
        const idx = cats.findIndex((c) => c.id === defaultCatId);
        if (idx >= 0) setCatIndex(idx);
      }
    } catch {
      toast('加载失败');
    } finally {
      setLoading(false);
    }
  });

  const save = async () => {
    if (!name || !price) {
      toast('请填写名称和价格');
      return;
    }
    const payload = {
      name,
      price,
      stock: parseInt(stock, 10) || 0,
      description,
      category_id: categories[catIndex]?.id,
    };
    setSaving(true);
    try {
      const res: any = id
        ? await productAPI.update(id, payload)
        : await productAPI.create(payload);
      if (res.code === 0) {
        toast(id ? '已保存' : '已添加');
        Taro.navigateBack();
      } else {
        toast(res.message || '保存失败');
      }
    } catch (e: any) {
      toast(e?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="w-full min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className="w-full min-h-screen bg-[#F5F5F5] p-4">
      <View className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <View className="mb-4">
          <Text className="block text-[13px] font-medium text-gray-700 mb-2">
            商品名称
          </Text>
          <Input
            value={name}
            onInput={(e) => setName(e.detail.value)}
            placeholder="请输入商品名称"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px]"
          />
        </View>

        <View className="mb-4">
          <Text className="block text-[13px] font-medium text-gray-700 mb-2">
            价格 (元)
          </Text>
          <Input
            type="digit"
            value={price}
            onInput={(e) => setPrice(e.detail.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px]"
          />
        </View>

        <View className="mb-4">
          <Text className="block text-[13px] font-medium text-gray-700 mb-2">
            分类
          </Text>
          <Picker
            mode="selector"
            range={categories.map((c) => c.name)}
            value={catIndex}
            onChange={(e) => setCatIndex(Number(e.detail.value))}
          >
            <View className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <Text className="text-[14px] text-gray-800">
                {categories[catIndex]?.name || '请选择分类'}
              </Text>
            </View>
          </Picker>
        </View>

        <View className="mb-4">
          <Text className="block text-[13px] font-medium text-gray-700 mb-2">
            库存
          </Text>
          <Input
            type="number"
            value={stock}
            onInput={(e) => setStock(e.detail.value)}
            placeholder="库存数量"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px]"
          />
        </View>

        <View className="mb-2">
          <Text className="block text-[13px] font-medium text-gray-700 mb-2">
            商品描述
          </Text>
          <Textarea
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            placeholder="选填"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] h-[80px]"
          />
        </View>
      </View>

      <Button
        onClick={save}
        disabled={saving}
        className="w-full bg-[#0085FF] text-white py-3 rounded-xl font-bold text-[16px] mt-4"
      >
        {saving ? '保存中...' : id ? '保存修改' : '添加商品'}
      </Button>
    </ScrollView>
  );
}
