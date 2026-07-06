import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function Settings({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-sm">
        <button onClick={onBack} className="absolute left-4 text-gray-700 active:scale-95"><ArrowLeft size={22}/></button>
        <h1 className="font-bold text-[17px] text-gray-900">设置</h1>
      </header>

      <div className="mt-3 bg-white border-y border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {['个人信息', '账号与安全', '支付设置', '地址管理'].map((item, i, arr) => (
          <div key={i} className={`flex justify-between items-center px-4 py-4 active:bg-gray-50 cursor-pointer ${i !== arr.length -1 ? 'border-b border-gray-50' : ''}`}>
            <span className="text-[15px] font-medium text-gray-800">{item}</span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        ))}
      </div>

      <div className="mt-3 bg-white border-y border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {['通知设置', '通用', '关于我们'].map((item, i, arr) => (
          <div key={i} className={`flex justify-between items-center px-4 py-4 active:bg-gray-50 cursor-pointer ${i !== arr.length -1 ? 'border-b border-gray-50' : ''}`}>
            <span className="text-[15px] font-medium text-gray-800">{item}</span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        ))}
      </div>

      <div className="mt-8 px-4">
        <button className="w-full bg-white text-red-500 font-bold py-3.5 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-[0.98] transition-transform">退出登录</button>
      </div>
    </div>
  );
}
