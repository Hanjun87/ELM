import { api } from './config';

export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/auth/login/', { phone, password }),
  me: () => api.get('/auth/me/'),
};

export const orderAPI = {
  available: () => api.get('/rider/orders/available/'),
  mine: () => api.get('/rider/orders/mine/'),
  grab: (id: number) => api.post(`/rider/orders/${id}/grab/`),
  pickup: (id: number) => api.post(`/rider/orders/${id}/pickup/`),
  deliver: (id: number) => api.post(`/rider/orders/${id}/deliver/`),
};

export const riderAPI = {
  me: () => api.get('/riders/me/'),
  setStatus: (work_status: 'offline' | 'idle' | 'busy' | 'delivering') =>
    api.post('/riders/me/status/', { work_status }),
};

export default {
  auth: authAPI,
  order: orderAPI,
  rider: riderAPI,
};
