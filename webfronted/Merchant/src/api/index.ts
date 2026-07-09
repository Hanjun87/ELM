import { api } from './config';

export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/auth/login/', { phone, password }),

  me: () => api.get('/auth/me/'),
};

export const storeAPI = {
  me: () => api.get('/merchant/store/'),
  update: (data: any) => api.patch('/merchant/store/', data),
  toggle: (status: 'open' | 'closed') => api.post('/merchant/store/toggle/', { status }),
};

export const productAPI = {
  list: (status?: string) => api.get('/merchant/products/', { params: { status } }),
  categories: () => api.get('/categories/'),
  create: (data: any) => api.post('/merchant/products/', data),
  update: (id: number, data: any) => api.patch(`/merchant/products/${id}/`, data),
  delete: (id: number) => api.delete(`/merchant/products/${id}/`),
  toggle: (id: number, status: 'on' | 'off') => api.post(`/merchant/products/${id}/toggle/`, { status }),
};

export const orderAPI = {
  list: (status?: string) => api.get('/merchant/orders/', { params: { status } }),
  accept: (id: number) => api.post(`/merchant/orders/${id}/accept/`),
  reject: (id: number) => api.post(`/merchant/orders/${id}/reject/`),
  prepare: (id: number) => api.post(`/merchant/orders/${id}/prepare/`),
  ready: (id: number) => api.post(`/merchant/orders/${id}/ready/`),
};

export const reviewAPI = {
  list: (merchantId: number) => api.get(`/merchants/${merchantId}/reviews/`),
  reply: (id: number, reply: string) => api.post(`/reviews/${id}/reply/`, { reply }),
};

export default {
  auth: authAPI,
  store: storeAPI,
  product: productAPI,
  order: orderAPI,
  review: reviewAPI,
};
