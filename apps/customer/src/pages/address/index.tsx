import { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { addressAPI } from '../../api';
import { toast } from '../../utils/toast';

export default function AddressPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contact_name: '', contact_phone: '', address: '' });

  const loadAddresses = async () => {
    try {
      const response: any = await addressAPI.list();
      if (response.code === 0) {
        setAddresses(response.data.items || response.data || []);
      }
    } catch (error) {
      toast('加载地址失败');
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    loadAddresses();
  });

  const handleSetDefault = async (id: number) => {
    try {
      await addressAPI.setDefault(id);
      toast('设置成功');
      loadAddresses();
    } catch {
      toast('设置失败');
    }
  };

  const handleSave = async () => {
    if (!form.contact_name || !form.contact_phone || !form.address) {
      toast('请填写完整地址信息');
      return;
    }
    try {
      const res: any = await addressAPI.create(form);
      if (res.code === 0) {
        toast('新增成功');
        setShowForm(false);
        setForm({ contact_name: '', contact_phone: '', address: '' });
        loadAddresses();
      } else {
        toast(res.message || '新增失败');
      }
    } catch {
      toast('新增失败');
    }
  };

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5] p-4">
      {loading ? (
        <View className="text-center py-12">
          <Text className="text-gray-400">加载中...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View className="text-center py-12">
          <Text className="text-gray-400">暂无地址</Text>
        </View>
      ) : (
        addresses.map((addr) => (
          <View key={addr.id} className="bg-white rounded-2xl p-4 mb-3">
            <View className="flex items-start justify-between">
              <View className="flex-1">
                <View className="flex items-center gap-2 mb-2">
                  {addr.tag && (
                    <Text className="px-2 py-0.5 bg-blue-50 text-[#0085FF] text-xs rounded">
                      {addr.tag}
                    </Text>
                  )}
                  <Text className="font-bold">{addr.contact_name || addr.name}</Text>
                  <Text className="text-gray-600">{addr.contact_phone || addr.phone}</Text>
                </View>
                <Text className="block text-gray-600 text-sm">{addr.address || addr.detail}</Text>
              </View>
              {addr.is_default ? (
                <Text className="text-[#0085FF] text-sm">默认</Text>
              ) : (
                <Text onClick={() => handleSetDefault(addr.id)} className="text-[#0085FF] text-sm">
                  设为默认
                </Text>
              )}
            </View>
          </View>
        ))
      )}

      {showForm ? (
        <View className="bg-white rounded-2xl p-4 mt-2">
          <Text className="block font-bold mb-3">新增地址</Text>
          <Input
            placeholder="收货人姓名"
            value={form.contact_name}
            onInput={(e) => setForm({ ...form, contact_name: e.detail.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 bg-white"
          />
          <Input
            type="number"
            placeholder="联系电话"
            value={form.contact_phone}
            onInput={(e) => setForm({ ...form, contact_phone: e.detail.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 bg-white"
          />
          <Input
            placeholder="详细地址"
            value={form.address}
            onInput={(e) => setForm({ ...form, address: e.detail.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 bg-white"
          />
          <View className="flex gap-2">
            <View
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 flex items-center justify-center"
            >
              <Text className="text-gray-600">取消</Text>
            </View>
            <View
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-lg bg-[#0085FF] flex items-center justify-center"
            >
              <Text className="text-white font-bold">保存</Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-white rounded-2xl flex items-center justify-center mt-2"
        >
          <Text className="text-[#0085FF] font-bold">+ 新增地址</Text>
        </View>
      )}
    </View>
  );
}
