import { useState } from 'react';
import { Search, Star, TrendingUp } from 'lucide-react';
import { Header } from '@shared';

const allItems = [
  { type:'merchant', id:'mcdonalds', name:'麦当劳 (科技园店)', desc:'汉堡薯条', rating:4.8, sales:'5000+', price:'', tag:'美食' },
  { type:'merchant', id:'nayuki', name:'奈雪的茶 (万象天地)', desc:'茶饮烘焙', rating:4.9, sales:'2000+', price:'', tag:'饮品' },
  { type:'product', id:'bigmac', name:'巨无霸汉堡', desc:'经典双层牛肉', rating:0, sales:'1000+', price:'24.00', tag:'汉堡', storeId:'mcdonalds', storeName:'麦当劳' },
  { type:'product', id:'fries', name:'薯条 (大)', desc:'外脆内软', rating:0, sales:'800+', price:'15.00', tag:'小食', storeId:'mcdonalds', storeName:'麦当劳' },
  { type:'product', id:'nayuki_lemon', name:'霸气柠檬', desc:'鲜切柠檬+茉莉绿茶', rating:0, sales:'3000+', price:'22.00', tag:'饮品', storeId:'nayuki', storeName:'奈雪的茶' },
];

const history = ['巨无霸', '薯条', '奶茶', '火锅', '小笼包'];

export default function SearchPage({ onBack, onStoreClick }: { onBack: () => void; onStoreClick: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof allItems>([]);
  const [showResults, setShowResults] = useState(false);

  const doSearch = (q: string) => {
    setQuery(q);
    if (q.trim().length === 0) { setShowResults(false); return; }
    const kw = q.toLowerCase();
    setResults(allItems.filter(i => i.name.toLowerCase().includes(kw) || i.desc.toLowerCase().includes(kw) || i.tag.includes(kw)));
    setShowResults(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] pt-14">
      <Header onBack={onBack}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input autoFocus type="text" value={query} onChange={e => doSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full py-2 pl-9 pr-4 text-[14px] outline-none focus:ring-2 focus:ring-blue-100" placeholder="搜索商家或商品" />
        </div>
      </Header>

      {!showResults ? (
        <div className="p-4">
          <h3 className="font-bold text-[14px] text-gray-700 mb-3">搜索历史</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button key={i} onClick={() => doSearch(h)} className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[13px] text-gray-600">{h}</button>
            ))}
          </div>
          <div className="mt-5">
            <h3 className="font-bold text-[14px] text-gray-700 mb-3 flex items-center gap-1.5"><TrendingUp size={16} className="text-[#FF5000]"/>热门搜索</h3>
            {['巨无霸套餐','生椰拿铁','薯条','小笼包'].map((h, i) => (
              <button key={i} onClick={() => doSearch(h)} className="block w-full text-left px-4 py-2.5 text-[14px] text-gray-700 border-b border-gray-100">{i+1}. {h}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {results.length === 0 && <div className="text-center py-16 text-gray-400">未找到 "{query}" 的相关结果</div>}
          {results.map((r, i) => (
            <div key={i} onClick={() => r.type === 'merchant' ? onStoreClick(r.id) : onStoreClick(r.storeId!)}
              className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex gap-3 cursor-pointer active:scale-[0.99] transition-transform">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${r.type === 'merchant' ? 'bg-blue-50 text-[#0085FF]' : 'bg-orange-50 text-[#FF5000]'}`}>
                {r.type === 'merchant' ? '店' : '食'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px] text-gray-900">{r.name}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{r.type === 'merchant' ? '商家' : '商品'}</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{r.desc}{r.rating ? ` · ⭐${r.rating}` : ''} · 月售{r.sales}</div>
                {r.price && <div className="text-[#FF5000] font-bold text-[15px] mt-1">¥{r.price}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
