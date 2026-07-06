import React from 'react';
import { Header } from '@shared';

export default function Cart({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div className="w-full min-h-screen pt-14 bg-[#F5F5F5]">
      <Header title="购物车" />
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-400">购物车是空的</p>
        <p className="text-sm text-gray-400 mt-2">去商家页面添加商品吧</p>
      </div>
    </div>
  );
}
