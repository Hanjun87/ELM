#!/bin/bash
# Merchant 和 Rider 小程序快速搭建脚本

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "开始搭建 Merchant 商家端..."

# 1. 复制 customer 的基础设施到 merchant
cp -r customer/src/api merchant/src/
cp -r customer/src/contexts merchant/src/
cp -r customer/src/utils merchant/src/
cp customer/src/types.ts merchant/src/

# 2. 修改 merchant 登录页的测试账号
cat > merchant/src/pages/login/index.tsx << 'EOF'
import { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const quickLogin = (p: string, pwd: string) => {
    setPhone(p);
    setPassword(pwd);
    setTimeout(() => handleLogin(p, pwd), 100);
  };

  const handleLogin = async (p?: string, pwd?: string) => {
    const phoneVal = p || phone;
    const passwordVal = pwd || password;
    if (!phoneVal || !passwordVal) {
      toast('请输入手机号和密码');
      return;
    }
    setLoading(true);
    try {
      await login(phoneVal, passwordVal);
      toast('登录成功');
      setTimeout(() => Taro.switchTab({ url: '/pages/orders/index' }), 500);
    } catch (error: any) {
      toast(error?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <Text className="block text-2xl font-bold text-center mb-6">ELM 商家端</Text>
        <View className="mb-4">
          <Text className="block text-sm mb-2">手机号</Text>
          <Input
            type="number"
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            placeholder="请输入手机号"
            className="w-full px-4 py-3 bg-gray-50 rounded-lg"
          />
        </View>
        <View className="mb-6">
          <Text className="block text-sm mb-2">密码</Text>
          <Input
            type="text"
            password
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
            placeholder="请输入密码"
            className="w-full px-4 py-3 bg-gray-50 rounded-lg"
          />
        </View>
        <View
          onClick={loading ? undefined : () => handleLogin()}
          className={\`w-full py-3 rounded-full text-center \${loading ? 'bg-gray-300' : 'bg-blue-500'}\`}
        >
          <Text className="text-white font-bold">{loading ? '登录中...' : '登录'}</Text>
        </View>
        <View className="mt-4 pt-4 border-t">
          <Text className="block text-xs text-gray-500 text-center mb-2">快速登录</Text>
          <View onClick={() => quickLogin('13800000002', 'merchant')} className="px-4 py-2 border rounded-lg text-center">
            <Text className="text-sm">商家账号</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
EOF

echo "Merchant 基础设施搭建完成"
echo "接下来需要手动创建：orders/products/stats/profile 四个 tab 页面"
