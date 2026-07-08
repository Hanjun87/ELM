import { useState, FormEvent } from 'react';
import { Loader2, Bike } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@shared';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent) => {
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
      toast(error.response?.data?.message || error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0085FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bike size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0085FF] mb-2">骑手端</h1>
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

        <p className="text-xs text-gray-400 text-center mt-6">
          登录即表示同意用户协议和隐私政策
        </p>
      </div>
    </div>
  );
}
