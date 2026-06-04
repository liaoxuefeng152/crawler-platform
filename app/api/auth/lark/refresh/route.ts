/**
 * 飞书 user_access_token 刷新 API
 * POST /api/auth/lark/refresh
 *
 * 使用 refresh_token 获取新的 user_access_token，无需重新登录授权
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { LARK_APP_ID, LARK_APP_SECRET } = process.env;

  if (!LARK_APP_ID || !LARK_APP_SECRET) {
    return NextResponse.json(
      { success: false, error: '飞书 OAuth2 配置缺失' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const refreshToken = body.refresh_token;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: '缺少 refresh_token' },
        { status: 400 }
      );
    }

    // Step 1: 获取 app_access_token
    const appTokenResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: LARK_APP_ID,
        app_secret: LARK_APP_SECRET,
      }),
    });

    const appTokenData = await appTokenResponse.json();

    if (!appTokenData.app_access_token) {
      console.error('[Lark Refresh] app_access_token 获取失败:', appTokenData);
      return NextResponse.json(
        { success: false, error: '获取 app_access_token 失败' },
        { status: 500 }
      );
    }

    const appAccessToken = appTokenData.app_access_token;

    // Step 2: 使用 refresh_token 获取新的 user_access_token
    // 文档：https://open.feishu.cn/document/server-docs/authentication-management/access-token/refresh-user_access_token
    const refreshResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/oidc/refresh_access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appAccessToken}`,
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const refreshData = await refreshResponse.json();

    console.log('[Lark Refresh] 飞书 API 响应:', JSON.stringify(refreshData, null, 2));

    if (refreshData.code !== 0 || !refreshData.data?.access_token) {
      console.error('[Lark Refresh] 刷新 token 失败: code=' + refreshData.code + ', msg=' + refreshData.msg);

      // 如果 refresh_token 也过期了，需要重新授权
      // 错误码参考: https://open.feishu.cn/document/server-docs/authentication-management/access-token/refresh-user_access_token
      if (refreshData.code === 10001 || refreshData.code === 10002 || refreshData.code === 10003) {
        return NextResponse.json(
          {
            success: false,
            error: 'refresh_token 已过期或无效，需要重新授权',
            needReauth: true,
            errorCode: refreshData.code
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: refreshData.msg || '刷新 token 失败', errorCode: refreshData.code },
        { status: 500 }
      );
    }

    const newAccessToken = refreshData.data.access_token;
    const newRefreshToken = refreshData.data.refresh_token;
    const expiresIn = refreshData.data.expires_in || 7200; // 飞书默认 2 小时

    console.log('[Lark Refresh] Token 刷新成功，有效期:', expiresIn, '秒');

    return NextResponse.json({
      success: true,
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: expiresIn, // 返回过期时间（秒）
    });
  } catch (error: any) {
    console.error('[Lark Refresh] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}