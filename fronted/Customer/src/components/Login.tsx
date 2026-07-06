import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@shared';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !password) {
      toast('请输入手机号和密码');
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      toast('登录成功');
      onSuccess();
    } catch (error: any) {
      toast(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 快速登录按钮
  const quickLogin = (phone: string, password: string) => {
    setPhone(phone);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0085FF] mb-2">ELM 外卖</h1>
          <p className="text-gray-500">欢迎回来</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0085FF] focus:outline-none focus:ring-2 focus:ring-blue-100"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0085FF] focus:outline-none focus:ring-2 focus:ring-blue-100"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0085FF] text-white py-3 rounded-xl font-bold text-[16px] active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3 text-center">快速登录（测试账号）</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('13800000001', 'customer')}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100"
            >
              客户账号
            </button>
            <button
              onClick={() => quickLogin('13800000002', 'merchant')}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100"
            >
              商家账号
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          登录即表示同意用户协议和隐私政策
        </p>
      </div>
    </div>
  );
}
