import { useState } from 'react';
import { ChevronRight, MapPin, Ticket } from 'lucide-react';
import { showModal, closeModal, toast, Header } from '@shared';
import { CartItem, placeOrder, mockAddresses, mockCoupons, Address, Coupon } from '../store';

function deliveryFeeFor(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return Math.min(8, Math.max(3, Math.round(distanceKm * 1.5)));
}

export default function Checkout({ cart, onBack }: { cart: CartItem[]; onBack: () => void }) {
  const storeName = cart[0]?.storeName || '';
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const defaultAddress = mockAddresses.find(a => a.isDefault) || mockAddresses[0];
  const [address, setAddress] = useState<Address | undefined>(defaultAddress);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const deliveryFee = deliveryFeeFor(address?.distanceKm ?? 0);
  const couponDiscount = coupon ? Math.min(coupon.amountOff, total + deliveryFee) : 0;
  const payable = Math.max(0, total + deliveryFee - couponDiscount);

  const availableCoupons = mockCoupons.filter(c => c.status === 'unused' && c.amountOff > 0 && total >= c.minSpend);

  const openAddressPicker = () => {
    showModal('选择收货地址', '', (
      <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
        {mockAddresses.map(a => (
          <button key={a.id} onClick={() => { setAddress(a); closeModal(); }}
            className={`text-left px-4 py-3 rounded-xl border ${address?.id === a.id ? 'border-[#0085FF] bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900">
              <span className="bg-blue-100 text-[#0085FF] text-[10px] px-1.5 py-0.5 rounded leading-none">{a.tag}</span>
              {a.addr}
            </div>
            <div className="text-[12px] text-gray-500 mt-1">{a.contact} {a.phone}</div>
          </button>
        ))}
      </div>
    ), undefined);
  };

  const openCouponPicker = () => {
    showModal('选择优惠券', '', (
      <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
        <button onClick={() => { setCoupon(null); closeModal(); }}
          className={`text-left px-4 py-3 rounded-xl border ${!coupon ? 'border-[#0085FF] bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
          不使用优惠券
        </button>
        {availableCoupons.map(c => (
          <button key={c.id} onClick={() => { setCoupon(c); closeModal(); }}
            className={`text-left px-4 py-3 rounded-xl border flex justify-between items-center ${coupon?.id === c.id ? 'border-[#0085FF] bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
            <div>
              <div className="text-[14px] font-bold text-gray-900">{c.name}</div>
              <div className="text-[12px] text-gray-500 mt-1">{c.condition}</div>
            </div>
            <span className="text-[#FF5000] font-bold text-[16px]">{c.label}</span>
          </button>
        ))}
        {availableCoupons.length === 0 && <p className="text-center text-gray-400 text-[13px] py-4">暂无可用优惠券</p>}
      </div>
    ), undefined);
  };

  const handleSubmit = () => {
    const order = placeOrder();
    toast('下单成功! 订单号: ' + order.id);
    onBack();
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] pt-14 pb-24">
      <Header title="确认订单" onBack={onBack} />

      <div className="p-4 space-y-3">
        {/* Address */}
        <div onClick={openAddressPicker} className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.03)] cursor-pointer active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0085FF]"><MapPin size={20} /></div>
            {address ? (
              <div>
                <div className="flex items-center gap-1.5 text-[15px] font-bold text-gray-900">
                  <span className="bg-blue-100 text-[#0085FF] text-[10px] px-1.5 py-0.5 rounded leading-none">{address.tag}</span>
                  {address.addr}
                </div>
                <div className="text-[13px] text-gray-500 mt-1.5">{address.contact} {address.phone}</div>
              </div>
            ) : (
              <span className="text-[14px] text-gray-500">请选择收货地址</span>
            )}
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Coupon */}
        <div onClick={openCouponPicker} className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.03)] cursor-pointer active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF5000]"><Ticket size={20} /></div>
            <span className="text-[14px] font-medium text-gray-800">{coupon ? coupon.name : '使用优惠券'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {coupon && <span className="text-[#FF5000] font-bold text-[14px]">-¥{couponDiscount.toFixed(1)}</span>}
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="font-bold text-[14px] text-gray-900 border-b border-gray-100 pb-3 mb-3">{storeName}</div>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2">
              <div className="text-[14px] text-gray-800">{item.name} x{item.quantity}</div>
              <div className="font-bold text-[15px] text-gray-900">&#165;{(item.price * item.quantity).toFixed(1)}</div>
            </div>
          ))}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="text-[14px] text-gray-800">配送费</div>
            <div className="font-bold text-[15px] text-gray-900">{deliveryFee === 0 ? '免费' : '¥' + deliveryFee}</div>
          </div>
          {coupon && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="text-[14px] text-gray-800">优惠券</div>
              <div className="font-bold text-[15px] text-[#FF5000]">-¥{couponDiscount.toFixed(1)}</div>
            </div>
          )}
          <div className="flex justify-between items-center pt-3.5">
            <span className="text-[14px] text-gray-600">小计 ({cart.reduce((s,c) => s+c.quantity, 0)}件)</span>
            <span className="text-[#FF5000] font-extrabold text-[18px] tracking-tight">&#165;{payable.toFixed(1)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="text-[14px] font-medium text-gray-600 mb-2">备注</div>
          <textarea className="w-full bg-gray-50 rounded-xl p-3 text-[13px] border border-gray-100 focus:border-[#0085FF] focus:ring-1 focus:ring-blue-100 resize-none h-20 font-medium text-gray-800 placeholder:text-gray-400" placeholder="口味要求、配送注意事项等" />
        </div>
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-safe flex justify-between items-center z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-baseline">
          <span className="text-[13px] text-gray-600">合计</span>
          <span className="text-[#FF5000] font-extrabold text-[22px] ml-1.5 tracking-tight">&#165;{payable.toFixed(1)}</span>
        </div>
        <button onClick={handleSubmit} disabled={!address} className={`font-bold px-8 py-2.5 rounded-full active:scale-95 transition-all shadow-md ${address ? 'bg-[#0085FF] hover:bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>提交订单</button>
      </div>
    </div>
  );
}
