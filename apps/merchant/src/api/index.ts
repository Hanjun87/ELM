import { http } from './config';

// 商家端 API —— 移植自 fronted/Merchant/src/api/index.ts
// 后端响应统一为 { code, message, data }，http 封装已返回 response.data（响应体本身）

export const authAPI = {
  login: (phone: string, password: string) =>
    http.post('/auth/login/', { phone, password }),

  me: () => http.get('/auth/me/'),
};

export const storeAPI = {
  // 当前登录商家的店铺信息
  me: () => http.get('/merchant/store/'),
  update: (data: any) => http.patch('/merchant/store/', data),
  toggle: (status: 'open' | 'closed') =>
    http.post('/merchant/store/toggle/', { status }),
};

export const productAPI = {
  list: (status?: string) => http.get('/merchant/products/', { status }),
  categories: () => http.get('/categories/'),
  create: (data: any) => http.post('/merchant/products/', data),
  update: (id: number, data: any) =>
    http.patch(`/merchant/products/${id}/`, data),
  delete: (id: number) => http.delete(`/merchant/products/${id}/`),
  toggle: (id: number, status: 'on' | 'off') =>
    http.post(`/merchant/products/${id}/toggle/`, { status }),
};

export const orderAPI = {
  list: (status?: string) => http.get('/merchant/orders/', { status }),
  accept: (id: number) => http.post(`/merchant/orders/${id}/accept/`),
  reject: (id: number) => http.post(`/merchant/orders/${id}/reject/`),
  prepare: (id: number) => http.post(`/merchant/orders/${id}/prepare/`),
  ready: (id: number) => http.post(`/merchant/orders/${id}/ready/`),
};

export const reviewAPI = {
  list: (merchantId: number) => http.get(`/merchants/${merchantId}/reviews/`),
  reply: (id: number, reply: string) =>
    http.post(`/reviews/${id}/reply/`, { reply }),
};

export default {
  auth: authAPI,
  store: storeAPI,
  product: productAPI,
  order: orderAPI,
  review: reviewAPI,
};
