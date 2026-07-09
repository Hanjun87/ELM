import Taro from '@tarojs/taro';

// 后端地址：微信开发者工具需在「详情 → 本地设置」勾选「不校验合法域名」才能访问 localhost。
// 真机 / 上线时改为 https 正式域名并在小程序后台配置 request 合法域名。
export const API_BASE_URL = 'http://localhost:8000/api/v1';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
}

function buildQuery(params?: Record<string, any>): string {
  if (!params) return '';
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return pairs.length ? `?${pairs.join('&')}` : '';
}

/**
 * 统一请求封装，行为对齐原 Web 端 axios 实例：
 * - 自动附加 JWT（从 Storage 读取 access_token）
 * - 直接返回后端响应体 data（对应 axios 的 response.data 拦截）
 * - 401 时清除本地 token
 */
async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, params } = options;
  const token = Taro.getStorageSync('access_token');

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await Taro.request({
      url: `${API_BASE_URL}${url}${buildQuery(params)}`,
      method,
      data,
      header,
      timeout: 10000,
    });

    if (res.statusCode === 401) {
      Taro.removeStorageSync('access_token');
      return Promise.reject({ statusCode: 401, data: res.data });
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T;
    }

    return Promise.reject({ statusCode: res.statusCode, data: res.data });
  } catch (err) {
    return Promise.reject(err);
  }
}

export const http = {
  get: <T = any>(url: string, params?: Record<string, any>) =>
    request<T>({ url, method: 'GET', params }),
  post: <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'POST', data }),
  patch: <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'PATCH', data }),
  put: <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'PUT', data }),
  delete: <T = any>(url: string) => request<T>({ url, method: 'DELETE' }),
};
