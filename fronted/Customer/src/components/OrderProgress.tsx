import { ArrowLeft, Phone, MessageCircle } from 'lucide-react';

export default function OrderProgress({ onBack }: { onBack: () => void }) {
  const steps = ['已接单', '到店', '配送中', '送达'];
  const currentStep = 1; // "到店" — would be dynamic from order state

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-sm">
        <button onClick={onBack} className="absolute left-4 text-gray-700 active:scale-95"><ArrowLeft size={22}/></button>
        <h1 className="font-bold text-[17px] text-gray-900">订单进度</h1>
      </header>

      {/* Map Placeholder */}
      <div className="w-full h-72 bg-blue-50 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#0085FF_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="bg-white px-5 py-2.5 rounded-full shadow-md z-10 flex items-center gap-2 text-[14px] font-bold text-[#0085FF] active:scale-95 cursor-pointer">骑手正在赶往门店</div>
      </div>

      <div className="px-4 -mt-8 relative z-20 space-y-4">
        <div className="bg-white rounded-[16px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-extrabold text-[20px] text-gray-900">预计 12:30 送达</h2>
              <p className="text-[13px] text-gray-500 mt-1 font-medium">骑手正火速赶往，请耐心等待</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 mb-2">
            <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
              <div className="h-full bg-[#0085FF] rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
            </div>
            <div className="flex justify-between mt-2.5 text-[12px] font-medium text-gray-400">
              {steps.map((step, i) => (
                <span key={i} className={i < currentStep ? 'text-gray-700' : i === currentStep ? 'text-[#0085FF] font-bold' : ''}>{step}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gray-100 rounded-full border border-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5">
                  王师傅 <span className="bg-blue-100 text-[#0085FF] text-[10px] px-1.5 py-0.5 rounded font-medium">蓝骑士</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">满意度 99% · 本月送达 800单</div>
              </div>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-50 transition-colors"><MessageCircle size={18}/></button>
              <button className="w-9 h-9 rounded-full bg-[#0085FF] text-white flex items-center justify-center active:bg-blue-600 transition-colors shadow-sm"><Phone size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
