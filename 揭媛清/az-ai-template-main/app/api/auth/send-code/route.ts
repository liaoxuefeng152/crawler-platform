/**
 * 发送验证码API
 *
 * POST /api/auth/send-code
 *
 * 发送短信验证码（Mock实现，控制台输出）
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendCodeSchema } from '@/lib/schemas/auth';
import {
  mockSmsService,
  MOCK_VERIFICATION_CODE,
} from '@/lib/services/mock-sms';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求数据
    const validatedData = sendCodeSchema.parse(body);

    // 发送验证码（Mock）
    await mockSmsService.sendCode(validatedData.phone, MOCK_VERIFICATION_CODE);

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        code: MOCK_VERIFICATION_CODE, // POC阶段返回验证码，生产环境不应返回
      },
      { status: 200 }
    );
  } catch (error) {
    // Zod验证错误
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    // 其他错误
    console.error('Send code error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '发送验证码失败',
        },
      },
      { status: 500 }
    );
  }
}
