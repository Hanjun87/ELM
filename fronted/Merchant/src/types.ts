export interface OrderItemSnapshot {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_no: string;
  merchant_name: string;
  merchant_logo: string | null;
  address_snapshot: Record<string, any>;
  items_snapshot: OrderItemSnapshot[];
  total_amount: string;
  delivery_fee: string;
  paid_amount: string;
  status: 'pending' | 'paid' | 'accepted' | 'preparing' | 'ready' | 'picked' | 'delivered' | 'finished' | 'cancelled';
  note: string | null;
  created_at: string;
  paid_at: string | null;
  accepted_at: string | null;
  prepared_at: string | null;
  picked_at: string | null;
  delivered_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  price: string;
  original_price: string | null;
  stock: number;
  status: 'on' | 'off';
  sales_count: number;
  rating: string;
  specs: any;
  category: Category | null;
}

export interface Merchant {
  id: number;
  store_name: string;
  logo: string | null;
  phone: string;
  address: string;
  min_order: string;
  delivery_fee: string;
  status: 'open' | 'closed';
  rating: string;
  monthly_sales: number;
}

export interface Review {
  id: number;
  order: number;
  customer_phone: string;
  merchant: number;
  rating: number;
  content: string;
  images: string[] | null;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export function itemsSummary(items: OrderItemSnapshot[]): string {
  return items.map(i => `${i.name} x${i.quantity}`).join('、') || '无商品明细';
}

export function itemsQty(items: OrderItemSnapshot[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
