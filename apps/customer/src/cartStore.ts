import { Merchant } from './types';

export interface CartLine {
  product: {
    id: number;
    name: string;
    price: string;
    image?: string;
  };
  quantity: number;
}

// 模块级购物车（跨页面共享：商家详情页 → 结算页）
export const cartStore: {
  merchant: Merchant | null;
  lines: CartLine[];
} = {
  merchant: null,
  lines: [],
};

export function clearCart() {
  cartStore.merchant = null;
  cartStore.lines = [];
}
