import { api } from './config';

export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/auth/login/', { phone, password }),
  me: () => api.get('/auth/me/'),
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard/'),
  users: (params?: { role?: string; status?: string }) => api.get('/admin/users/', { params }),
  banUser: (id: number) => api.post(`/admin/users/${id}/ban/`),
  unbanUser: (id: number) => api.post(`/admin/users/${id}/unban/`),
  merchants: (params?: { status?: string }) => api.get('/admin/merchants/', { params }),
  setMerchantStatus: (id: number, status: 'open' | 'closed') =>
    api.post(`/admin/merchants/${id}/status/`, { status }),
};

export default {
  auth: authAPI,
  admin: adminAPI,
};
