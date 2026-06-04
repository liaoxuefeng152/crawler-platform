import {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
} from 'axios';
import axios from 'axios';
import { useUserStore } from '@/stores/core/useUserStore';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    withAuth?: boolean;
    _retry?: boolean;
  }
}

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/send-code',
  '/api/auth/verify-code',
  '/api/auth/register',
];

const setupInterceptors = (instance: AxiosInstance) => {
  // 请求拦截
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // 跳过公开API路径的token注入
    const isPublicApi = PUBLIC_API_PATHS.some((path) =>
      config.url?.includes(path)
    );

    if (!isPublicApi) {
      // 从localStorage获取token（适用于用户名登录和手机号登录）
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  });

  // 响应拦截
  instance.interceptors.response.use(
    (response) => {
      // 统一处理axios响应格式
      if (response.data && typeof response.data === 'object') {
        return {
          ...response,
          data: response.data?.data || response.data, // 提取嵌套的data或使用原始data
          meta: response.data?.meta, // 提取嵌套的meta（如果存在）
          error: response.data?.error, // 提取嵌套的error（如果存在）
        };
      }
      return response;
    },
    // axios错误处理
    async (error) => {
      const originalRequest = error.config;
      let msg = '';
      console.error('API请求错误:', error);

      if (error.response) {
        msg =
          error.response.data?.error ||
          error.response.data?.errMsg ||
          error.response.data?.message;

        switch (error.response.status) {
          case 400:
            msg = msg || '请求参数错误 (400)';
            break;
          case 401:
            msg = msg || '请求失败 (401)';
            break;
          case 403:
            msg = msg || '请求失败 (403)';
            break;
          case 404:
            msg = msg || '资源未找到 (404)';
            break;
          case 500:
            msg = msg || '服务器内部错误 (500)';
            break;
          case 502:
            msg = msg || '网关错误 (502)';
            break;
          case 503:
            msg = msg || '服务不可用 (503)';
            break;
          default:
            msg = msg || `请求失败 (${error.response.status})`;
        }
      } else {
        msg = '网络异常或服务器无响应';
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('global-error', { detail: msg }));
      }

      error.errMsg = msg;
      return Promise.reject(error);
    }
  );
};

// 创建API实例的工厂函数
const createApi = (baseURL?: string) => {
  const instance = axios.create({
    baseURL: baseURL || '/api/',
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  setupInterceptors(instance);
  return instance;
};

// 默认API实例
const apiInstance = createApi();

export { apiInstance, createApi };

// 导出类型
export type { AxiosResponse, InternalAxiosRequestConfig };
