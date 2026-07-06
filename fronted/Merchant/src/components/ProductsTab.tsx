import { useState, useEffect, type ComponentType } from 'react';
import { Flame, Soup, Utensils, Coffee, IceCream2, X, ImageOff } from 'lucide-react';
import { products, categories, Category, subscribe } from '../store';
import { showModal, closeModal, toast } from '@shared';

const CATEGORY_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  flame: Flame, soup: Soup, utensils: Utensils, coffee: Coffee, icecream: IceCream2,
};
function CategoryIcon({ icon, size, className }: { icon: string; size?: number; className?: string }) {
  const Icon = CATEGORY_ICONS[icon] || Utensils;
  return <Icon size={size} className={className} />;
}

export default function ProductsTab() {
  const [activeCat, setActiveCat] = useState(categories[0]?.id || 'hot');
  const [, forceUpdate] = useState(0);
  useEffect(() => subscribe(() => forceUpdate(n => n + 1)), []);

  const filtered = products.filter(p => p.cat === activeCat);
  const catName = categories.find(c => c.id === activeCat)?.name || '全部';

  const relistProduct = (id: number) => {
    const p = products.find(x => x.id === id);
    if (p) { p.status = 'on'; p.stock = 99; p.soldOut = false; }
    toast((p?.name || '商品') + ' 已重新上架');
    forceUpdate(n => n + 1);
  };

  const addProductForm = () => {
    const form = { name: '', price: '', cat: activeCat, stock: '999' };
    showModal('新增商品', '', (
      <div className="flex flex-col gap-3">
        <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="商品名称" onChange={e => { form.name = e.target.value; }} />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" step="0.01" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="价格" onChange={e => { form.price = e.target.value; }} />
          <input type="number" step="0.01" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="原价(可选)" />
        </div>
        <select defaultValue={activeCat} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" onChange={e => { form.cat = e.target.value; }}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" defaultValue="999" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="初始库存" onChange={e => { form.stock = e.target.value; }} />
      </div>
    ), () => {
      if (!form.name || !form.price) { toast('请填写名称和价格'); return; }
      products.push({ id: Date.now(), cat: form.cat || activeCat, name: form.name, status: 'on', sales: 0, rating: 100, price: parseFloat(form.price).toFixed(2), stock: parseInt(form.stock) || 999, img: '' });
      toast('已添加: ' + form.name);
      forceUpdate(n => n + 1);
    });
  };

  const editCategories = () => {
    const names = categories.map(c => c.name);
    showModal('编辑分类', '', (
      <div className="flex flex-col gap-2">
        {categories.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
            <CategoryIcon icon={c.icon} className="text-gray-400" />
            <input defaultValue={c.name} className="flex-1 bg-transparent outline-none text-[14px]" onChange={e => { names[i] = e.target.value; }} />
            <button onClick={() => { categories.splice(i, 1); closeModal(); editCategories(); }} className="text-red-400 p-1"><X size={16} /></button>
          </div>
        ))}
        <button onClick={() => { categories.push({ id: 'cat_' + Date.now(), name: '新分类', icon: 'restaurant' }); closeModal(); editCategories(); }}
          className="w-full py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-[13px]">+ 添加分类</button>
      </div>
    ), () => {
      categories.forEach((c, i) => { c.name = names[i]; });
      toast('分类已更新'); forceUpdate(n => n + 1);
    });
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h2 className="font-bold text-[17px] text-gray-900">商品管理</h2>
        <div className="flex gap-2">
          <button onClick={editCategories} className="px-3 py-1.5 rounded-[12px] border border-gray-200 text-[13px] text-gray-600">编辑分类</button>
          <button onClick={addProductForm} className="px-3 py-1.5 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">+ 新增</button>
        </div>
      </div>

      {/* Category sidebar + product list */}
      <div className="flex" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="w-[84px] bg-gray-50/80 overflow-y-auto hide-scrollbar flex-shrink-0 border-r border-gray-100">
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`w-full py-3.5 px-2 text-center text-[12px] flex flex-col items-center gap-1 border-l-2 transition-colors ${activeCat === c.id ? 'bg-white border-l-[#0085FF] text-[#0085FF] font-bold' : 'border-l-transparent text-gray-500'}`}>
              <CategoryIcon icon={c.icon} size={20} />
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-white px-3">
          <div className="font-bold text-[13px] text-gray-800 py-3 sticky top-0 bg-white z-10">{catName}</div>
          <div className="space-y-4 pb-20">
            {filtered.map(p => (
              <div key={p.id} className={`flex gap-3 ${p.soldOut ? 'opacity-60' : ''} ${p.lowStock ? 'border border-red-200 rounded-xl p-2 -mx-1' : ''}`}>
                <div className="w-[80px] h-[80px] rounded-xl bg-gray-50 flex-shrink-0 relative overflow-hidden">
                  {p.img ? <img src={p.img} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={32} /></div>}
                  {p.soldOut && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-[10px] font-bold border border-white rounded px-2 py-0.5">已售罄</span></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[14px] text-gray-900">{p.name}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${p.status === 'on' ? 'bg-green-50 text-[#00B578]' : 'bg-gray-100 text-gray-500'}`}>{p.status === 'on' ? '上架' : '下架'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">月售 {p.sales} | 好评 {p.rating}%</p>
                  <div className="flex justify-between items-end mt-1">
                    <span className="font-bold text-[#FF5000] text-[16px]">¥{p.price}</span>
                    {p.lowStock ? (
                      <span className="text-[10px] text-[#FF5000] font-medium bg-red-50 px-1.5 py-0.5 rounded">库存紧张 ({p.stock}件)</span>
                    ) : p.stock === 0 ? (
                      <button onClick={() => relistProduct(p.id)} className="px-3 py-1 text-[11px] rounded-full border border-[#0085FF] text-[#0085FF] font-medium">重新上架</button>
                    ) : (
                      <span className="text-[11px] text-gray-400">库存: {p.stock}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
