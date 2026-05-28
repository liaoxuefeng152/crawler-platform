/**
 * 认证相关的TypeScript类型定义
 *
 * 用于登录、用户信息等
 */

// 用户类型定义
export interface User {
  id: string;
  phone?: string;
  username?: string;
  nickname: string;
  displayName?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive' | 'banned';
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// JWT Payload类型定义
export interface JwtPayload {
  userId: string;
  phone?: string;
  username?: string;
  iat: number;
  exp: number;
}

// 登录响应类型
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
