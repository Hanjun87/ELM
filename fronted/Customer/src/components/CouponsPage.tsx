import { Ticket, Clock } from 'lucide-react';
import { Header } from '@shared';
import { mockCoupons } from '../store';

export default function CouponsPage({ onBack }: { onBack: () => void }) {
  const unused = mockCoupons.filter(c => c.status === 'unused');
  const used = mockCoupons.filter(c => c.status !== 'unused');

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] pt-14 pb-24">
      <Header onBack={onBack} rightAction={<span className="text-[12px] text-gray-400">{unused.length}张可用</span>}>
        <h1 className="text-[17px] font-bold text-gray-900">优惠券</h1>
      </Header>
      <div className="p-4 space-y-4">
        {unused.length > 0 && (
          <div>
            <h3 className="font-bold text-[14px] text-gray-700 mb-2 px-1">可使用</h3>
            <div className="space-y-2.5">
              {unused.map(c => (
                <div key={c.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#0085FF]/10 flex items-center justify-center text-[#0085FF] shrink-0"><Ticket size={28} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start"><span className="font-bold text-[15px] text-gray-900">{c.name}</span><span className="text-[#FF5000] font-bold text-[18px]">{c.label}</span></div>
                    <div className="text-[11px] text-gray-500 mt-1">{c.condition}</div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1.5"><Clock size={12} />{c.expire}前有效</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {used.length > 0 && (
          <div>
            <h3 className="font-bold text-[14px] text-gray-400 mb-2 px-1">已使用/已过期</h3>
            <div className="space-y-2.5 opacity-60">
              {used.map(c => (
                <div key={c.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"><Ticket size={28} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start"><span className="font-bold text-[15px] text-gray-400">{c.name}</span><span className="text-gray-400 font-bold text-[18px]">{c.label}</span></div>
                    <div className="text-[11px] text-gray-400 mt-1">{c.condition}</div>
                    <div className="text-[11px] text-gray-400 mt-1.5">{c.status === 'expired' ? '已过期' : '已使用'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
