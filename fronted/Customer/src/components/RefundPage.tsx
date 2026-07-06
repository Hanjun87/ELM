import { useState } from 'react';
import { ArrowLeft, Camera, CheckCircle } from 'lucide-react';

export default function RefundPage({ onBack }: { onBack: () => void }) {
  const [reason, setReason] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="w-full min-h-screen bg-[#F5F5F5]">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100 shadow-sm gap-3">
          <button onClick={onBack} className="text-gray-700"><ArrowLeft size={22}/></button>
          <h1 className="font-bold text-[17px] text-[#0085FF]">申请退款</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4 text-[#00B578]"><CheckCircle size={40} /></div>
          <h2 className="font-bold text-[18px] text-gray-900 mb-2">退款申请已提交</h2>
          <p className="text-[13px] text-gray-500 text-center">商家将在24小时内处理您的申请，请耐心等待</p>
          <button onClick={onBack} className="mt-6 px-8 py-2.5 bg-[#0085FF] text-white rounded-full font-bold text-[14px]">返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] pb-24">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100 shadow-sm gap-3">
        <button onClick={onBack} className="text-gray-700"><ArrowLeft size={22}/></button>
        <h1 className="font-bold text-[17px] text-[#0085FF]">申请退款</h1>
      </header>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="font-bold text-[14px] text-gray-900 mb-3">退款原因</h3>
          {['商品质量问题','商家少发/漏发','商品与描述不符','配送超时','不想要了','其他'].map(r => (
            <button key={r} onClick={() => setReason(r)}
              className={`block w-full text-left px-4 py-3 rounded-xl mb-2 text-[14px] ${reason===r?'bg-blue-50 text-[#0085FF] font-bold border border-[#0085FF]':'bg-gray-50 text-gray-700 border border-gray-100'}`}>{r}</button>
          ))}
        </div>
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50">
          <h3 className="font-bold text-[14px] text-gray-900 mb-3">问题描述</h3>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-gray-50 rounded-xl p-3 text-[13px] border border-gray-100 resize-none h-28 outline-none focus:border-[#0085FF]" placeholder="请详细描述遇到的问题..." />
          <button className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-gray-500 text-[12px]"><Camera size={16}/>上传凭证图片</button>
        </div>
        <button onClick={() => setSubmitted(true)}
          disabled={!reason}
          className={`w-full py-3 rounded-full font-bold text-[15px] ${reason ? 'bg-[#0085FF] text-white shadow-md active:scale-95' : 'bg-gray-200 text-gray-400'}`}>提交申请</button>
      </div>
    </div>
  );
}
