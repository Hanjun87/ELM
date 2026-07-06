import { ArrowLeft, Search, Share, Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { addToCart, updateCartItem, getCartCount, getCartTotal, getState, CrossStoreCartConflict } from '../store';
import { showModal, closeModal } from '@shared';

const STORES: Record<string, { name: string; rating: number; sales: string; time: string; fee: string; min: string; image: string; banner: string; tags: string[]; menu: { cat: string; items: { id: string; name: string; price: number; desc: string; sales: number; image: string }[] }[] }> = {
  mcdonalds: {
    name: '麦当劳 (软件园店)', rating: 4.8, sales: '5000+', time: '30分钟', fee: '免配送费', min: '20',
    image: 'https://images.unsplash.com/photo-1626082895617-2c6bafdf6b29?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800',
    tags: ['25减5', '50减12', '蓝骑士专送'],
    menu: [
      { cat: '推荐', items: [
        { id: 'bigmac', name: '巨无霸汉堡', price: 24, desc: '经典双层牛肉，配上特制酱料', sales: 1000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300' },
        { id: 'fries', name: '薯条 (大)', price: 15, desc: '外脆内软，经典美味', sales: 800, image: 'https://images.unsplash.com/photo-1573080496515-d98416d82051?auto=format&fit=crop&q=80&w=300' },
        { id: 'coke', name: '可口可乐 (中)', price: 10, desc: '冰爽解渴', sales: 2000, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300' },
      ]},
      { cat: '汉堡', items: [
        { id: 'double', name: '双层吉士汉堡', price: 28, desc: '双层牛肉+芝士', sales: 600, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300' },
      ]},
      { cat: '小食', items: [
        { id: 'nuggets', name: '麦乐鸡(5块)', price: 12.5, desc: '外酥里嫩', sales: 1500, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=300' },
      ]},
    ]
  },
  nayuki: {
    name: '奈雪的茶 (万象天地店)', rating: 4.9, sales: '2000+', time: '45分钟', fee: '配送 ¥3', min: '30',
    image: '', banner: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800',
    tags: ['霸气系列8折'],
    menu: [
      { cat: '推荐', items: [
        { id: 'nayuki_lemon', name: '霸气柠檬', price: 22, desc: '鲜切柠檬+茉莉绿茶', sales: 3000, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=300' },
        { id: 'nayuki_grape', name: '霸气葡萄', price: 28, desc: '手剥葡萄+茉莉绿茶', sales: 2500, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=300' },
      ]},
    ]
  }
};

export default function StoreDetail({ storeId, onBack, onCheckout }: { storeId: string; onBack: () => void; onCheckout?: () => void }) {
  const store = STORES[storeId] || STORES.mcdonalds;
  const [activeTab, setActiveTab] = useState('点餐');
  const [activeCategory, setActiveCategory] = useState(store.menu[0]?.cat || '推荐');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const redraw = () => forceUpdate(n => n + 1);

  const state = getState();
  const cartTotal = getCartTotal();
  const cartCount = getCartCount();
  const cartItems = state.cart;

  const getQty = (id: string) => {
    const item = cartItems.find(c => c.id === id);
    return item ? item.quantity : 0;
  };

  const handleAdd = (id: string, name: string, price: number, image: string) => {
    try {
      addToCart({ id, name, price, image, quantity: 1, storeId, storeName: store.name });
    } catch (e) {
      if (e instanceof CrossStoreCartConflict) {
        showModal('清空购物车？', '购物车已有其他店铺商品，是否清空并添加？', null, () => {
          addToCart({ id, name, price, image, quantity: 1, storeId, storeName: store.name }, { force: true });
          if (!isCartOpen) setIsCartOpen(true);
          redraw();
        });
        return;
      }
      throw e;
    }
    if (!isCartOpen) setIsCartOpen(true);
    redraw();
  };

  const handleUpdate = (id: string, delta: number) => {
    const qty = getQty(id) + delta;
    updateCartItem(id, qty);
    if (qty === 0 && cartItems.length <= 1) setIsCartOpen(false);
    redraw();
  };

  const handleClear = () => {
    cartItems.forEach(c => updateCartItem(c.id, 0));
    setIsCartOpen(false);
    redraw();
  };

  return (
    <div className="w-full h-[100dvh] bg-[#F5F5F5] flex flex-col relative overflow-hidden">
      {/* Header Image */}
      <div className="relative h-48 w-full z-10 shrink-0">
        <img src={store.banner} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#F5F5F5]"></div>
        <div className="absolute top-0 left-0 w-full flex justify-between px-4 py-3 z-50">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-black/30 text-white backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"><ArrowLeft size={18}/></button>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-black/30 text-white backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"><Search size={18}/></button>
            <button className="w-8 h-8 rounded-full bg-black/30 text-white backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"><Share size={18}/></button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="relative z-20 px-4 -mt-16 shrink-0">
        <div className="bg-white rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col gap-3">
          <div className="flex gap-3 items-center">
            {store.image ? <img src={store.image} className="w-14 h-14 rounded-xl border border-gray-100 shadow-sm" alt="" /> : <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center"><ShoppingCart size={28} className="text-gray-300" /></div>}
            <div>
              <h1 className="font-extrabold text-lg text-gray-900 leading-tight">{store.name}</h1>
              <div className="text-xs text-gray-500 flex gap-2 items-center mt-1 font-medium">
                <span className="text-[#FF5000] flex items-center font-bold"><Star size={12} className="fill-current mr-0.5"/>{store.rating}</span>
                <span>月售{store.sales}</span>
                <span className="text-gray-300">|</span>
                <span>{store.time}</span>
                <span>{store.fee}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {store.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded text-[10px] font-medium whitespace-nowrap">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 mt-3 bg-white border-b border-gray-100 shrink-0">
        {['点餐', '评价', '商家'].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} className={`py-3 mr-6 text-[15px] relative cursor-pointer ${activeTab === tab ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-1 bg-[#0085FF] rounded-full"></div>}
          </div>
        ))}
      </div>

      {/* Content: Categories + Items */}
      <div className="flex flex-1 overflow-hidden bg-white">
        <div className="w-[84px] bg-gray-50/80 overflow-y-auto hide-scrollbar">
          {store.menu.map(cat => (
            <div key={cat.cat} onClick={() => setActiveCategory(cat.cat)} className={`py-3.5 px-3 text-[13px] text-center cursor-pointer ${activeCategory === cat.cat ? 'bg-white font-bold text-gray-900 border-l-2 border-[#0085FF]' : 'text-gray-500 font-medium border-l-2 border-transparent'}`}>
              {cat.cat}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-40 hide-scrollbar">
          {store.menu.filter(c => c.cat === activeCategory).map(cat => (
            <div key={cat.cat}>
              <div className="font-bold text-gray-800 text-[13px] py-3 sticky top-0 bg-white z-10">{cat.cat}</div>
              <div className="flex flex-col gap-5">
                {cat.items.map(item => {
                  const qty = getQty(item.id);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-[96px] h-[96px] shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="font-bold text-[15px] text-gray-900 leading-tight">{item.name}</h3>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{item.desc}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">月售{item.sales}+</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="font-bold text-[#FF5000] text-[17px] tracking-tight"><span className="text-[12px] font-normal mr-0.5">&#165;</span>{item.price.toFixed(2)}</div>
                          {qty > 0 ? (
                            <div className="flex items-center gap-2.5">
                              <button onClick={() => handleUpdate(item.id, -1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 active:scale-90 active:bg-gray-50 transition-all"><Minus size={14} /></button>
                              <span className="text-[13px] font-bold w-2 text-center">{qty}</span>
                              <button onClick={() => handleUpdate(item.id, 1)} className="w-6 h-6 rounded-full bg-[#0085FF] text-white flex items-center justify-center active:scale-90 hover:bg-blue-600 transition-all shadow-sm"><Plus size={14} strokeWidth={3} /></button>
                            </div>
                          ) : (
                            <button onClick={() => handleAdd(item.id, item.name, item.price, item.image)} className="w-6 h-6 rounded-full bg-[#0085FF] text-white flex items-center justify-center active:scale-90 hover:bg-blue-600 transition-all shadow-sm"><Plus size={14} strokeWidth={3} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Overlay */}
      {isCartOpen && cartCount > 0 && (
        <>
          <div className="absolute inset-0 bg-black/40 z-40 transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute bottom-[70px] left-0 w-full bg-white rounded-t-[20px] z-40 flex flex-col max-h-[60vh] shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-t-[20px] border-b border-gray-100 shrink-0">
              <span className="text-[14px] font-bold text-gray-900">已选商品</span>
              <button onClick={handleClear} className="flex items-center text-[12px] text-gray-500 active:text-gray-700">清空</button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4 bg-white flex-1 pb-10">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="text-[15px] font-bold text-gray-900">{item.name}</div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-[#FF5000] text-[16px]"><span className="text-[12px] font-normal mr-0.5">&#165;</span>{(item.price * item.quantity).toFixed(1)}</div>
                    <div className="flex items-center gap-2.5">
                      <button onClick={() => handleUpdate(item.id, -1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 active:scale-90"><Minus size={14} /></button>
                      <span className="text-[13px] font-bold w-2 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdate(item.id, 1)} className="w-6 h-6 rounded-full bg-[#0085FF] text-white flex items-center justify-center active:scale-90 shadow-sm"><Plus size={14} strokeWidth={3} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Cart Bar */}
      <div className="absolute bottom-0 left-0 w-full px-4 pb-safe pt-2 bg-gradient-to-t from-[#F5F5F5] via-[#F5F5F5] to-transparent z-50">
        <div onClick={() => cartCount > 0 && setIsCartOpen(!isCartOpen)} className="flex items-center h-[52px] bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] mb-3 pr-1.5 relative cursor-pointer border border-gray-100">
          <div className={`w-[70px] h-[70px] -mt-5 ml-2 ${cartCount > 0 ? 'bg-[#0085FF]' : 'bg-gray-200'} rounded-full border-[5px] border-[#F5F5F5] flex items-center justify-center shadow-sm shrink-0 relative transition-colors`}>
            <ShoppingCart size={30} className={cartCount > 0 ? "text-white fill-current" : "text-gray-400"} />
            {cartCount > 0 && <div className="absolute -top-1 -right-1 bg-[#FF5000] text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-[#F5F5F5]">{cartCount}</div>}
          </div>
          <div className="flex-1 ml-3 flex flex-col justify-center">
            {cartCount > 0 ? (
              <>
                <div className="font-bold text-gray-900 text-[18px] leading-none tracking-tight"><span className="text-[12px] font-normal mr-0.5">&#165;</span>{cartTotal.toFixed(2)}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{store.fee}</div>
              </>
            ) : (
              <div className="font-medium text-gray-400 text-[14px]">未选购商品</div>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); if (cartCount > 0) onCheckout?.(); }} disabled={cartCount === 0}
            className={`${cartCount > 0 ? 'bg-[#0085FF] hover:bg-blue-600 active:scale-95 text-white shadow-sm' : 'bg-gray-100 text-gray-400'} transition-all font-bold text-[14px] px-6 py-2.5 rounded-full`}>去结算</button>
        </div>
      </div>
    </div>
  );
}
