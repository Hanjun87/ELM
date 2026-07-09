export interface Merchant {
  id: number;
  store_name: string;
  logo: string;
  rating: string;
  monthly_sales: number;
  min_order: string;
  delivery_fee: string;
  status: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  img?: string;
  image?: string;
  description?: string;
  category?: string;
  stock?: number;
  sales?: number;
}

export interface Order {
  id: number;
  order_no: string;
  status: string;
  total_amount: string;
  merchant_name?: string;
  created_at?: string;
  items?: any[];
}
