import { useState } from 'react';
import { MapPin, Search, ChevronDown, Utensils, ShoppingBag, Carrot, IceCream, Pill, Coffee, Ticket, Croissant, Store, LayoutGrid, Star } from 'lucide-react';

interface RestaurantItem {
  id: string;
  name: string;
  image?: string;
  fallbackIcon?: boolean;
  rating: number;
  salesCount: number;
  distanceKm: number;
  time: string;
  minOrder: number;
  deliveryFee: number;
  tags: string[];
  popular: { name: string; price: string; img: string }[];
}

const RESTAURANTS: RestaurantItem[] = [
  {
    id: 'mcdonalds', name: '麦当劳 (科技园南区店)',
    image: 'https://images.unsplash.com/photo-1626082895617-2c6bafdf6b29?auto=format&fit=crop&q=80&w=200',
    rating: 4.8, salesCount: 5000, distanceKm: 1.2, time: '30分钟', minOrder: 20, deliveryFee: 0,
    tags: ['25减2', '首单立减15'],
    popular: [
      { name: '巨无霸套餐', price: '39.9', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200' },
      { name: '麦乐鸡(5块)', price: '12.5', img: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'nayuki', name: '奈雪的茶 (万象天地店)',
    fallbackIcon: true,
    rating: 4.9, salesCount: 2000, distanceKm: 2.5, time: '45分钟', minOrder: 30, deliveryFee: 3,
    tags: ['霸气系列8折'],
    popular: [],
  },
];

type SortMode = 'recommend' | 'sales' | 'distance';

export default function Home({ onStoreClick, onSearch }: { onStoreClick: (id: string) => void; onSearch?: () => void }) {
  const [sortMode, setSortMode] = useState<SortMode>('recommend');

  const sorted = [...RESTAURANTS].sort((a, b) => {
    if (sortMode === 'sales') return b.salesCount - a.salesCount;
    if (sortMode === 'distance') return a.distanceKm - b.distanceKm;
    return 0;
  });

  return (
    <div className="w-full pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-1 text-[#0085FF] cursor-pointer hover:opacity-80">
          <MapPin size={20} className="fill-blue-100" />
          <span className="font-bold text-base truncate max-w-[100px]">科技园南区</span>
          <ChevronDown size={16} />
        </div>
        <div className="flex-1 ml-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="搜索美食、水果、药店" className="w-full bg-gray-100 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 font-medium" readOnly />
        </div>
      </header>

      {/* Categories */}
      <div className="grid grid-cols-5 gap-y-5 px-4 py-5 bg-white">
        {[
          { icon: Utensils, label: '美食外卖', color: 'bg-orange-100 text-orange-500' },
          { icon: ShoppingBag, label: '超市便利', color: 'bg-red-100 text-red-500' },
          { icon: Carrot, label: '买菜', color: 'bg-green-100 text-green-600' },
          { icon: IceCream, label: '甜点饮品', color: 'bg-pink-100 text-pink-500' },
          { icon: Pill, label: '买药', color: 'bg-blue-100 text-[#0085FF]' },
          { icon: Coffee, label: '奶茶果汁', color: 'bg-yellow-100 text-yellow-600' },
          { icon: Ticket, label: '天天神券', color: 'bg-purple-100 text-purple-500' },
          { icon: Croissant, label: '早餐起飞', color: 'bg-teal-100 text-teal-500' },
          { icon: Store, label: '品牌馆', color: 'bg-indigo-100 text-indigo-500' },
          { icon: LayoutGrid, label: '全部分类', color: 'bg-gray-100 text-gray-500' },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform active:scale-95">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
              <item.icon size={22} />
            </div>
            <span className="text-xs text-gray-700 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Promo Banner */}
      <div className="px-4 py-3 bg-white">
        <div className="w-full h-28 rounded-[16px] overflow-hidden relative shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center px-5">
            <div className="text-white">
              <h3 className="font-extrabold text-xl italic tracking-wide">今晚吃什么?</h3>
              <p className="text-[11px] mt-1.5 bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-0.5 rounded-full inline-block font-bold shadow-md">全场美食5折起</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">1 / 3</div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[52px] z-30 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex gap-5">
          {([['recommend', '综合推荐'], ['sales', '销量'], ['distance', '距离']] as [SortMode, string][]).map(([mode, label]) => (
            <span key={mode} onClick={() => setSortMode(mode)}
              className={`text-sm cursor-pointer transition-colors ${sortMode === mode ? 'font-bold text-gray-900' : 'text-gray-500 hover:text-gray-900 font-medium'}`}>
              {label}
            </span>
          ))}
        </div>
        <div className="bg-gray-100 hover:bg-gray-200 transition-colors px-2.5 py-1 rounded-full text-xs text-gray-700 font-medium flex items-center gap-1 cursor-pointer">筛选 <ChevronDown size={12} /></div>
      </div>

      {/* Restaurant List */}
      <div className="px-4 py-3 space-y-4">
        {sorted.map(r => (
          <div key={r.id} onClick={() => onStoreClick(r.id)} className="bg-white rounded-[16px] p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow cursor-pointer border border-gray-50">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                {r.fallbackIcon || !r.image ? <Coffee size={32} className="text-gray-300" /> : <img src={r.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-gray-900 truncate">{r.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-[#FF5000]"><Star size={12} className="fill-current" /><span className="text-[11px] font-bold ml-0.5">{r.rating}</span></div>
                  <span className="text-[11px] text-gray-500">月售{r.salesCount}+</span>
                  <span className="text-[11px] text-gray-500 ml-auto">{r.time} · {r.distanceKm}km</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-gray-500 font-medium">起送 &#165;{r.minOrder}</span>
                  <span className="text-[10px] text-gray-500 font-medium">配送 &#165;{r.deliveryFee}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {r.tags.map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 text-[10px] font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            {r.popular.length > 0 && (
              <div className="mt-4 flex gap-2.5 overflow-x-auto hide-scrollbar">
                {r.popular.map((item, idx) => (
                  <div key={idx} className="w-24 shrink-0 flex flex-col gap-1.5">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shadow-sm"><img src={item.img} alt="" className="w-full h-full object-cover" /></div>
                    <span className="text-[11px] text-gray-800 truncate font-medium">{item.name}</span>
                    <span className="text-[13px] font-bold text-[#FF5000] tracking-tight">&#165;{item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
