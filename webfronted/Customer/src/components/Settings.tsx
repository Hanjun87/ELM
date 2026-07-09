import { ChevronRight } from 'lucide-react';
import { Header, toast } from '@shared';

export default function Settings({ onBack }: { onBack: () => void }) {
  const handleMenuItem = (item: string) => {
    toast(`${item}功能开发中`);
  };

  const handleLogout = () => {
    if (confirm('确认退出登录吗？')) {
      toast('退出成功');
      // 实际应用中应该清除登录状态
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] pt-14">
      <Header title="设置" onBack={onBack} />

      <div className="mt-3 bg-white border-y border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {['个人信息', '账号与安全', '支付设置', '地址管理'].map((item, i, arr) => (
          <button
            key={i}
            onClick={() => handleMenuItem(item)}
            className={`w-full flex justify-between items-center px-4 py-4 active:bg-gray-50 cursor-pointer ${i !== arr.length -1 ? 'border-b border-gray-50' : ''}`}
          >
            <span className="text-[15px] font-medium text-gray-800">{item}</span>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        ))}
      </div>

      <div className="mt-3 bg-white border-y border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {['通知设置', '通用', '关于我们'].map((item, i, arr) => (
          <button
            key={i}
            onClick={() => handleMenuItem(item)}
            className={`w-full flex justify-between items-center px-4 py-4 active:bg-gray-50 cursor-pointer ${i !== arr.length -1 ? 'border-b border-gray-50' : ''}`}
          >
            <span className="text-[15px] font-medium text-gray-800">{item}</span>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        ))}
      </div>

      <div className="mt-8 px-4">
        <button onClick={handleLogout} className="w-full bg-white text-red-500 font-bold py-3.5 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-[0.98] transition-transform">退出登录</button>
      </div>
    </div>
  );
}
