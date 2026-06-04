import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 临时凭证（注册成功后使用）
 * 用于在注册成功后跳转登录页时自动填充账号密码
 */
interface TempCredentials {
  username: string;
  password: string;
  fromRegister: boolean;
}

interface LoginCredentialsState {
  credentials: LoginCredentials;
  saveCredentials: (username: string, password: string) => void;
  clearCredentials: () => void;
  setRememberMe: (remember: boolean) => void;
  // 临时凭证相关方法
  saveTempCredentials: (username: string, password: string) => void;
  consumeTempCredentials: () => TempCredentials | null;
}

const DEFAULT_CREDENTIALS: LoginCredentials = {
  username: 'az',
  password: '88888888',
  rememberMe: true,
};

// sessionStorage 存储键名
const TEMP_CREDENTIALS_KEY = 'az-temp-credentials';

/**
 * 从 sessionStorage 获取临时凭证
 */
const getTempCredentials = (): TempCredentials | null => {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(TEMP_CREDENTIALS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * 保存临时凭证到 sessionStorage
 */
const setTempCredentials = (creds: TempCredentials | null) => {
  if (typeof window === 'undefined') return;
  if (creds) {
    sessionStorage.setItem(TEMP_CREDENTIALS_KEY, JSON.stringify(creds));
  } else {
    sessionStorage.removeItem(TEMP_CREDENTIALS_KEY);
  }
};

/**
 * 登录凭证存储 Store
 * 用于保存"记住我"功能的账号密码
 * 存储键名: az-login-credentials
 *
 * 临时凭证功能：
 * - 用于注册成功后自动填充登录表单
 * - 使用 sessionStorage 存储，页面关闭后自动清除
 * - 消费后自动删除（一次性使用）
 */
export const useLoginCredentialsStore = create<LoginCredentialsState>()(
  persist(
    (set) => ({
      credentials: DEFAULT_CREDENTIALS,
      saveCredentials: (username, password) =>
        set((state) => ({
          credentials: {
            ...state.credentials,
            username,
            password,
          },
        })),
      clearCredentials: () =>
        set({
          credentials: {
            username: '',
            password: '',
            rememberMe: false,
          },
        }),
      setRememberMe: (remember) =>
        set((state) => ({
          credentials: {
            ...state.credentials,
            rememberMe: remember,
          },
        })),
      // 保存临时凭证（注册成功时调用）
      saveTempCredentials: (username, password) => {
        setTempCredentials({
          username,
          password,
          fromRegister: true,
        });
      },
      // 消费临时凭证（登录页加载时调用）
      // 返回凭证后自动清除，确保一次性使用
      consumeTempCredentials: () => {
        const creds = getTempCredentials();
        if (creds) {
          // 消费后立即清除
          setTempCredentials(null);
        }
        return creds;
      },
    }),
    {
      name: 'az-login-credentials',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
