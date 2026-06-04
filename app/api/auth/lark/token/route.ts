/**
 * 飞书Token持久化API
 * GET - 获取用户的飞书Token
 * POST - 更新用户的飞书Token（授权回调时使用）
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';

type JsonRecord = Prisma.InputJsonObject;
type RawFindResult = {
  cursor?: {
    firstBatch?: unknown[];
  };
};
type RawUpdateResult = {
  n?: number;
};
type LarkTokenDocument = {
  larkAccessToken?: string | null;
  larkRefreshToken?: string | null;
  larkTokenExpiresAt?: unknown;
};

const LOGIN_USERS_COLLECTION = `${
  process.env.PROJECT_TABLE_PREFIX || 'az-ai-template'
}-login_users`;

// Zod Schema验证
const GetQuerySchema = z.object({
  userId: z.string(),
  username: z.string().optional(),
  email: z.string().email().optional(),
});

const PostBodySchema = z.object({
  userId: z.string(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().default(7200), // 默认2小时
});

const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const resolveLoginUserFilter = ({
  userId,
  username,
  email,
}: {
  userId: string;
  username?: string;
  email?: string;
}): JsonRecord => {
  if (username) {
    return { username };
  }

  if (email) {
    return { email };
  }

  if (isMongoObjectId(userId)) {
    return { _id: { $oid: userId } };
  }

  return { _id: userId };
};

const parseDateValue = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'object' && '$date' in value) {
    const rawDate = (value as { $date?: unknown }).$date;
    if (typeof rawDate === 'string') {
      const parsed = new Date(rawDate);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
};

const findLarkTokenDocument = async (
  filter: JsonRecord
): Promise<LarkTokenDocument | null> => {
  const result = (await prisma.$runCommandRaw({
    find: LOGIN_USERS_COLLECTION,
    filter,
    projection: {
      larkAccessToken: 1,
      larkRefreshToken: 1,
      larkTokenExpiresAt: 1,
    },
    limit: 1,
  })) as RawFindResult;

  const [document] = result.cursor?.firstBatch || [];
  return document && typeof document === 'object'
    ? (document as LarkTokenDocument)
    : null;
};

const updateLarkTokenDocument = async ({
  filter,
  accessToken,
  refreshToken,
  expiresAt,
}: {
  filter: JsonRecord;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}) => {
  const result = (await prisma.$runCommandRaw({
    update: LOGIN_USERS_COLLECTION,
    updates: [
      {
        q: filter,
        u: {
          $set: {
            larkAccessToken: accessToken,
            larkRefreshToken: refreshToken,
            larkTokenExpiresAt: { $date: expiresAt.toISOString() },
          },
        },
        multi: false,
      },
    ],
  })) as RawUpdateResult;

  return result.n || 0;
};

/**
 * GET /api/auth/lark/token
 * 获取用户的飞书Token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const validated = GetQuerySchema.safeParse(params);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: validated.error.issues,
        },
        { status: 400 }
      );
    }

    const filter = resolveLoginUserFilter(validated.data);

    // 查询用户的飞书Token
    const user = await findLarkTokenDocument(filter);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查Token是否有效
    const now = new Date();
    const expiresAt = parseDateValue(user.larkTokenExpiresAt);
    const isExpired = !expiresAt || expiresAt <= now;

    return NextResponse.json({
      success: true,
      data: {
        accessToken: user.larkAccessToken,
        refreshToken: user.larkRefreshToken,
        expiresAt: expiresAt?.toISOString(),
        isExpired,
      },
    });
  } catch (error: unknown) {
    console.error('[Lark Token API] GET Error:', error);
    const message = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/lark/token
 * 更新用户的飞书Token（授权成功后调用）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = PostBodySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: validated.error.issues,
        },
        { status: 400 }
      );
    }

    const { userId, accessToken, refreshToken, expiresIn } = validated.data;
    const filter = resolveLoginUserFilter(validated.data);

    // 计算过期时间
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // 更新用户的飞书Token
    const updatedCount = await updateLarkTokenDocument({
      filter,
      accessToken,
      refreshToken,
      expiresAt,
    });

    if (updatedCount === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    console.log(
      `[Lark Token API] Token已持久化到数据库: userId=${userId}, expiresAt=${expiresAt.toISOString()}`
    );

    return NextResponse.json({
      success: true,
      message: '飞书Token已保存',
      data: {
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('[Lark Token API] POST Error:', error);
    const message = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
