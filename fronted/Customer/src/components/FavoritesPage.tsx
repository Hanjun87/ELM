import { ArrowLeft, Star, Coffee, Heart } from 'lucide-react';

interface FavoriteStore {
  id: string;
  name: string;
  image?: string;
  rating: number;
  tag: string;
}

const favorites: FavoriteStore[] = [
  { id: 'mcdonalds', name: '麦当劳 (科技园南区店)', image: 'https://images.unsplash.com/photo-1626082895617-2c6bafdf6b29?auto=format&fit=crop&q=80&w=200', rating: 4.8, tag: '月售5000+' },
  { id: 'nayuki', name: '奈雪的茶 (万象天地店)', rating: 4.9, tag: '月售2000+' },
];

export default function FavoritesPage({ onBack, onStoreClick }: { onBack: () => void; onStoreClick: (id: string) => void }) {
  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] pb-24">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100 shadow-sm gap-3">
        <button onClick={onBack} className="text-gray-700"><ArrowLeft size={22}/></button>
        <h1 className="font-bold text-[17px] text-[#0085FF] flex-1">我的收藏</h1>
      </header>
      <div className="p-4 space-y-3">
        {favorites.map(f => (
          <div key={f.id} onClick={() => onStoreClick(f.id)}
            className="bg-white rounded-[16px] p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex gap-3 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
              {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <Coffee size={28} className="text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-gray-900 truncate">{f.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center text-[#FF5000]"><Star size={12} className="fill-current" /><span className="text-[11px] font-bold ml-0.5">{f.rating}</span></div>
                <span className="text-[11px] text-gray-500">{f.tag}</span>
              </div>
            </div>
            <Heart size={18} className="text-[#FF5000] fill-current shrink-0 self-center" />
          </div>
        ))}
        {favorites.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-[14px]">暂无收藏的店铺</div>
        )}
      </div>
    </div>
  );
}
