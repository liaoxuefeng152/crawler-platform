/**
 * 数据库状态检测 API
 * GET /api/system/db-status
 *
 * 用于检测当前项目连接的数据库环境状态
 * 返回脱敏的连接信息，用于部署后验证数据库连接是否正确
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * 脱敏连接字符串
 * 将密码部分替换为 ***
 * 例如: mongodb://user:password@host:port/db -> mongodb://user:***@host:port/db
 */
function maskConnectionString(uri: string): string {
  try {
    // 匹配 mongodb://user:password@ 或 mongodb+srv://user:password@ 格式
    return uri.replace(
      /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.*)/,
      '$1***$3'
    );
  } catch {
    return '[无法解析连接字符串]';
  }
}

/**
 * 从 MongoDB 连接字符串中提取信息
 */
function parseMongoUri(uri: string): {
  host: string;
  port: number | string;
  database: string;
} {
  try {
    // 移除协议和认证信息，获取 host:port/database 部分
    const hostPart = uri.split('@')[1] || uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const [hostAndPort, ...dbParts] = hostPart.split('/');
    const database = dbParts.join('/').split('?')[0] || 'unknown';

    // 处理 mongodb+srv 格式（无端口）
    if (uri.includes('+srv')) {
      return {
        host: hostAndPort,
        port: 'N/A (SRV)',
        database,
      };
    }

    const [host, port] = hostAndPort.split(':');
    return {
      host,
      port: port ? parseInt(port, 10) : 27017,
      database,
    };
  } catch {
    return {
      host: 'unknown',
      port: 'unknown',
      database: 'unknown',
    };
  }
}

/**
 * GET /api/system/db-status
 * 获取数据库连接状态
 *
 * @returns {Object} 数据库状态信息
 */
export async function GET() {
  const startTime = Date.now();

  // 检测环境变量来源
  const shentongUri = process.env.SHENTONG_MIDDLEWARE_MONGO_URI;
  const databaseUrl = process.env.DATABASE_URL;
  const mongoUri = shentongUri || databaseUrl || '';

  // 确定实际使用的环境变量来源
  const envSource = shentongUri
    ? 'SHENTONG_MIDDLEWARE_MONGO_URI'
    : databaseUrl
      ? 'DATABASE_URL'
      : 'NONE';

  try {
    // 执行简单查询测试连接（MongoDB 使用 $runCommandRaw）
    await prisma.$runCommandRaw({ ping: 1 });

    const parsedUri = parseMongoUri(mongoUri);

    const response = {
      success: true,
      data: {
        status: 'connected' as const,
        database: {
          type: 'MongoDB',
          host: parsedUri.host,
          port: parsedUri.port,
          database: parsedUri.database,
          connectionString: mongoUri ? maskConnectionString(mongoUri) : 'Not configured',
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'unknown',
          envSource: envSource,
          hasShentongUri: !!shentongUri,
          hasDatabaseUrl: !!databaseUrl,
        },
        latency: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const parsedUri = mongoUri ? parseMongoUri(mongoUri) : { host: 'unknown', port: 'unknown', database: 'unknown' };

    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'error' as const,
          database: {
            type: 'MongoDB',
            host: parsedUri.host,
            port: parsedUri.port,
            database: parsedUri.database,
            connectionString: mongoUri ? maskConnectionString(mongoUri) : 'Not configured',
          },
          environment: {
            nodeEnv: process.env.NODE_ENV || 'unknown',
            envSource: envSource,
            hasShentongUri: !!shentongUri,
            hasDatabaseUrl: !!databaseUrl,
          },
          error: errorMessage,
          latency: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
