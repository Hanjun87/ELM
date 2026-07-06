import { useState } from 'react';
import { ArrowLeft, MapPin, Plus, Check, Edit3, Trash2 } from 'lucide-react';
import { mockAddresses, Address } from '../store';

export default function AddressPage({ onBack }: { onBack: () => void }) {
  const [addrs, setAddrs] = useState(mockAddresses);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tag:'', contact:'', phone:'', addr:'' });

  const setDefault = (id: number) => setAddrs(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  const deleteAddr = (id: number) => setAddrs(prev => prev.filter(a => a.id !== id));
  const openEdit = (a: Address) => { setForm({ tag:a.tag, contact:a.contact, phone:a.phone, addr:a.addr }); setEditing(a); setShowForm(true); };
  const openNew = () => { setForm({ tag:'', contact:'', phone:'', addr:'' }); setEditing(null); setShowForm(true); };
  const save = () => {
    if (!form.contact || !form.addr) return;
    if (editing) { setAddrs(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a)); }
    else { setAddrs(prev => [...prev, { id:Date.now(), ...form, distanceKm: 3, isDefault:false }]); }
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="w-full min-h-screen bg-[#F5F5F5]">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100 shadow-sm gap-3">
          <button onClick={() => setShowForm(false)} className="text-gray-700"><ArrowLeft size={22}/></button>
          <h1 className="font-bold text-[17px] text-[#0085FF] flex-1">{editing ? '编辑地址' : '新增地址'}</h1>
          <button onClick={save} className="text-[#0085FF] font-bold text-[14px]">保存</button>
        </header>
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            {['公司','家','学校','其他'].map(t => (
              <button key={t} onClick={() => setForm(p => ({...p, tag:t}))}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium border ${form.tag===t?'bg-[#0085FF] text-white border-[#0085FF]':'bg-white border-gray-200 text-gray-600'}`}>{t}</button>
            ))}
          </div>
          <input className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="联系人" value={form.contact} onChange={e => setForm(p => ({...p, contact:e.target.value}))} />
          <input className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="手机号" value={form.phone} onChange={e => setForm(p => ({...p, phone:e.target.value}))} />
          <textarea className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-[14px] outline-none focus:border-[#0085FF] resize-none h-24" placeholder="详细地址" value={form.addr} onChange={e => setForm(p => ({...p, addr:e.target.value}))} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] pb-24">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100 shadow-sm gap-3">
        <button onClick={onBack} className="text-gray-700"><ArrowLeft size={22}/></button>
        <h1 className="font-bold text-[17px] text-[#0085FF] flex-1">收货地址</h1>
        <button onClick={openNew} className="text-[#0085FF]"><Plus size={22}/></button>
      </header>
      <div className="p-4 space-y-3">
        {addrs.map(a => (
          <div key={a.id} className={`bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border ${a.isDefault ? 'border-[#0085FF]' : 'border-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className={a.isDefault ? 'text-[#0085FF]' : 'text-gray-400'} />
              <span className="font-bold text-[15px] text-gray-900">{a.tag}</span>
              {a.isDefault && <span className="text-[10px] bg-blue-50 text-[#0085FF] px-2 py-0.5 rounded-full font-medium">默认</span>}
            </div>
            <div className="text-[14px] text-gray-800 mb-1">{a.contact} {a.phone}</div>
            <div className="text-[12px] text-gray-500 mb-3">{a.addr}</div>
            <div className="flex gap-2">
              {!a.isDefault && <button onClick={() => setDefault(a.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#0085FF] text-[#0085FF] text-[12px] font-medium"><Check size={14}/>设为默认</button>}
              <button onClick={() => openEdit(a)} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 text-[12px]"><Edit3 size={14}/>编辑</button>
              <button onClick={() => deleteAddr(a.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-red-500 text-[12px]"><Trash2 size={14}/>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
