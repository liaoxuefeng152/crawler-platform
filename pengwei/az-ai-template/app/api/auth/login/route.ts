import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { userDataManager } from '@/lib/db';
import { ensureDefaultUser } from '@/lib/initDefaultUser';

// 定义请求体验证Schema
const LoginRequestSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名过长'),
  password: z.string().min(1, '密码不能为空').max(100, '密码过长'),
});

// 定义用户响应类型（不包含密码）
interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  email: string;
}

// 定义登录成功响应接口
interface LoginSuccessResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 定义错误响应接口
interface ErrorResponse {
  error: string;
  details?: string;
}

// 自定义错误类
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function POST(request: NextRequest) {
  try {
    // 首次登录时确保默认账号存在
    await ensureDefaultUser();

    // 解析请求体
    const requestBody = await request.json();

    // 验证请求数据
    const validationResult = LoginRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((err: z.ZodIssue) => err.message)
        .join(', ');
      throw new ValidationError('请求参数验证失败', errorMessages);
    }

    const { username, password } = validationResult.data;

    // 使用UserDataManager验证用户
    const user = await userDataManager.validateLogin(username, password);

    if (user) {
      // 构造用户响应对象（不包含密码）
      const userResponse: UserResponse = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
      };

      // 构造JWT载荷信息
      const userPayload = {
        id: userResponse.id,
        name: userResponse.displayName,
        username: userResponse.username,
      };

      // 生成JWT tokens
      const accessToken = await createAccessToken(userPayload);
      const refreshToken = await createRefreshToken(userPayload);

      // 构造成功响应
      const successResponse: LoginSuccessResponse = {
        user: userResponse,
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60, // 24小时（秒）
      };

      // 返回成功响应
      return NextResponse.json(successResponse, { status: 200 });
    } else {
      // 用户名或密码错误
      throw new AuthenticationError('用户名或密码错误');
    }
  } catch (error) {
    console.error('登录API错误:', error);

    // 处理不同类型的错误
    if (error instanceof AuthenticationError) {
      const errorResponse: ErrorResponse = {
        error: error.message,
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    if (error instanceof ValidationError) {
      const errorResponse: ErrorResponse = {
        error: error.message,
        details: error.details,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 处理JSON解析错误
    if (error instanceof SyntaxError) {
      const errorResponse: ErrorResponse = {
        error: '请求格式错误',
        details: '请求数据不是有效的JSON格式',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 处理其他未知错误
    const errorResponse: ErrorResponse = {
      error: '服务器内部错误',
      details:
        process.env.NODE_ENV === 'development' ? String(error) : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
