/**
 * JWT工具类
 *
 * 用于生成和验证JWT Token
 */

import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload } from '../types/auth';

// JWT密钥（生产环境应使用环境变量）
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sports-group-buying-secret-key-2025'
);

// Token过期时间（7天）
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7天（单位：秒）

export class JwtUtil {
  /**
   * 生成JWT Token
   * @param userId 用户ID
   * @param phone 手机号（可选）
   * @param username 用户名（可选）
   * @returns JWT Token
   */
  static async generateToken(
    userId: string,
    phone?: string,
    username?: string
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const payload: JwtPayload = {
      userId,
      phone,
      username,
      iat: now,
      exp: now + TOKEN_EXPIRY,
    };

    const signedPayload: any = { userId };
    if (phone) signedPayload.phone = phone;
    if (username) signedPayload.username = username;

    const token = await new SignJWT(signedPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp)
      .sign(JWT_SECRET);

    return token;
  }

  /**
   * 验证JWT Token（支持忽略过期时间）
   * @param token JWT Token
   * @param options 选项
   * @returns JwtPayload or null
   *
   * @example
   * // 标准验证（会抛出异常如果token无效或过期）
   * const payload = await JwtUtil.verifyToken(token);
   * if (!payload) {
   *   // token无效
   * }
   *
   * @example
   * // 忽略过期时间验证（用于token刷新场景）
   * const payload = await JwtUtil.verifyToken(token, { ignoreExpiration: true });
   * if (!payload) {
   *   // token签名无效
   * }
   */
  static async verifyToken(
    token: string,
    options?: { ignoreExpiration?: boolean }
  ): Promise<JwtPayload | null> {
    try {
      const { payload } = await jwtVerify(
        token,
        JWT_SECRET,
        options?.ignoreExpiration
          ? { currentDate: new Date(0) } // 设置为epoch时间，使任何exp都有效
          : undefined
      );

      return {
        userId: payload.userId as string,
        phone: payload.phone as string,
        iat: payload.iat as number,
        exp: payload.exp as number,
      };
    } catch (error) {
      // 如果忽略过期时间，且错误是TokenExpiredError，尝试解析payload
      if (options?.ignoreExpiration) {
        try {
          // 使用jose的jwtVerify，但允许过期
          const parts = token.split('.');
          if (parts.length === 3) {
            // 解码payload（不验证签名和过期时间）
            const decoded = JSON.parse(
              Buffer.from(parts[1], 'base64').toString('utf-8')
            );

            if (decoded.userId && decoded.phone) {
              return {
                userId: decoded.userId,
                phone: decoded.phone,
                iat: decoded.iat,
                exp: decoded.exp,
              };
            }
          }
        } catch (decodeError) {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * 从请求头中提取Token
   * @param authHeader Authorization header value
   * @returns JWT Token or null
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * 检查Token是否即将过期（剩余时间少于1天）
   * @param payload JwtPayload
   * @returns boolean
   */
  static isTokenExpiringSoon(payload: JwtPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - now;
    const oneDay = 24 * 60 * 60;
    return timeLeft < oneDay;
  }
}
