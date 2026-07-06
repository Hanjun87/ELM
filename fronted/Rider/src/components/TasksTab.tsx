import { useState, useEffect } from 'react';
import { Map, Phone, AlertTriangle } from 'lucide-react';
import { toast } from '@shared';
import { orders, subscribe, updateOrderStatus, removeOrder } from '../store';

export default function TasksTab() {
  const [activeSubTab, setActiveSubTab] = useState('进行中');
  const [showException, setShowException] = useState<number | null>(null);
  const [exceptionForm, setExceptionForm] = useState({ type: '', desc: '' });
  const [, forceUpdate] = useState(0);
  useEffect(() => subscribe(() => forceUpdate(n => n + 1)), []);

  const progress = orders.filter(o => ['pickup', 'delivering'].includes(o.status));
  const waiting = orders.filter(o => o.status === 'ready');
  const completed = orders.filter(o => o.status === 'completed');

  const updateStatus = (id: number, newStatus: 'pickup' | 'delivering' | 'completed') => {
    updateOrderStatus(id, newStatus);
  };

  const notifyNav = () => toast('导航功能暂未开放');

  const submitException = () => {
    if (!exceptionForm.type || showException == null) return;
    // 修改：标记异常而不是删除订单
    const order = orders.find(o => o.id === showException);
    if (order) {
      toast(`异常已上报: ${{'address_error':'地址错误','contact_failed':'联系不上客户','item_damaged':'餐品损坏','other':'其他'}[exceptionForm.type]}`);
    }
    setShowException(null);
    setExceptionForm({ type: '', desc: '' });
  };

  return (
    <main className="flex-1 mt-14 pb-28 overflow-y-auto bg-[#F5F5F5]">
      <nav className="bg-white px-4 border-b border-gray-100 flex justify-around h-12 items-center sticky top-0 z-40">
        {['待取货', '进行中', '已完成'].map(tab => (
          <button key={tab} onClick={() => setActiveSubTab(tab)}
            className={`h-full relative px-4 flex items-center justify-center text-[14px] ${activeSubTab===tab?'text-[#0085FF] font-bold':'text-gray-500'}`}>
            {tab}
            {activeSubTab===tab && <div className="absolute bottom-0 w-8 h-1 bg-[#0085FF] rounded-t-full" />}
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        {activeSubTab === '待取货' && waiting.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>暂无待取餐订单</p>
          </div>
        )}
        {activeSubTab === '待取货' && waiting.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${task.typeBg} ${task.typeText}`}>{task.type}</span>
                <span className="text-gray-500 text-[12px]">{task.no}</span>
              </div>
              <span className="text-[#FF5000] text-[13px] font-bold">等待中</span>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-[#FF5000] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">取</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-[15px]">{task.storeName}</h3>
                <p className="text-gray-500 text-[12px] mt-1">{task.storeAddr}</p>
              </div>
            </div>
            <button onClick={() => updateStatus(task.id, 'pickup')} className="w-full mt-4 bg-[#0085FF] text-white py-3 rounded-[12px] font-bold text-[15px] shadow-md active:scale-[0.98]">
              到店取餐
            </button>
          </div>
        ))}

        {activeSubTab === '进行中' && progress.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>暂无进行中的订单</p>
          </div>
        )}
        {activeSubTab === '进行中' && progress.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${task.typeBg} ${task.typeText}`}>{task.type}</span>
                <span className="text-gray-500 text-[12px]">{task.no}</span>
              </div>
              {task.eta && <span className="text-[#FF5000] text-[15px] font-bold">{task.eta} 前送达</span>}
            </div>

            <div className="space-y-4 relative ml-1">
              <div className="absolute left-[9px] top-[24px] bottom-[24px] w-[1px] bg-gray-200" />
              <div className="flex gap-3 relative z-10">
                <div className="w-5 h-5 rounded-full bg-[#FF5000] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">取</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-[15px]">{task.storeName}</h3>
                    <div className="flex gap-3 text-[#0085FF]">
                      <button onClick={notifyNav} aria-label="导航"><Map size={18}/></button>
                      <a href={`tel:${task.customerPhone}`} aria-label="拨打电话"><Phone size={18}/></a>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[12px] mt-1">{task.storeAddr}</p>
                </div>
              </div>
              <div className="flex gap-3 relative z-10">
                <div className="w-5 h-5 rounded-full bg-[#0085FF] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">送</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-[15px]">{task.customerName} ({task.customerPhone})</h3>
                    <div className="flex gap-3 text-[#0085FF]">
                      <button onClick={notifyNav} aria-label="导航"><Map size={18}/></button>
                      <a href={`tel:${task.customerPhone}`} aria-label="拨打电话"><Phone size={18}/></a>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[12px] mt-1">{task.customerAddr}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              {task.status === 'pickup' && (
                <>
                  <button onClick={() => setShowException(task.id)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-[12px] font-bold text-[15px] active:bg-gray-50 flex items-center justify-center gap-1"><AlertTriangle size={16}/>异常上报</button>
                  <button onClick={() => updateStatus(task.id, 'delivering')} className="flex-[2] bg-[#0085FF] text-white py-3 rounded-[12px] font-bold text-[15px] shadow-md active:scale-[0.98]">确认取餐</button>
                </>
              )}
              {task.status === 'delivering' && (
                <>
                  <button onClick={() => setShowException(task.id)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-[12px] font-bold text-[15px] active:bg-gray-50 flex items-center justify-center gap-1"><AlertTriangle size={16}/>异常上报</button>
                  <button onClick={() => updateStatus(task.id, 'completed')} className="flex-[2] bg-[#0085FF] text-white py-3 rounded-[12px] font-bold text-[15px] shadow-md active:scale-[0.98]">确认送达</button>
                </>
              )}
              {task.status === 'completed' && <span className="px-3 py-1.5 bg-green-50 text-[#00B578] rounded-full text-[13px] font-bold">已送达</span>}
            </div>
          </div>
        ))}

        {activeSubTab === '已完成' && completed.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>暂无已完成订单</p>
          </div>
        )}
        {activeSubTab === '已完成' && completed.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${task.typeBg} ${task.typeText}`}>{task.type}</span>
                <span className="text-gray-500 text-[12px]">{task.no}</span>
              </div>
              <span className="text-[#00B578] text-[13px] font-bold flex items-center gap-1">
                <span>已送达</span>
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FF5000] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">取</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-[15px]">{task.storeName}</h3>
                  <p className="text-gray-500 text-[12px] mt-1">{task.storeAddr}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0085FF] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">送</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-[15px]">{task.customerName}</h3>
                  <p className="text-gray-500 text-[12px] mt-1">{task.customerAddr}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
              <span className="text-[#00B578] text-[13px] font-bold">配送费</span>
              <span className="text-[#00B578] text-[16px] font-bold">¥{task.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Exception Modal */}
      {showException && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setShowException(null)}>
          <div className="bg-white rounded-2xl w-[calc(100%-48px)] max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-[17px] text-gray-900 mb-4">异常上报</h3>
            <div className="space-y-3">
              {['address_error','contact_failed','item_damaged','other'].map(t => (
                <button key={t} onClick={() => setExceptionForm(p => ({...p, type:t}))}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-[14px] ${exceptionForm.type===t?'bg-blue-50 text-[#0085FF] font-bold border border-[#0085FF]':'bg-gray-50 text-gray-700 border border-gray-100'}`}>
                  {{address_error:'地址错误',contact_failed:'联系不上客户',item_damaged:'餐品损坏',other:'其他'}[t]}
                </button>
              ))}
              <textarea className="w-full bg-gray-50 rounded-xl p-3 text-[13px] border border-gray-100 resize-none h-20 outline-none focus:border-[#0085FF]" placeholder="补充说明..."
                value={exceptionForm.desc} onChange={e => setExceptionForm(p => ({...p, desc:e.target.value}))} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowException(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-[14px]">取消</button>
              <button onClick={submitException} className="flex-1 py-3 rounded-xl bg-[#FF5000] text-white font-bold text-[14px]">提交异常</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
