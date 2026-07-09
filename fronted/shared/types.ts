// Shared types across all four apps
import type React from 'react';

export interface Order {
  id: number; no: string; status: string; label?: string;
  type?: string; time?: string; eta?: string; timer?: string;
  items: string; qty?: number; note?: string; amount: string;
  img?: string; distance?: string; newCustomer?: boolean;
}

export interface Product {
  id: number; cat: string; name: string; status: string;
  sales: number; rating: number; price: string; stock: number;
  img: string; desc?: string; orig?: string | null;
  lowStock?: boolean; soldOut?: boolean;
}

export interface TabConfig {
  id: string; label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}
