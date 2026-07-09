// 骑手端类型定义

export interface OrderItemSnapshot {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface RiderOrder {
  id: number;
  order_no: string;
  merchant_name: string;
  merchant_logo?: string | null;
  address_snapshot: { address?: string; name?: string; phone?: string };
  items_snapshot: OrderItemSnapshot[];
  paid_amount: string;
  status: string;
  note?: string | null;
}

export interface RiderProfile {
  id: number;
  real_name: string;
  station: string | null;
  work_status: string;
  balance: string;
  total_orders: number;
  rating: string;
}
