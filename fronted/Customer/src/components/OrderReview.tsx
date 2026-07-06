import { ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';

export default function OrderReview({ onBack }: { onBack: () => void }) {
  const [rating, setRating] = useState(0);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <header className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-sm">
        <button onClick={onBack} className="absolute left-4 text-gray-700 active:scale-95"><ArrowLeft size={22}/></button>
        <h1 className="font-bold text-[17px] text-gray-900">评价订单</h1>
      </header>

      <div className="p-4 space-y-4">
         <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-100 rounded-full mb-3 border border-gray-200 overflow-hidden shadow-sm">
               <img src="https://images.unsplash.com/photo-1626082895617-2c6bafdf6b29?auto=format&fit=crop&q=80&w=200" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <h2 className="font-bold text-[17px] text-gray-900 mb-6">麦当劳 (万象城店)</h2>
             
             <div className="flex gap-3 mb-7">
                 {[1,2,3,4,5].map(i => (
                     <Star 
                       key={i} 
                       size={36} 
                       onClick={() => setRating(i)}
                       className={`${rating >= i ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'} active:scale-90 transition-all cursor-pointer drop-shadow-sm`} 
                     />
                 ))}
             </div>

             <textarea 
                className="w-full bg-gray-50 rounded-xl p-4 text-[14px] border border-gray-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none h-28 font-medium text-gray-800 placeholder:text-gray-400"
                placeholder="口味如何，包装怎样？说说您的用餐体验吧..."
             ></textarea>

             <button className="w-full bg-[#0085FF] hover:bg-blue-600 text-white font-bold py-3.5 rounded-full mt-6 active:scale-95 transition-all shadow-md">提交评价</button>
         </div>
      </div>
    </div>
  )
}
