import { http } from './config';

export const authAPI = {
  login: (phone: string, password: string) =>
    http.post('/auth/login/', { phone, password }),

  register: (phone: string, password: string, role: string = 'customer') =>
    http.post('/auth/register/', { phone, password, role }),

  me: () => http.get('/auth/me/'),
};

export const merchantAPI = {
  list: () => http.get('/merchants/'),
  detail: (id: number) => http.get(`/merchants/${id}/`),
};

export const productAPI = {
  list: (merchantId: number, category?: string) =>
    http.get(`/merchants/${merchantId}/products/`, { category }),
  detail: (id: number) => http.get(`/products/${id}/`),
  categories: () => http.get('/categories/'),
};

export const orderAPI = {
  list: (status?: string) => http.get('/orders/', { status }),
  detail: (id: number) => http.get(`/orders/${id}/`),
  create: (data: any) => http.post('/orders/create/', data),
  pay: (id: number) => http.post(`/orders/${id}/pay/`),
  cancel: (id: number) => http.post(`/orders/${id}/cancel/`),
};

export const addressAPI = {
  list: () => http.get('/addresses/'),
  create: (data: any) => http.post('/addresses/', data),
  update: (id: number, data: any) => http.patch(`/addresses/${id}/`, data),
  delete: (id: number) => http.delete(`/addresses/${id}/`),
  setDefault: (id: number) => http.post(`/addresses/${id}/set_default/`),
};

export default {
  auth: authAPI,
  merchant: merchantAPI,
  product: productAPI,
  order: orderAPI,
  address: addressAPI,
};
