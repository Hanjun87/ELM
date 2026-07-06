// Simple reactive store shared across Rider components (mirrors Merchant's store.ts pattern)

export interface RiderOrder {
  id: number;
  no: string;
  type: string;
  typeBg: string;
  typeText: string;
  distanceKm: number;
  price: string;
  storeName: string;
  storeAddr: string;
  customerName: string;
  customerPhone: string;
  customerAddr: string;
  dropoffNote: string;
  eta: string;
  status: 'available' | 'pickup' | 'delivering' | 'completed';
}

export const orders: RiderOrder[] = [
  {
    id: 1, no: '#001', type: '蜂鸟专送', typeBg: 'bg-blue-100', typeText: 'text-[#0085FF]',
    distanceKm: 1.2, price: '8.50',
    storeName: '麦当劳 (国贸商城店)', storeAddr: '朝阳区建国门外大街1号',
    customerName: '陈先生', customerPhone: '138****2001', customerAddr: '万达广场 B座 1502',
    dropoffNote: '送达距离 2.4km · 需30分钟内送达', eta: '12:45', status: 'available',
  },
  {
    id: 2, no: '#002', type: '超市代购', typeBg: 'bg-green-100', typeText: 'text-[#00B578]',
    distanceKm: 0.8, price: '12.00',
    storeName: '便利蜂 (建外SOHO店)', storeAddr: '朝阳区建外SOHO东区8号楼',
    customerName: '刘女士', customerPhone: '159****2002', customerAddr: '新城国际 3号楼 602',
    dropoffNote: '送达距离 1.1km · 大件物品 · 需尽快', eta: '13:00', status: 'available',
  },
  {
    id: 3, no: '#003', type: '星选配送', typeBg: 'bg-blue-100', typeText: 'text-[#0085FF]',
    distanceKm: 2.5, price: '15.50',
    storeName: '鼎泰丰 (侨福芳草地店)', storeAddr: '朝阳区东大桥路9号',
    customerName: '周先生', customerPhone: '136****2003', customerAddr: '朝外大街 佳兆业广场 2201',
    dropoffNote: '送达距离 4.2km · 需保温配送', eta: '13:20', status: 'available',
  },
  {
    id: 8, no: '#008', type: '蜂鸟专送', typeBg: 'bg-blue-50', typeText: 'text-[#0085FF]',
    distanceKm: 1.5, price: '9.00',
    storeName: '麦当劳 (时代广场店)', storeAddr: '浦东新区陆家嘴环路1000号',
    customerName: '张先生', customerPhone: '138****5678', customerAddr: '浦东新区潍坊路花园小区3-201',
    dropoffNote: '', eta: '12:45', status: 'pickup',
  },
  {
    id: 15, no: '#015', type: '蜂鸟专送', typeBg: 'bg-blue-50', typeText: 'text-[#0085FF]',
    distanceKm: 2.0, price: '10.50',
    storeName: '喜茶 HEYTEA (世纪汇店)', storeAddr: '浦东新区潍坊路世纪汇广场',
    customerName: '王女士', customerPhone: '159****2341', customerAddr: '浦东新区源深路源深大厦15楼',
    dropoffNote: '', eta: '13:10', status: 'delivering',
  },
];

let listeners: (() => void)[] = [];
export function subscribe(fn: () => void) { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; }
export function notify() { listeners.forEach(fn => fn()); }

export function grabOrder(id: number) {
  const o = orders.find(x => x.id === id);
  if (o && o.status === 'available') { o.status = 'pickup'; notify(); }
}

export function updateOrderStatus(id: number, status: RiderOrder['status']) {
  const o = orders.find(x => x.id === id);
  if (o) { o.status = status; notify(); }
}

export function removeOrder(id: number) {
  const idx = orders.findIndex(x => x.id === id);
  if (idx !== -1) { orders.splice(idx, 1); notify(); }
}
