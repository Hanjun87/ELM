import { useState, useEffect, useCallback, type ComponentType } from 'react';
import { Flame, Soup, Utensils, Coffee, IceCream2, ImageOff, Loader2 } from 'lucide-react';
import { productAPI } from '../api';
import { showModal, toast } from '@shared';
import { Product, Category } from '../types';

const CATEGORY_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  flame: Flame, soup: Soup, utensils: Utensils, coffee: Coffee, icecream: IceCream2,
};
function CategoryIcon({ icon, size, className }: { icon: string; size?: number; className?: string }) {
  const Icon = CATEGORY_ICONS[icon] || Utensils;
  return <Icon size={size} className={className} />;
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes]: any[] = await Promise.all([
        productAPI.list(),
        productAPI.categories(),
      ]);
      if (productsRes.code === 0) setProducts(productsRes.data.items);
      if (categoriesRes.code === 0) setCategories(categoriesRes.data);
    } catch {
      toast('加载商品失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = activeCat === 'all' ? products : products.filter(p => p.category?.id === activeCat);
  const catName = activeCat === 'all' ? '全部' : categories.find(c => c.id === activeCat)?.name || '全部';

  const toggleProduct = async (p: Product) => {
    const nextStatus = p.status === 'on' ? 'off' : 'on';
    try {
      const response: any = await productAPI.toggle(p.id, nextStatus);
      if (response.code === 0) {
        toast(p.name + (nextStatus === 'on' ? ' 已重新上架' : ' 已下架'));
        load();
      } else {
        toast(response.message || '操作失败');
      }
    } catch (e: any) {
      toast(e.response?.data?.message || '操作失败');
    }
  };

  const deleteProduct = (p: Product) => {
    showModal('删除商品', `确定要删除「${p.name}」吗？`, <p className="text-[13px] text-gray-500">删除后不可恢复。</p>, async () => {
      try {
        const response: any = await productAPI.delete(p.id);
        if (response.code === 0) { toast('已删除'); load(); }
        else toast(response.message || '删除失败');
      } catch (e: any) {
        toast(e.response?.data?.message || '删除失败');
      }
    });
  };

  const addProductForm = () => {
    const form = { name: '', price: '', stock: '999', category_id: activeCat !== 'all' ? activeCat : (categories[0]?.id ?? '') };
    showModal('新增商品', '', (
      <div className="flex flex-col gap-3">
        <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="商品名称" onChange={e => { form.name = e.target.value; }} />
        <input type="number" step="0.01" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="价格" onChange={e => { form.price = e.target.value; }} />
        <select defaultValue={form.category_id} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" onChange={e => { form.category_id = Number(e.target.value); }}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" defaultValue="999" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="初始库存" onChange={e => { form.stock = e.target.value; }} />
      </div>
    ), async () => {
      if (!form.name || !form.price) { toast('请填写名称和价格'); return; }
      try {
        const response: any = await productAPI.create({
          name: form.name,
          price: form.price,
          stock: parseInt(form.stock) || 0,
          category_id: form.category_id || undefined,
        });
        if (response.code === 0) { toast('已添加: ' + form.name); load(); }
        else toast(response.message || '添加失败');
      } catch (e: any) {
        toast(e.response?.data?.message || '添加失败');
      }
    });
  };

  return (
    <div className="space-y-0">
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h2 className="font-bold text-[17px] text-gray-900">商品管理</h2>
        <button onClick={addProductForm} className="px-3 py-1.5 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">+ 新增</button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>
      ) : (
        <div className="flex" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="w-[84px] bg-gray-50/80 overflow-y-auto hide-scrollbar flex-shrink-0 border-r border-gray-100">
            <button onClick={() => setActiveCat('all')}
              className={`w-full py-3.5 px-2 text-center text-[12px] flex flex-col items-center gap-1 border-l-2 transition-colors ${activeCat === 'all' ? 'bg-white border-l-[#0085FF] text-[#0085FF] font-bold' : 'border-l-transparent text-gray-500'}`}>
              <Utensils size={20} />全部
            </button>
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
              {filtered.length === 0 && <p className="text-center text-gray-400 text-[13px] py-8">暂无商品</p>}
              {filtered.map(p => (
                <div key={p.id} className={`flex gap-3 ${p.status === 'off' ? 'opacity-60' : ''}`}>
                  <div className="w-[80px] h-[80px] rounded-xl bg-gray-50 flex-shrink-0 relative overflow-hidden">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={32} /></div>}
                    {p.stock === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-[10px] font-bold border border-white rounded px-2 py-0.5">已售罄</span></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[14px] text-gray-900">{p.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${p.status === 'on' ? 'bg-green-50 text-[#00B578]' : 'bg-gray-100 text-gray-500'}`}>{p.status === 'on' ? '上架' : '下架'}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">月售 {p.sales_count} | 库存 {p.stock}</p>
                    <div className="flex justify-between items-end mt-1">
                      <span className="font-bold text-[#FF5000] text-[16px]">¥{p.price}</span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleProduct(p)} className="px-3 py-1 text-[11px] rounded-full border border-[#0085FF] text-[#0085FF] font-medium">
                          {p.status === 'on' ? '下架' : '上架'}
                        </button>
                        <button onClick={() => deleteProduct(p)} className="px-3 py-1 text-[11px] rounded-full border border-gray-300 text-gray-500 font-medium">删除</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
