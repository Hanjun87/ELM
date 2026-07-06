// Simple reactive store shared across all components
// Components subscribe via useStore() hook

type Listener = () => void;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  specs?: string;
  storeId: string;
  storeName: string;
}

export interface Order {
  id: string;
  storeName: string;
  storeImage: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed';
  time: string;
  rider?: { name: string; phone: string; avatar: string };
}

export interface StoreState {
  cart: CartItem[];
  orders: Order[];
  currentStore: string | null;
}

export interface Address {
  id: number;
  tag: string;
  contact: string;
  phone: string;
  addr: string;
  distanceKm: number;
  isDefault: boolean;
}

export interface Coupon {
  id: number;
  name: string;
  condition: string;
  label: string;
  amountOff: number;
  minSpend: number;
  expire: string;
  status: 'unused' | 'used' | 'expired';
}

export const mockAddresses: Address[] = [
  { id: 1, tag: '公司', contact: '张三', phone: '138****0001', addr: '科技园区 A座 1501', distanceKm: 1.2, isDefault: true },
  { id: 2, tag: '家', contact: '张三', phone: '138****0001', addr: '浦东新区 花园小区 3-201', distanceKm: 4.5, isDefault: false },
];

export const mockCoupons: Coupon[] = [
  { id: 1, name: '新人5元券', condition: '满20可用', label: '-5', amountOff: 5, minSpend: 20, expire: '2026-07-15', status: 'unused' },
  { id: 2, name: '满30减8', condition: '满30可用', label: '-8', amountOff: 8, minSpend: 30, expire: '2026-07-20', status: 'unused' },
  { id: 3, name: '全场8折券', condition: '无门槛', label: '8折', amountOff: 0, minSpend: 0, expire: '2026-06-01', status: 'expired' },
  { id: 4, name: '免配送费券', condition: '满15可用', label: '免配送', amountOff: 0, minSpend: 15, expire: '2026-07-10', status: 'used' },
];

const state: StoreState = {
  cart: [],
  orders: [
    {
      id: '20260705123001',
      storeName: '瑞幸咖啡 (科技园店)',
      storeImage: 'https://images.unsplash.com/photo-1517701550927-30cfcb64db10?auto=format&fit=crop&q=80&w=100',
      items: [{ id: 'latte', name: '生椰拿铁', price: 18, image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64db10?auto=format&fit=crop&q=80&w=160', quantity: 1, storeId: 'luckin', storeName: '瑞幸咖啡' }, { id: 'americano', name: '美式咖啡', price: 15, image: '', quantity: 1, storeId: 'luckin', storeName: '瑞幸咖啡' }],
      total: 33,
      status: 'delivering',
      time: '12:30',
      rider: { name: '王师傅', phone: '139****1234', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150' }
    },
    {
      id: '20261025184501',
      storeName: '麦当劳 (万象城店)',
      storeImage: 'https://images.unsplash.com/photo-1626082895617-2c6bafdf6b29?auto=format&fit=crop&q=80&w=200',
      items: [{ id: 'bigmac', name: '巨无霸单人套餐', price: 42.5, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=160', quantity: 1, storeId: 'mcd', storeName: '麦当劳' }],
      total: 42.5,
      status: 'completed',
      time: '2023-10-25 18:45'
    }
  ],
  currentStore: null
};

const listeners: Set<Listener> = new Set();

export function getState(): StoreState {
  return state;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach(fn => fn());
}

export class CrossStoreCartConflict extends Error {}

export function addToCart(item: CartItem, opts?: { force?: boolean }) {
  // If switching stores, caller must confirm and retry with force: true
  if (state.currentStore && state.currentStore !== item.storeId && !opts?.force) {
    throw new CrossStoreCartConflict();
  }
  if (state.currentStore && state.currentStore !== item.storeId && opts?.force) {
    state.cart = [];
  }
  const existing = state.cart.find(c => c.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    state.cart.push({ ...item, quantity: item.quantity || 1 });
  }
  state.currentStore = item.storeId;
  notify();
}

export function updateCartItem(id: string, quantity: number) {
  if (quantity <= 0) {
    state.cart = state.cart.filter(c => c.id !== id);
  } else {
    const item = state.cart.find(c => c.id === id);
    if (item) item.quantity = quantity;
  }
  if (state.cart.length === 0) state.currentStore = null;
  notify();
}

export function clearCart() {
  state.cart = [];
  state.currentStore = null;
  notify();
}

export function getCartCount(): number {
  return state.cart.reduce((sum, c) => sum + c.quantity, 0);
}

export function getCartTotal(): number {
  return state.cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
}

export function placeOrder(): Order {
  const storeName = state.cart[0]?.storeName || '';
  const storeImage = state.cart[0]?.image || '';
  const total = getCartTotal();
  const order: Order = {
    id: Date.now().toString(),
    storeName,
    storeImage,
    items: [...state.cart],
    total,
    status: 'pending',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  };
  state.orders.unshift(order);
  clearCart();
  notify();
  return order;
}

// Simple hook — components call useStore(selector) or useStore() for full state
export function createStoreHook(setState: (s: StoreState) => void) {
  const unsub = subscribe(() => setState({ ...state }));
  return () => unsub();
}
