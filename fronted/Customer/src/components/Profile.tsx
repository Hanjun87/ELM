import { Settings, Smartphone, MapPin, Heart, HeadphonesIcon, Gavel, Handshake } from 'lucide-react';

export default function Profile({ onSettings, onAddress, onCoupons, onService, onFavorites }: { onSettings?: () => void; onAddress?: () => void; onCoupons?: () => void; onService?: () => void; onFavorites?: () => void }) {
  return (
    <div className="w-full min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <span className="w-8" />
        <h1 className="font-bold text-[17px] text-[#0085FF]">我的</h1>
        <button onClick={onSettings} className="text-gray-500 hover:text-[#0085FF] active:scale-95 w-8 flex items-center justify-center transition-colors">
          <Settings size={22} />
        </button>
      </header>

      {/* User Info */}
      <div className="px-5 pt-3 pb-7 bg-white rounded-b-[24px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/80 rounded-bl-full"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full overflow-hidden border-[3px] border-white shadow-md shrink-0">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-extrabold text-gray-900 tracking-tight">美食家_789</h2>
            <div className="flex items-center text-[13px] text-gray-500 mt-1 gap-1 font-medium">
              <Smartphone size={14} />
              <span>138****5678</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Assets */}
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] grid grid-cols-3 divide-x divide-gray-100">
          {[{ val: '12', label: '红包', color: 'text-[#FF5000]' }, { val: '5', label: '优惠券', color: 'text-[#FF5000]' }, { val: '500', label: '金币', color: 'text-yellow-500' }].map((item, i) => (
            <div key={i} className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 py-2 transition-colors active:scale-95">
              <span className={`font-extrabold text-[22px] leading-none tracking-tighter ${item.color}`}>{item.val}</span>
              <span className="text-[12px] text-gray-600 mt-2 font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Tools */}
        <div>
          <h3 className="font-bold text-[15px] text-gray-900 mb-3 px-2">常用功能</h3>
          <div className="bg-white rounded-[16px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] grid grid-cols-4 gap-y-7 gap-x-2">
            {[
              { icon: MapPin, label: '收货地址', action: onAddress },
              { icon: Heart, label: '我的收藏', action: onFavorites },
              { icon: HeadphonesIcon, label: '客服中心', action: onService },
              { icon: Gavel, label: '资质规则', action: () => {} },
              { icon: Handshake, label: '商务合作', action: () => {} }
            ].map((tool, idx) => (
              <div key={idx} onClick={() => tool.action?.()} className="flex flex-col items-center gap-2.5 cursor-pointer group hover:scale-105 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-sm">
                  <tool.icon size={20} className="text-gray-500 group-hover:text-[#0085FF] transition-colors" />
                </div>
                <span className="text-[12px] text-gray-600 font-medium group-hover:text-[#0085FF] transition-colors">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="w-full bg-white text-red-500 font-bold text-[15px] py-3.5 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] mt-5 hover:bg-red-50 active:scale-[0.98] transition-all border border-gray-50">
          退出登录
        </button>
      </div>
    </div>
  );
}
