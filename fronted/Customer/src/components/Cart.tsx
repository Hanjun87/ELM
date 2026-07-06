import { MapPin, ChevronRight, CheckCircle2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Header } from '@shared';
import { CartItem, updateCartItem, clearCart } from '../store';

const CheckIcon = ({ checked, onClick }: { checked: boolean; onClick: () => void }) => (
  checked
    ? <CheckCircle2 size={22} onClick={onClick} className="text-[#0085FF] fill-blue-50 shrink-0 cursor-pointer active:scale-90 transition-transform" />
    : <div onClick={onClick} className="w-[22px] h-[22px] rounded-full border-2 border-gray-300 shrink-0 cursor-pointer active:scale-90 hover:border-[#0085FF]" />
);

export default function Cart({ cart, onCheckout }: { cart: CartItem[]; onCheckout?: () => void }) {
  const storeName = cart[0]?.storeName || '';
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const count = cart.reduce((s, c) => s + c.quantity, 0);
  const packagingFee = cart.length > 0 ? 2 : 0;
  const allSelected = true;

  return (
    <div className="w-full pb-[140px]">
      <Header title="购物车" rightAction={cart.length > 0 ? <button onClick={() => clearCart()} className="text-gray-400 hover:text-[#FF5000] text-[13px] font-medium transition-colors">清空</button> : undefined} />

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <ShoppingCart size={64} className="mb-4 text-gray-200" />
          <p className="text-[15px] font-medium">购物车是空的</p>
          <p className="text-[12px] mt-1">去首页逛逛吧</p>
        </div>
      ) : (
        <div className="px-4 space-y-4 mt-3">
          {/* Address */}
          <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform border border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0085FF] shadow-sm shrink-0"><MapPin size={20} className="fill-blue-100" /></div>
              <div className="flex-1 overflow-hidden">
                <div className="font-bold text-gray-900 text-[15px] truncate">送至：科技园区 A座 1501</div>
                <div className="text-xs text-gray-500 mt-1 truncate font-medium">张先生 (先生) 138****8888</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </div>

          {/* Items */}
          <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4 border border-gray-50">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckIcon checked={allSelected} onClick={() => {}} />
                <span className="font-bold text-[15px] text-gray-900">{storeName}</span>
              </div>
              <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">免配送费</span>
            </div>

            {cart.map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                <CheckIcon checked={true} onClick={() => {}} />
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50 shadow-sm shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="font-bold text-[14px] text-gray-900 line-clamp-2 leading-snug">{item.name}</div>
                    {item.specs && <div className="text-[11px] text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 mt-1.5 rounded font-medium">{item.specs}</div>}
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="font-bold text-[#FF5000] text-[17px] tracking-tight"><span className="text-[12px] font-normal mr-0.5">&#165;</span>{item.price.toFixed(1)}</div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateCartItem(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 active:scale-90 active:bg-gray-50 transition-all"><Minus size={14} /></button>
                      <span className="text-sm font-bold w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-[#0085FF] text-white flex items-center justify-center active:scale-90 hover:bg-blue-600 transition-all shadow-sm"><Plus size={14} strokeWidth={3} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end items-center gap-2 text-xs pt-3.5 border-t border-dashed border-gray-200 mt-1">
              {packagingFee > 0 && <span className="text-gray-500 font-medium">包装费 &#165;{packagingFee}</span>}
              <span className="font-bold text-[13px] ml-1 text-gray-800">小计: <span className="text-[#FF5000] text-[18px]">&#165;{(total + packagingFee).toFixed(1)}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-center z-40 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col justify-center">
            <div className="font-bold text-[14px] text-gray-900 leading-none">合计: <span className="text-[#FF5000] text-[20px] font-extrabold tracking-tight">&#165;{(total + packagingFee).toFixed(1)}</span></div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">免配送费</div>
          </div>
          <button onClick={onCheckout} className="bg-[#0085FF] hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full text-[15px] shadow-md active:scale-95 transition-all">去结算({count})</button>
        </div>
      )}
    </div>
  );
}
