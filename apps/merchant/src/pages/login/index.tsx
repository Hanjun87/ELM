import { useState } from 'react';
import { View, Text, Input, Button, Form } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) {
      toast('请输入手机号和密码');
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      toast('登录成功');
      // 登录后进入订单 tab（商家端首页）
      Taro.switchTab({ url: '/pages/orders/index' });
    } catch (error: any) {
      toast(error?.data?.message || error?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (p: string, pw: string) => {
    setPhone(p);
    setPassword(pw);
  };

  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <View className="bg-white rounded-2xl shadow-xl p-8 w-full">
        <View className="text-center mb-8">
          <Text className="block text-3xl font-bold text-[#0085FF] mb-2">商家管理端</Text>
          <Text className="block text-gray-500">欢迎回来</Text>
        </View>

        <Form>
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">手机号</Text>
            <Input
              type="number"
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
              disabled={loading}
            />
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">密码</Text>
            <Input
              password
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
              disabled={loading}
            />
          </View>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#0085FF] text-white py-3 rounded-xl font-bold text-[16px] mt-2"
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </Form>

        <View className="mt-6 pt-6 border-t border-gray-100">
          <Text className="block text-sm text-gray-500 mb-3 text-center">快速登录（测试账号）</Text>
          <View className="flex gap-2">
            <Button
              onClick={() => quickLogin('13800000002', 'merchant')}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
            >
              商家账号
            </Button>
          </View>
        </View>

        <Text className="block text-xs text-gray-400 text-center mt-6">
          登录即表示同意用户协议和隐私政策
        </Text>
      </View>
    </View>
  );
}
