import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 用户登录信息（JWT内存储）
export interface UserLoginInfo {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  displayName?: string;
  // 扩展字段
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: string[];
  [key: string]: unknown;
}

// 用户响应类型（API返回）
export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
}

interface UserStore {
  user: UserLoginInfo | null; // 用户信息
  isAuthenticated: boolean; // 是否已认证
  setUser: (user: UserResponse | null) => void;
  clearUser: () => void; // 清除用户信息
  updateUser: (updates: Partial<UserLoginInfo>) => void; // 更新用户信息
}

// 用户信息Store
// persist为异步storage存储
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (userResponse: UserResponse | null) => {
        if (userResponse) {
          // 将UserResponse转换为UserLoginInfo格式
          const userInfo: UserLoginInfo = {
            id: userResponse.id,
            name: userResponse.displayName,
            username: userResponse.username,
            email: userResponse.email,
            role: userResponse.role,
            displayName: userResponse.displayName,
          };

          set({ user: userInfo, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      },
      clearUser: () => {
        set({ user: null, isAuthenticated: false });
        // 清除localStorage中的相关数据
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('username');
        }
      },
      updateUser: (updates: Partial<UserLoginInfo>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },
    }),
    {
      name: 'az-user-info', // 存储键名
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
