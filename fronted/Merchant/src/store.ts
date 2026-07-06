export interface Order {
  id: number; no: string; status: string; label: string; type: string;
  time: string; eta: string; timer: string; items: string; qty: number;
  note: string; amount: string; img: string; distance?: string; newCustomer?: boolean;
}
export interface Product {
  id: number; cat: string; name: string; status: string; sales: number;
  rating: number; price: string; stock: number; img: string; desc?: string;
  orig?: string | null; lowStock?: boolean; soldOut?: boolean;
}
export interface Review {
  id: number; customer: string; rating: number; orderInfo: string; date: string;
  content: string; replied: boolean; reply: string;
}
export interface Campaign {
  id: number; name: string; type: string; typeLabel: string; rules: string;
  start: string; end: string; status: string; scope: string;
}
export interface Category { id: string; name: string; icon: string; }

let shopOpen = true;

export const orders: Order[] = [
  { id:4021, no:"#4021", status:"pending", label:"待接单", type:"外卖", time:"10:45", eta:"11:30", timer:"04:59", items:"经典和牛汉堡套餐", qty:3, note:"不要洋葱，多放酱", amount:"58.00", img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200" },
  { id:4020, no:"#4020", status:"progress", label:"待出餐", type:"自取", time:"10:35", eta:"", timer:"", items:"经典凯撒沙拉等", qty:2, note:"", amount:"36.50", img:"" },
  { id:102, no:"#102", status:"pending", label:"等待接单", type:"外卖", time:"11:42", eta:"12:15", timer:"", items:"招牌鲜肉小笼包 + 葱油拌面 等 3 件", qty:3, note:"不要葱蒜", amount:"42.50", img:"", distance:"1.2km" },
  { id:103, no:"#103", status:"pending", label:"等待接单", type:"外卖", time:"11:50", eta:"12:30", timer:"", items:"虾仁蒸饺 (1蒸笼)", qty:1, note:"", amount:"18.00", img:"", distance:"3.5km", newCustomer:true },
  { id:98, no:"#098", status:"progress", label:"备餐中", type:"外卖", time:"11:20", eta:"", timer:"", items:"皮蛋瘦肉粥等 2 件", qty:2, note:"", amount:"24.00", img:"" },
];

export const products: Product[] = [
  { id:301, cat:"hot", name:"招牌红烧牛肉面", status:"on", sales:1200, rating:98, price:"28.00", stock:999, img:"https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=200" },
  { id:302, cat:"hot", name:"香酥大鸡排", status:"on", sales:800, rating:95, price:"15.00", stock:3, img:"", lowStock:true },
  { id:303, cat:"hot", name:"冰镇手打柠檬茶", status:"off", sales:500, rating:99, price:"12.00", stock:0, img:"", soldOut:true },
];

export const categories: Category[] = [
  { id:"hot", name:"热销排行", icon:"flame" },
  { id:"main", name:"主食", icon:"soup" },
  { id:"snack", name:"小食", icon:"utensils" },
  { id:"drink", name:"饮品", icon:"coffee" },
  { id:"dessert", name:"甜点", icon:"icecream" },
];

export const reviews: Review[] = [
  { id:1, customer:"王小明", rating:5, orderInfo:"招牌红烧牛肉面 x1", date:"2026-07-05 12:30", content:"牛肉很大块，汤底浓郁，配送也很快。会回购。", replied:false, reply:"" },
  { id:2, customer:"李华", rating:4, orderInfo:"香酥大鸡排 x2 + 冰镇柠檬茶 x1", date:"2026-07-05 11:15", content:"鸡排很脆，分量足。柠檬茶有点淡。", replied:true, reply:"感谢反馈，我们会调整柠檬茶配方。" },
  { id:3, customer:"张三", rating:3, orderInfo:"虾仁蒸饺 x1", date:"2026-07-04 19:45", content:"味道还行，但配送超时了20分钟。", replied:false, reply:"" },
  { id:5, customer:"匿名用户", rating:1, orderInfo:"冰镇手打柠檬茶 x1", date:"2026-07-03 14:20", content:"杯子封口没封好，送来洒了一半。", replied:false, reply:"" },
];

export const campaigns: Campaign[] = [
  { id:1, name:"满30减5", type:"full_reduction", typeLabel:"满减", rules:"订单满30元减5元，不限品类", start:"2026-07-01", end:"2026-07-31", status:"active", scope:"全部商品" },
  { id:2, name:"新客立减10元", type:"new_customer", typeLabel:"新客立减", rules:"首次下单立减10元，需订单满15元", start:"2026-07-01", end:"2026-12-31", status:"active", scope:"全部商品" },
  { id:3, name:"招牌牛肉面8折", type:"discount", typeLabel:"折扣", rules:"招牌红烧牛肉面限时8折，每人限购2份", start:"2026-07-05", end:"2026-07-15", status:"active", scope:"招牌红烧牛肉面" },
  { id:4, name:"满50减12", type:"full_reduction", typeLabel:"满减", rules:"订单满50元减12元，仅限正价商品", start:"2026-06-01", end:"2026-06-30", status:"ended", scope:"正价商品" },
];

export function getShopOpen() { return shopOpen; }
export function setShopOpen(v: boolean) { shopOpen = v; }

let listeners: (() => void)[] = [];
export function subscribe(fn: () => void) { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; }
export function notify() { listeners.forEach(fn => fn()); }
