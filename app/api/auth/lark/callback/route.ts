import { NextRequest, NextResponse } from 'next/server';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { LoginUserDataManager, type ExtendedUser } from '@/lib/db';

/**
 * 飞书 OAuth2 回调处理
 * 交换 code 获取用户信息，创建或登录用户
 */
export async function GET(request: NextRequest) {
  const { LARK_APP_ID, LARK_APP_SECRET, LARK_REDIRECT_URI } = process.env;

  if (!LARK_APP_ID || !LARK_APP_SECRET || !LARK_REDIRECT_URI) {
    return NextResponse.json(
      { error: '飞书 OAuth2 配置缺失' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=lark_no_code', request.url));
  }

  try {
    // Step 1: 获取 app_access_token（应用访问凭证）
    // 文档：https://open.feishu.cn/document/server-docs/authentication-management/access-token/get-app_access_token
    const appTokenResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: LARK_APP_ID,
        app_secret: LARK_APP_SECRET,
      }),
    });

    const appTokenData = await appTokenResponse.json();

    if (!appTokenData.app_access_token) {
      console.error('飞书 app_access_token 获取失败:', appTokenData);
      return NextResponse.redirect(new URL('/login?error=lark_app_token_failed', request.url));
    }

    const appAccessToken = appTokenData.app_access_token;

    // Step 2: 使用 app_access_token 获取 user_access_token
    // 文档：https://open.feishu.cn/document/server-docs/authentication-management/access-token/get-user_access_token
    const tokenResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/oidc/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appAccessToken}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.code !== 0 || !tokenData.data?.access_token) {
      console.error('飞书 user_access_token 获取失败:', tokenData);
      return NextResponse.redirect(new URL('/login?error=lark_token_failed', request.url));
    }

    const accessToken = tokenData.data.access_token;
    const refreshToken = tokenData.data.refresh_token;  // 飞书 refresh_token

    // Step 3: 使用 user_access_token 获取用户信息
    // 文档：https://open.feishu.cn/document/common-capabilities/sso/api/get-user-info
    const userResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const larkUserData = await userResponse.json();

    if (!larkUserData.data) {
      console.error('飞书用户信息获取失败:', larkUserData);
      return NextResponse.redirect(new URL('/login?error=lark_user_failed', request.url));
    }

    // 飞书用户信息字段
    // 文档：https://open.feishu.cn/document/common-capabilities/sso/api/get-user-info
    const userInfo = larkUserData.data;
    const name = userInfo.name || userInfo.en_name || '飞书用户';
    const avatar_url = userInfo.avatar_url || userInfo.avatar_thumb || '';
    const email = userInfo.email || userInfo.enterprise_email || '';
    const mobile = userInfo.mobile || '';
    const user_id = userInfo.open_id || userInfo.union_id || userInfo.user_id;

    // Step 4: 创建或查找本地用户
    // 使用飞书 user_id 作为唯一标识，或使用 email
    const larkUserId = user_id || email;
    const username = `lark_${larkUserId}`;
    const displayName = name || '飞书用户';
    const userEmail = email || `${username}@lark.placeholder`;
    const userAvatar = avatar_url || '';

    // 查找是否已有飞书用户
    let existingUser: ExtendedUser | null = await LoginUserDataManager.getUserByUsername(username);

    if (!existingUser) {
      // 查找是否已有相同邮箱的用户（可能是之前用其他方式注册的）
      existingUser = await LoginUserDataManager.getByEmail(email);

      if (existingUser) {
        // 更新飞书信息（可选）
        console.log(`用户 ${email} 已存在，使用飞书登录`);
      } else {
        // 创建新用户
        try {
          const newUser = await LoginUserDataManager.create({
            username,
            password: '', // 飞书用户无需密码
            displayName,
            email: userEmail,
            avatar: userAvatar,
            status: 'active',
            department: undefined,
            phone: mobile || undefined,
          });
          // create 返回 ExtendedUserWithPassword，取其字段即可
          existingUser = {
            id: newUser.id,
            username: newUser.username,
            displayName: newUser.displayName,
            email: newUser.email,
            avatar: newUser.avatar,
            status: newUser.status,
            department: newUser.department,
            phone: newUser.phone,
            role: newUser.role || 'user',
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
          };
          console.log(`飞书用户创建成功: ${username}`);
        } catch (createError) {
          console.error('飞书用户创建失败:', createError);
          return NextResponse.redirect(new URL('/login?error=lark_create_failed', request.url));
        }
      }
    }

    // 检查用户状态
    if (existingUser.status !== 'active') {
      return NextResponse.redirect(new URL('/login?error=user_inactive', request.url));
    }

    // Step 5: 生成 JWT token
    const userPayload = {
      id: existingUser.id,
      name: existingUser.displayName,
      username: existingUser.username,
      role: existingUser.role || 'user', // 添加真实角色
    };

    const jwtAccessToken = await createAccessToken(userPayload);
    const jwtRefreshToken = await createRefreshToken(userPayload);

    // Step 6: 构造重定向 URL，携带 token
    // 使用请求头中的 host 构造正确的外部 URL
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${forwardedProto}://${host}`;

    const redirectTarget = state ? decodeURIComponent(state) : '/dashboard';
    const callbackUrl = new URL('/auth/lark/callback', baseUrl);

    // 将 token 和用户信息放在 URL 参数中
    callbackUrl.searchParams.set('lark_access_token', jwtAccessToken);
    callbackUrl.searchParams.set('lark_refresh_token', jwtRefreshToken);
    callbackUrl.searchParams.set('lark_user_id', existingUser.id);
    callbackUrl.searchParams.set('lark_user_name', existingUser.displayName);
    callbackUrl.searchParams.set('lark_user_username', existingUser.username);
    callbackUrl.searchParams.set('lark_user_email', existingUser.email);
    callbackUrl.searchParams.set('lark_user_role', existingUser.role || 'user'); // 添加真实角色
    // 添加飞书 user_access_token（用于调用飞书 API）
    if (accessToken) {
      callbackUrl.searchParams.set('lark_user_access_token', accessToken);
    }
    if (refreshToken) {
      callbackUrl.searchParams.set('lark_user_refresh_token', refreshToken);
    }
    callbackUrl.searchParams.set('redirect', redirectTarget);

    return NextResponse.redirect(callbackUrl.toString());
  } catch (error) {
    console.error('飞书 OAuth2 回调处理失败:', error);
    return NextResponse.redirect(new URL('/login?error=lark_auth_failed', request.url));
  }
}