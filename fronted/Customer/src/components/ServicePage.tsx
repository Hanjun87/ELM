import { useState } from 'react';
import { Send, MessageCircle, Phone } from 'lucide-react';
import { Header } from '@shared';

const autoReplies: Record<string, string> = {
  '配送': '您的订单正在配送中，骑手预计在预计时间内送达，请耐心等待。',
  '退款': '退款申请已收到，我们会在1-3个工作日内处理完成，请留意短信通知。',
  '餐品': '关于餐品质量问题，请您拍照上传凭证，我们会尽快为您处理。',
  '优惠': '优惠券使用问题：请在结算页面选择可用优惠券，满减券需满足使用门槛。',
  '其他': '请详细描述您的问题，客服会尽快回复您。',
};

export default function ServicePage({ onBack }: { onBack: () => void }) {
  const [msgs, setMsgs] = useState([{ from:'bot', text:'您好，我是智能客服小E，请问有什么可以帮您？' }]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev, { from:'user', text:input }]);
    const reply = Object.entries(autoReplies).find(([k]) => input.includes(k))?.[1] || '已收到您的消息，人工客服将尽快接入，请稍候。';
    setTimeout(() => setMsgs(prev => [...prev, { from:'bot', text:reply }]), 500);
    setInput('');
  };

  return (
    <div className="w-full h-[100dvh] bg-[#F5F5F5] flex flex-col pt-14">
      <Header onBack={onBack} rightAction={<button className="text-[#0085FF]"><Phone size={20} /></button>}>
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-[#0085FF]" />
          <h1 className="text-[17px] font-bold text-gray-900">客服中心</h1>
        </div>
      </Header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] ${m.from === 'user' ? 'bg-[#0085FF] text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'}`}>{m.text}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-2 flex gap-2 shrink-0 pb-safe">
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1">
          {Object.keys(autoReplies).map(k => (
            <button key={k} onClick={() => { setInput(k); setTimeout(() => send(), 100); }}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 text-[11px] text-gray-600 font-medium">{k}</button>
          ))}
        </div>
      </div>
      <div className="bg-white px-4 py-3 flex gap-2 shrink-0 border-t border-gray-50">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[14px] outline-none" placeholder="输入您的问题..." />
        <button onClick={send} className="w-10 h-10 rounded-full bg-[#0085FF] text-white flex items-center justify-center active:scale-95"><Send size={18}/></button>
      </div>
    </div>
  );
}
