import { api } from './config';

export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/auth/login/', { phone, password }),
  
  register: (phone: string, password: string, role: string = 'customer') =>
    api.post('/auth/register/', { phone, password, role }),
  
  me: () => api.get('/auth/me/'),
};

export const merchantAPI = {
  list: () => api.get('/merchants/'),
  detail: (id: number) => api.get(`/merchants/${id}/`),
};

export const productAPI = {
  list: (merchantId: number, category?: string) => 
    api.get(`/merchants/${merchantId}/products/`, { params: { category } }),
  detail: (id: number) => api.get(`/products/${id}/`),
  categories: () => api.get('/categories/'),
};

export const orderAPI = {
  list: (status?: string) => api.get('/orders/', { params: { status } }),
  detail: (id: number) => api.get(`/orders/${id}/`),
  create: (data: any) => api.post('/orders/create/', data),
  pay: (id: number) => api.post(`/orders/${id}/pay/`),
  cancel: (id: number) => api.post(`/orders/${id}/cancel/`),
};

export const addressAPI = {
  list: () => api.get('/addresses/'),
  create: (data: any) => api.post('/addresses/', data),
  update: (id: number, data: any) => api.patch(`/addresses/${id}/`, data),
  delete: (id: number) => api.delete(`/addresses/${id}/`),
  setDefault: (id: number) => api.post(`/addresses/${id}/set_default/`),
};

export default {
  auth: authAPI,
  merchant: merchantAPI,
  product: productAPI,
  order: orderAPI,
  address: addressAPI,
};
