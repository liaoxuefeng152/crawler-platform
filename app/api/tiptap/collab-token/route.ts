import { NextRequest, NextResponse } from 'next/server';

/**
 * Tiptap Cloud Collaboration JWT Token 生成 API
 *
 * 用于生成协作功能的 JWT Token
 * 生产环境应该实现真实的用户认证和 Token 生成逻辑
 */

export async function GET(request: NextRequest) {
  try {
    // 从环境变量获取配置
    const appId = process.env.NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID;
    const secretKey = process.env.TIPTAP_COLLAB_SECRET_KEY;

    if (!appId || !secretKey) {
      return NextResponse.json(
        {
          error: 'Tiptap Cloud 配置缺失',
          message:
            '请在 .env 中配置 NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID 和 TIPTAP_COLLAB_SECRET_KEY',
        },
        { status: 500 }
      );
    }

    // 从请求中获取用户信息（实际应用中应该从 session 或 JWT 中获取）
    // 这里使用模拟用户信息
    const userId =
      request.nextUrl.searchParams.get('userId') ||
      'user_' + Math.random().toString(36).substr(2, 9);
    const userName = request.nextUrl.searchParams.get('userName') || 'User';
    const userColor =
      request.nextUrl.searchParams.get('userColor') ||
      '#' + Math.floor(Math.random() * 16777215).toString(16);

    // TODO: 实现真实的 JWT 生成逻辑
    // 这里需要使用 Tiptap Cloud 提供的密钥生成 JWT
    // 示例代码（需要安装 jsonwebtoken 库）：
    //
    // import jwt from 'jsonwebtoken';
    //
    // const token = jwt.sign(
    //   {
    //     appId: appId,
    //     userId: userId,
    //     userName: userName,
    //     userColor: userColor,
    //     // 其他必要的声明
    //   },
    //   secretKey,
    //   {
    //     expiresIn: '1h', // Token 有效期
    //     issuer: 'template', // 发行者
    //   }
    // );

    // 当前返回示例 Token（仅用于演示）
    // 实际应用中必须使用真实的 JWT 生成逻辑
    const demoToken =
      process.env.TIPTAP_COLLAB_TOKEN ||
      'demo_token_please_replace_with_real_jwt';

    return NextResponse.json({
      token: demoToken,
      appId,
      userId,
      userName,
      userColor,
      // 返回 Token 信息
      expiresIn: 3600, // 1 小时
      issuedAt: Math.floor(Date.now() / 1000),
    });
  } catch (error) {
    console.error('生成 Collaboration Token 错误:', error);
    return NextResponse.json(
      {
        error: '生成 Token 失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * POST 方法 - 用于需要额外验证的场景
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userColor } = body;

    // 验证必需参数
    if (!userId || !userName) {
      return NextResponse.json(
        {
          error: '缺少必需参数',
          message: 'userId 和 userName 是必需的',
        },
        { status: 400 }
      );
    }

    // 调用 GET 方法处理逻辑
    const url = request.nextUrl.clone();
    url.searchParams.set('userId', userId);
    url.searchParams.set('userName', userName);
    if (userColor) {
      url.searchParams.set('userColor', userColor);
    }

    // 重新构造请求并调用 GET 处理器
    return GET(
      new NextRequest(url, { method: 'GET' }) as unknown as NextRequest
    );
  } catch (error) {
    console.error('处理 POST 请求错误:', error);
    return NextResponse.json(
      {
        error: '请求处理失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
