import { useState, useEffect } from 'react';
import { orders, subscribe } from '../store';
import { showModal, toast } from '@shared';

export default function OrdersTab() {
  const [filter, setFilter] = useState('pending');
  const [autoAccept, setAutoAccept] = useState(false);
  const [, forceUpdate] = useState(0);
  useEffect(() => subscribe(() => forceUpdate(n => n + 1)), []);

  const filtered = orders.filter(o => filter === 'pending' ? o.status === 'pending' : filter === 'progress' ? o.status === 'progress' : true);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const progressCount = orders.filter(o => o.status === 'progress').length;

  const acceptOrder = (id: number) => {
    const o = orders.find(x => x.id === id);
    if (o) { o.status = 'progress'; o.label = '备餐中'; o.timer = ''; }
    toast('已接单 #' + id); forceUpdate(n => n + 1);
  };

  useEffect(() => {
    if (!autoAccept || pendingCount === 0) return;
    orders.filter(o => o.status === 'pending').forEach(o => acceptOrder(o.id));
  }, [autoAccept, pendingCount]);
  const rejectOrder = (id: number) => {
    let reason = '';
    showModal('拒单原因', '', <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] outline-none focus:border-[#0085FF]" placeholder="请输入拒单原因" onChange={e => { reason = e.target.value; }} />, () => {
      orders.splice(orders.findIndex(x => x.id === id), 1);
      toast('已拒单 #' + id + (reason ? ': ' + reason : ''));
      forceUpdate(n => n + 1);
    });
  };
  const readyOrder = (id: number) => {
    const o = orders.find(x => x.id === id);
    if (o) { o.status = 'completed'; o.label = '已完成'; }
    toast('出餐完成 #' + id); forceUpdate(n => n + 1);
  };
  const printReceipt = (id: number) => {
    const o = orders.find(x => x.id === id);
    toast('打印小票: #' + id + (o ? ' | ' + o.items + ' | ¥' + o.amount : ''));
  };

  const tabs = [
    { key: 'pending', label: '待处理', count: pendingCount },
    { key: 'progress', label: '进行中', count: progressCount },
    { key: 'all', label: '全部', count: orders.length },
  ];

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <h2 className="font-bold text-[17px] text-gray-900">订单管理</h2>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-500">{autoAccept ? '自动接单中' : '手动接单'}</span>
          <button onClick={() => { setAutoAccept(!autoAccept); toast(autoAccept ? '已切换为手动接单' : '自动接单已开启'); }}
            className={`relative w-14 h-7 rounded-full transition-colors ${autoAccept ? 'bg-[#0085FF]' : 'bg-gray-300'}`}>
            <div className={`absolute top-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform ${autoAccept ? 'translate-x-[25px]' : 'translate-x-[3px]'}`} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white px-4 border-b border-gray-100 flex gap-4 overflow-x-auto hide-scrollbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`py-3 text-[14px] font-bold whitespace-nowrap relative ${filter === t.key ? 'text-[#0085FF]' : 'text-gray-500'}`}>
            {t.label}
            {t.count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === t.key ? 'bg-[#0085FF] text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}
            {filter === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0085FF] rounded-full" />}
          </button>
        ))}
      </div>

      {/* Order list */}
      <div className="p-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ReceiptIcon />
            <p className="mt-3 text-[14px]">暂无订单</p>
          </div>
        )}
        {filtered.map(o => (
          <div key={o.id} className={`bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 ${o.status !== 'pending' ? 'opacity-75' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-gray-400">{o.no}</span>
                <span className="text-[11px] text-gray-500">{o.time}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${o.status === 'pending' ? 'bg-red-50 text-[#FF5000]' : 'bg-green-50 text-[#00B578]'}`}>{o.label}</span>
            </div>
            <h3 className="font-bold text-[14px] text-gray-900 mb-1">{o.items}</h3>
            {o.distance && <p className="text-[11px] text-gray-500">距离 {o.distance}{o.eta ? ' · 预计 ' + o.eta + ' 送达' : ''}</p>}
            {o.note && <p className="text-[11px] text-[#FF5000] mt-1"><span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500 mr-1">备注</span>{o.note}</p>}
            {o.newCustomer && <span className="inline-block mt-1 text-[10px] bg-green-50 text-[#00B578] px-2 py-0.5 rounded">新客首单</span>}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <span className="text-[12px] text-gray-500">实付 <span className="font-bold text-[16px] text-gray-900">¥{o.amount}</span></span>
              <div className="flex gap-2">
                {o.status === 'pending' && (
                  <>
                    <button onClick={() => rejectOrder(o.id)} className="px-4 py-2 rounded-[12px] border border-gray-200 text-[13px] font-medium text-gray-700">拒绝单</button>
                    <button onClick={() => acceptOrder(o.id)} className="px-5 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">立即接单</button>
                  </>
                )}
                {o.status === 'progress' && (
                  <>
                    <button onClick={() => printReceipt(o.id)} className="px-4 py-2 rounded-[12px] border border-gray-200 text-[13px] text-gray-700">补打小票</button>
                    <button onClick={() => readyOrder(o.id)} className="px-5 py-2 rounded-[12px] bg-[#0085FF] text-white text-[13px] font-bold">出餐完成</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg className="mx-auto text-gray-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16v4l-2 2 2 2v4H4v-4l2-2-2-2V4z" /><path d="M8 4v16" />
    </svg>
  );
}
