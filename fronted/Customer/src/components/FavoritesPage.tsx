import React from 'react';
import { Heart } from 'lucide-react';
import { Header } from '@shared';

export default function FavoritesPage({ onBack, onStoreClick }: { onBack: () => void; onStoreClick: (id: string) => void }) {
  return (
    <div className="w-full min-h-screen pt-14 bg-[#F5F5F5]">
      <Header title="我的收藏" onBack={onBack} />

      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Heart size={64} className="text-gray-300 mb-4" />
        <p className="text-gray-400">暂无收藏</p>
        <p className="text-sm text-gray-400 mt-2">收藏的商家会出现在这里</p>
      </div>
    </div>
  );
}
