import { jwtVerify, SignJWT } from 'jose';

// 用户登录信息（JWT内存储）
export interface UserLoginInfo {
  id: string;
  name: string;
  username: string;
  [key: string]: unknown;
}

/**
 * 创建访问令牌
 * @param payload 用户信息
 */
export async function createAccessToken(payload: UserLoginInfo) {
  const { JWT_SECRET = 'your-super-secret-jwt-key-change-in-production' } =
    process.env;
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h') // 24小时过期
    .sign(secret);
}

/**
 * 创建刷新令牌
 * @param payload 用户信息
 */
export async function createRefreshToken(payload: UserLoginInfo) {
  const {
    REFRESH_SECRET = 'your-super-secret-refresh-key-change-in-production',
  } = process.env;
  const secret = new TextEncoder().encode(REFRESH_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d') // 7天过期
    .sign(secret);
}

/**
 * 验证访问令牌
 * @param token JWT token
 */
export const verifyToken = async (token: string): Promise<any> => {
  const { JWT_SECRET = 'your-super-secret-jwt-key-change-in-production' } =
    process.env;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (err) {
    console.log('Token验证失败:', err);
    return null;
  }
};

/**
 * 验证刷新令牌
 * @param token 刷新令牌
 */
export const verifyRefreshToken = async (token: string) => {
  const {
    REFRESH_SECRET = 'your-super-secret-refresh-key-change-in-production',
  } = process.env;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(REFRESH_SECRET)
    );
    return payload;
  } catch (err) {
    console.log('RefreshToken验证失败:', err);
    return null;
  }
};
