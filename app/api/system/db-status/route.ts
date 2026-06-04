/**
 * 系统健康检测 API
 * GET /api/system/db-status
 *
 * 用于检测当前项目连接的数据库环境状态、飞书OAuth配置、项目配置等
 * 返回脱敏的连接信息，用于部署后验证各项配置是否正确
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import fs from 'fs';
import path from 'path';

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
 * 检查飞书OAuth配置
 * 支持两种命名格式：LARK_* 和 FEISHU_*
 */
function checkLarkOAuthConfig(): {
  status: 'configured' | 'missing';
  hasAppId: boolean;
  hasAppSecret: boolean;
  hasRedirectUri: boolean;
} {
  const hasAppId = !!process.env.LARK_APP_ID || !!process.env.FEISHU_APP_ID;
  const hasAppSecret = !!process.env.LARK_APP_SECRET || !!process.env.FEISHU_APP_SECRET;
  const hasRedirectUri = !!process.env.LARK_REDIRECT_URI || !!process.env.FEISHU_REDIRECT_URI;

  const status = hasAppId && hasAppSecret && hasRedirectUri ? 'configured' : 'missing';

  return {
    status,
    hasAppId,
    hasAppSecret,
    hasRedirectUri,
  };
}

/**
 * 检查项目配置
 * 支持 NEXT_PUBLIC_PROJECT_NAME 环境变量或 project.config.json 文件
 */
function checkProjectConfig(): {
  status: 'configured' | 'missing';
  hasTablePrefix: boolean;
  hasProjectName: boolean;
} {
  const hasTablePrefix = !!process.env.PROJECT_TABLE_PREFIX;

  // 检查项目名称：优先从环境变量获取，否则从 project.config.json 获取
  let hasProjectName = !!process.env.NEXT_PUBLIC_PROJECT_NAME;

  // 如果环境变量中没有，尝试从 project.config.json 读取
  if (!hasProjectName) {
    try {
      const configPath = path.join(process.cwd(), 'project.config.json');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        hasProjectName = !!config.projectName;
      }
    } catch {
      // 文件读取失败，保持 hasProjectName = false
    }
  }

  const status = hasTablePrefix && hasProjectName ? 'configured' : 'missing';

  return {
    status,
    hasTablePrefix,
    hasProjectName,
  };
}

/**
 * 计算整体健康状态
 */
function calculateOverallStatus(
  dbStatus: 'ok' | 'error',
  larkOAuthStatus: 'configured' | 'missing',
  projectConfigStatus: 'configured' | 'missing'
): 'healthy' | 'partial' | 'error' {
  // 数据库连接失败 -> error
  if (dbStatus === 'error') {
    return 'error';
  }

  // 所有检查通过 -> healthy
  if (larkOAuthStatus === 'configured' && projectConfigStatus === 'configured') {
    return 'healthy';
  }

  // 数据库正常，但其他配置缺失 -> partial
  return 'partial';
}

/**
 * GET /api/system/db-status
 * 获取系统健康状态
 *
 * @returns {Object} 系统健康状态信息，包含数据库、飞书OAuth、项目配置等检查结果
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

  // 检查飞书OAuth配置
  const larkOAuth = checkLarkOAuthConfig();

  // 检查项目配置
  const projectConfig = checkProjectConfig();

  try {
    // 执行简单查询测试连接（MongoDB 使用 $runCommandRaw）
    await prisma.$runCommandRaw({ ping: 1 });

    const parsedUri = parseMongoUri(mongoUri);
    const latency = `${Date.now() - startTime}ms`;

    // 计算整体状态
    const overallStatus = calculateOverallStatus(
      'ok',
      larkOAuth.status,
      projectConfig.status
    );

    // 构建响应（保持向后兼容）
    const response = {
      success: true,
      data: {
        // 新增：整体状态
        overallStatus,
        // 新增：各项检查结果
        checks: {
          database: {
            status: 'ok',
            type: 'MongoDB',
            host: parsedUri.host,
            port: parsedUri.port,
            database: parsedUri.database,
            latency,
          },
          larkOAuth,
          projectConfig,
        },
        // 保持向后兼容：原有字段
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
          timestamp: new Date().toISOString(),
        },
        latency,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const latency = `${Date.now() - startTime}ms`;

    const parsedUri = mongoUri ? parseMongoUri(mongoUri) : { host: 'unknown', port: 'unknown', database: 'unknown' };

    // 计算整体状态（数据库失败时为 error）
    const overallStatus = calculateOverallStatus(
      'error',
      larkOAuth.status,
      projectConfig.status
    );

    return NextResponse.json(
      {
        success: false,
        data: {
          // 新增：整体状态
          overallStatus,
          // 新增：各项检查结果
          checks: {
            database: {
              status: 'error',
              type: 'MongoDB',
              host: parsedUri.host,
              port: parsedUri.port,
              database: parsedUri.database,
              error: errorMessage,
              latency,
            },
            larkOAuth,
            projectConfig,
          },
          // 保持向后兼容：原有字段
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
            timestamp: new Date().toISOString(),
          },
          error: errorMessage,
          latency,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}