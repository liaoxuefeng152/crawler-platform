import { NextRequest, NextResponse } from 'next/server';

/**
 * 飞书 OAuth2 登录入口
 * 重定向到飞书授权页面
 *
 * redirect_uri 动态生成策略：
 * 1. 优先使用请求的 Host Header 动态拼接（支持多环境部署）
 * 2. 环境变量 LARK_REDIRECT_URI 作为 fallback
 */
export async function GET(request: NextRequest) {
  const { LARK_APP_ID, LARK_REDIRECT_URI } = process.env;

  if (!LARK_APP_ID) {
    return NextResponse.json(
      { error: '飞书 OAuth2 配置缺失：LARK_APP_ID' },
      { status: 500 }
    );
  }

  // ========== 动态生成 redirect_uri ==========
  // 读取反向代理传递的真实 Host（K8s/Nginx 场景）
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';

  // 动态拼接 redirect_uri（优先级高于环境变量）
  const dynamicRedirectUri = `${forwardedProto}://${host}/api/auth/lark/callback`;

  // 动态生成优先，环境变量 fallback（适配多环境部署）
  // dynamicRedirectUri 始终有值，类型断言确保 TypeScript 推断正确
  const redirectUri: string = dynamicRedirectUri || LARK_REDIRECT_URI || '';

  console.log('[Lark OAuth] 动态 redirect_uri:', dynamicRedirectUri);
  console.log('[Lark OAuth] 实际使用 redirect_uri:', redirectUri);

  // 从 URL 参数获取重定向目标（登录成功后跳转的页面）
  const searchParams = request.nextUrl.searchParams;
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  // 飞书 OAuth2 授权 URL
  // 文档：https://open.feishu.cn/document/common-capabilities/sso/web-application-web/web-application-overview
  const larkAuthUrl = new URL('https://open.feishu.cn/open-apis/authen/v1/authorize');

  // 添加授权参数
  larkAuthUrl.searchParams.set('app_id', LARK_APP_ID);
  larkAuthUrl.searchParams.set('redirect_uri', redirectUri);
  larkAuthUrl.searchParams.set('state', encodeURIComponent(redirectTarget));

  // 权限范围（基础登录权限）
  // contact:contact.base:readonly - 获取用户基本信息
  larkAuthUrl.searchParams.set('scope', 'contact:contact.base:readonly');

  // 重定向到飞书授权页面
  return NextResponse.redirect(larkAuthUrl.toString());
}