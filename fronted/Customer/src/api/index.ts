import { api } from './config';

// 认证接口
export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/auth/login/', { phone, password }),
  
  register: (phone: string, password: string, role: string = 'customer') =>
    api.post('/auth/register/', { phone, password, role }),
  
  me: () => api.get('/auth/me/'),
};

// 商家接口
export const merchantAPI = {
  list: () => api.get('/merchants/'),
  detail: (id: number) => api.get(`/merchants/${id}/`),
};

// 商品接口
export const productAPI = {
  list: (merchantId: number, category?: string) => 
    api.get(`/merchants/${merchantId}/products/`, { params: { category } }),
  detail: (id: number) => api.get(`/products/${id}/`),
  categories: () => api.get('/categories/'),
};

// 订单接口
export const orderAPI = {
  list: (status?: string) => api.get('/orders/', { params: { status } }),
  detail: (id: number) => api.get(`/orders/${id}/`),
  create: (data: any) => api.post('/orders/create/', data),
};

export default {
  auth: authAPI,
  merchant: merchantAPI,
  product: productAPI,
  order: orderAPI,
};
