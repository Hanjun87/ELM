import { http } from './config';

// 骑手端 API —— 移植自 fronted/Rider/src/api/index.ts

export const authAPI = {
  login: (phone: string, password: string) =>
    http.post('/auth/login/', { phone, password }),
  me: () => http.get('/auth/me/'),
};

export const orderAPI = {
  available: () => http.get('/rider/orders/available/'),
  mine: () => http.get('/rider/orders/mine/'),
  grab: (id: number) => http.post(`/rider/orders/${id}/grab/`),
  pickup: (id: number) => http.post(`/rider/orders/${id}/pickup/`),
  deliver: (id: number) => http.post(`/rider/orders/${id}/deliver/`),
};

export const riderAPI = {
  me: () => http.get('/riders/me/'),
  setStatus: (work_status: 'offline' | 'idle' | 'busy' | 'delivering') =>
    http.post('/riders/me/status/', { work_status }),
};

export default {
  auth: authAPI,
  order: orderAPI,
  rider: riderAPI,
};
