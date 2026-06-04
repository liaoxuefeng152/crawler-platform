/**
 * 认证中间件
 *
 * 用于验证JWT Token并提取用户信息
 */

import { NextRequest } from 'next/server';
import { JwtUtil } from '../utils/jwt';
import type { JwtPayload } from '../types/auth';

export interface AuthenticatedRequest extends NextRequest {
  user: JwtPayload;
}

/**
 * 验证JWT Token
 * @param request NextRequest
 * @returns JwtPayload or null
 */
export async function authenticate(
  request: NextRequest
): Promise<JwtPayload | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = JwtUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      return null;
    }

    const payload = await JwtUtil.verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * 要求认证的中间件（返回401如果未认证）
 * @param request NextRequest
 * @returns JwtPayload
 * @throws Error 如果未认证
 */
export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  const payload = await authenticate(request);

  if (!payload) {
    throw new Error('Unauthorized');
  }

  return payload;
}
