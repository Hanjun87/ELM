export interface User {
  id: number;
  name: string;
  phone: string;
  role: 'customer' | 'merchant' | 'rider' | 'admin';
  status: 'active' | 'banned';
  registeredAt: string;
  orderCount?: number;
}

export interface MerchantApplication {
  id: number;
  name: string;
  applicant: string;
  address: string;
  licenseImg: string;
  foodPermitImg: string;
  legalPerson: string;
  capital: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
}

export interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: string;
  color: string;
}

export const dashboardStats: StatCard[] = [
  { label: 'GMV (元)', value: '1,285,600', change: '+12.5%', up: true, icon: 'payments', color: 'bg-blue-50 text-[#0085FF]' },
  { label: '总订单量', value: '45,670', change: '+8.9%', up: true, icon: 'receipt', color: 'bg-orange-50 text-[#FF5000]' },
  { label: '活跃用户 (DAU)', value: '89,012', change: '+5.2%', up: true, icon: 'users', color: 'bg-green-50 text-[#00B578]' },
  { label: '新增商家', value: '128', change: '-2.1%', up: false, icon: 'store', color: 'bg-purple-50 text-purple-500' },
  { label: '退款率', value: '2.3%', change: '-0.5%', up: true, icon: 'swap', color: 'bg-red-50 text-red-500' },
  { label: '配送超时率', value: '4.1%', change: '+0.3%', up: false, icon: 'clock', color: 'bg-yellow-50 text-yellow-600' },
];

export const users: User[] = [
  { id: 1, name: '张小明', phone: '138****1234', role: 'customer', status: 'active', registeredAt: '2026-01-15', orderCount: 42 },
  { id: 2, name: '美味坊餐饮', phone: '139****5678', role: 'merchant', status: 'active', registeredAt: '2026-02-20', orderCount: 1520 },
  { id: 3, name: '王师傅', phone: '137****9012', role: 'rider', status: 'active', registeredAt: '2026-03-10', orderCount: 820 },
  { id: 4, name: '李四', phone: '136****3456', role: 'customer', status: 'banned', registeredAt: '2026-01-20', orderCount: 5 },
  { id: 5, name: '茶百道餐饮', phone: '135****7890', role: 'merchant', status: 'active', registeredAt: '2026-04-05', orderCount: 890 },
  { id: 6, name: '赵六', phone: '134****2345', role: 'customer', status: 'active', registeredAt: '2026-05-12', orderCount: 18 },
  { id: 7, name: '孙师傅', phone: '133****6789', role: 'rider', status: 'banned', registeredAt: '2026-02-28', orderCount: 150 },
  { id: 8, name: '老张火锅店', phone: '132****0123', role: 'merchant', status: 'active', registeredAt: '2026-06-01', orderCount: 320 },
];

export const applications: MerchantApplication[] = [
  {
    id: 1, name: '老王家东北饺子馆', applicant: '王建国', address: '浦东新区XX路101号',
    licenseImg: '', foodPermitImg: '', legalPerson: '王建国', capital: '50万人民币',
    status: 'pending', appliedAt: '2026-07-05 14:30'
  },
  {
    id: 2, name: '星巴克咖啡 (软件园店)', applicant: '李明', address: '浦东新区YY路202号',
    licenseImg: '', foodPermitImg: '', legalPerson: '李明', capital: '200万人民币',
    status: 'pending', appliedAt: '2026-07-05 15:45'
  },
  {
    id: 3, name: '幸福烘焙坊', applicant: '赵芳', address: '浦东新区ZZ路303号',
    licenseImg: '', foodPermitImg: '', legalPerson: '赵芳', capital: '30万人民币',
    status: 'pending', appliedAt: '2026-07-04 10:00'
  },
  {
    id: 4, name: '兰州拉面馆', applicant: '马强', address: '浦东新区AA路88号',
    licenseImg: '', foodPermitImg: '', legalPerson: '马强', capital: '20万人民币',
    status: 'approved', appliedAt: '2026-07-03 09:00', reviewedAt: '2026-07-04'
  },
];

export interface Settlement {
  id: number;
  merchantName: string;
  period: string;
  orders: number;
  revenue: string;
  commission: string;
  net: string;
  status: 'pending' | 'paid';
}

export const settlements: Settlement[] = [
  { id: 1, merchantName: '美味坊餐饮', period: '2026-06-24 ~ 2026-06-30', orders: 412, revenue: '16,890.00', commission: '1,689.00', net: '15,201.00', status: 'pending' },
  { id: 2, merchantName: '茶百道餐饮', period: '2026-06-24 ~ 2026-06-30', orders: 298, revenue: '8,940.00', commission: '894.00', net: '8,046.00', status: 'pending' },
  { id: 3, merchantName: '老张火锅店', period: '2026-06-17 ~ 2026-06-23', orders: 320, revenue: '12,800.00', commission: '1,280.00', net: '11,520.00', status: 'paid' },
  { id: 4, merchantName: '美味坊餐饮', period: '2026-06-17 ~ 2026-06-23', orders: 398, revenue: '15,420.00', commission: '1,542.00', net: '13,878.00', status: 'paid' },
];

export const platformConfig = {
  commissionRate: 10,
  minWithdraw: 100,
  deliveryTimeout: 30,
  autoConfirmDays: 7,
};
