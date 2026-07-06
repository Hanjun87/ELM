import { Compass, ShoppingCart, FileText, User } from 'lucide-react';
import React from 'react';
import { TabType } from '../types';
import { getCartCount, subscribe, StoreState } from '../store';
import { useState, useEffect } from 'react';

interface BottomNavProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
  cartCount: number;
}

export default function BottomNav({ activeTab, onChange, cartCount }: BottomNavProps) {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; badge?: number }[] = [
    { id: 'home', label: '发现', icon: Compass },
    { id: 'cart', label: '购物车', icon: ShoppingCart, badge: cartCount },
    { id: 'orders', label: '订单', icon: FileText },
    { id: 'profile', label: '我的', icon: User },
  ];

  // Update badge when cartCount changes
  tabs[1].badge = cartCount > 0 ? cartCount : undefined;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-around items-center px-2 py-2 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.04)] rounded-t-[20px] border-t border-gray-100 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id as TabType)}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-50 text-[#0085FF] scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className="relative">
              <Icon size={24} className={isActive ? 'text-[#0085FF]' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#FF5000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[16px] text-center border-2 border-white shadow-sm">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-1 ${isActive ? 'text-[#0085FF] font-bold' : 'font-medium'}`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
