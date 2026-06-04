/**
 * Token刷新API
 *
 * POST /api/auth/refresh
 *
 * 使用过期的token刷新获取新的token
 */

import { NextRequest, NextResponse } from 'next/server';
import { JwtUtil } from '@/lib/utils/jwt';
import type { JwtPayload } from '@/lib/types/auth';

/**
 * 验证请求体
 */
function validateRequestBody(body: any): body is { token: string } {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.token === 'string' &&
    body.token.trim().length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求体
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Token is required',
          },
        },
        { status: 400 }
      );
    }

    const { token } = body;

    // 验证token（即使过期也可以验证签名）
    const payload = await JwtUtil.verifyToken(token, {
      ignoreExpiration: true,
    });

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid token',
          },
        },
        { status: 401 }
      );
    }

    // 生成新token（7天有效期）
    const newToken = await JwtUtil.generateToken(
      payload.userId,
      payload.phone,
      payload.username
    );

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        token: newToken,
      },
      { status: 200 }
    );
  } catch (error) {
    // JSON解析错误
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON format',
          },
        },
        { status: 400 }
      );
    }

    // 其他错误
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
