/**
 * 飞书 Token 管理服务
 *
 * 功能：
 * 1. 存储 Token 及过期时间到 localStorage + 数据库（双重持久化）
 * 2. 调用飞书 API 前主动判断是否即将过期
 * 3. 自动后台刷新 Token（用户无感知）
 * 4. 刷新失败时提示重新授权
 * 5. 页面加载时启动后台定时刷新（每分钟检查）
 * 6. 优先使用localStorage，数据库作为备用来源（解决重新打开项目需重新授权的问题）
 */

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lark_user_access_token',
  REFRESH_TOKEN: 'lark_user_refresh_token',
  EXPIRES_AT: 'lark_user_access_token_expires_at', // 过期时间戳（毫秒）
};

// Token 过期阈值：提前 30 分钟刷新（更频繁刷新，避免过期）
const EXPIRE_THRESHOLD_MS = 30 * 60 * 1000;

// 后台刷新检查间隔：每 30 秒检查一次（更频繁检查）
const BACKGROUND_CHECK_INTERVAL_MS = 30 * 1000;

export interface LarkTokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // 过期时间戳（毫秒）
}

/**
 * 飞书 Token 管理服务类
 */
class LarkTokenService {
  private backgroundTimer: NodeJS.Timeout | null = null;
  private onTokenExpired?: () => void; // Token 过期回调
  private currentUserId?: string; // 当前用户ID（用于数据库持久化）

  /**
   * 启动后台自动刷新
   * 页面加载后调用，定时检查 token 是否即将过期
   *
   * @param onExpired Token 过期需要重新授权时的回调
   * @param userId 用户ID（用于从数据库恢复Token）
   */
  startBackgroundRefresh(onExpired?: () => void, userId?: string): void {
    this.onTokenExpired = onExpired;
    this.currentUserId = userId; // 保存 userId 用于数据库持久化

    // 避免重复启动
    if (this.backgroundTimer) {
      console.log('[LarkTokenService] 后台刷新已启动，跳过');
      return;
    }

    console.log('[LarkTokenService] 启动后台自动刷新，每30秒检查一次');

    // 立即检查一次（包括从数据库恢复Token）
    this.checkAndRefresh(userId);

    // 启动定时器
    this.backgroundTimer = setInterval(() => {
      this.checkAndRefresh(userId);
    }, BACKGROUND_CHECK_INTERVAL_MS);
  }

  /**
   * 停止后台自动刷新
   * 页面卸载时调用
   */
  stopBackgroundRefresh(): void {
    if (this.backgroundTimer) {
      clearInterval(this.backgroundTimer);
      this.backgroundTimer = null;
      console.log('[LarkTokenService] 后台刷新已停止');
    }
  }

  /**
   * 从数据库恢复Token（localStorage丢失时使用）
   * 解决每次重新打开项目需重新授权的问题
   */
  private async restoreTokenFromDatabase(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/auth/lark/token?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.data?.accessToken && data.data?.refreshToken) {
        // 检查是否过期
        const expiresAt = data.data.expiresAt ? new Date(data.data.expiresAt) : null;
        const isExpired = data.data.isExpired;

        if (!isExpired && expiresAt) {
          // Token有效，恢复到localStorage
          const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
          this.saveTokens(data.data.accessToken, data.data.refreshToken, expiresIn);
          console.log('[LarkTokenService] Token已从数据库恢复，剩余时间:', Math.floor(expiresIn / 60), '分钟');
          return true;
        } else {
          // Token已过期，尝试使用refreshToken刷新
          console.log('[LarkTokenService] 数据库中的Token已过期，尝试刷新');
          const newToken = await this.refreshTokenInternal(data.data.refreshToken);
          if (newToken) {
            return true;
          }
        }
      }

      console.log('[LarkTokenService] 数据库中无有效Token');
      return false;
    } catch (error) {
      console.error('[LarkTokenService] 从数据库恢复Token失败:', error);
      return false;
    }
  }

  /**
   * 检查并刷新 Token（后台调用）
   * 如果localStorage中没有Token，尝试从数据库恢复
   */
  private async checkAndRefresh(userId?: string): Promise<void> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    // 没有 Token，尝试从数据库恢复
    if (!accessToken || !refreshToken) {
      if (userId) {
        console.log('[LarkTokenService] localStorage无Token，尝试从数据库恢复');
        const restored = await this.restoreTokenFromDatabase(userId);
        if (restored) {
          console.log('[LarkTokenService] Token已从数据库恢复');
          return;
        }
      }
      return;
    }

    // 没有过期时间，尝试刷新
    if (!expiresAtStr) {
      console.log('[LarkTokenService] 后台检查：无过期时间，尝试刷新');
      const newToken = await this.refreshTokenInternal(refreshToken);
      if (!newToken && this.onTokenExpired) {
        this.onTokenExpired();
      }
      return;
    }

    const expiresAt = Number(expiresAtStr);
    const now = Date.now();
    const remainingMinutes = Math.floor((expiresAt - now) / 1000 / 60);

    // Token 有效且不需要刷新（阈值改为30分钟）
    if (remainingMinutes > 30) {
      console.log(`[LarkTokenService] 后台检查：Token 有效，剩余 ${remainingMinutes} 分钟`);
      return;
    }

    // Token 即将过期，需要刷新
    console.log(`[LarkTokenService] 后台检查：Token 即将过期（剩余 ${remainingMinutes} 分钟），开始刷新`);
    const newToken = await this.refreshTokenInternal(refreshToken);
    if (!newToken && this.onTokenExpired) {
      console.log('[LarkTokenService] Token 刷新失败，触发重新授权回调');
      this.onTokenExpired();
    }
  }

  /**
   * 内部刷新方法（不清除 token，只返回结果）
   */
  private async refreshTokenInternal(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/lark/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.access_token) {
        const expiresIn = data.expires_in || 7200;
        this.saveTokens(data.access_token, data.refresh_token || refreshToken, expiresIn);
        console.log('[LarkTokenService] 后台刷新成功');
        return data.access_token;
      }

      if (data.needReauth) {
        console.log('[LarkTokenService] refresh_token 已过期');
        return null;
      }

      console.error('[LarkTokenService] 后台刷新失败:', data.error);
      return null;
    } catch (error) {
      console.error('[LarkTokenService] 后台刷新请求失败:', error);
      return null;
    }
  }

  /**
   * 存储 Token 信息
   * 在飞书授权回调成功后调用
   * 同时持久化到数据库（如果有 userId）
   *
   * @param accessToken 飞书 user_access_token
   * @param refreshToken 飞书 user_refresh_token
   * @param expiresIn 过期时间（秒），飞书默认约 7200 秒（2小时）
   */
  saveTokens(accessToken: string, refreshToken: string, expiresIn: number = 7200): void {
    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));

    console.log('[LarkTokenService] Token 已存储，将于', new Date(expiresAt).toLocaleString(), '过期');

    // 同步到数据库（如果有 userId）
    if (this.currentUserId) {
      this.persistToDatabase(accessToken, refreshToken, expiresIn);
    }
  }

  /**
   * 持久化 Token 到数据库
   */
  private async persistToDatabase(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    try {
      await fetch('/api/auth/lark/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentUserId,
          accessToken,
          refreshToken,
          expiresIn,
        }),
      });
      console.log('[LarkTokenService] Token 已持久化到数据库');
    } catch (error) {
      console.error('[LarkTokenService] Token 持久化到数据库失败:', error);
    }
  }

  /**
   * 获取有效的 Token（自动刷新）
   *
   * @returns 有效 Token，如果刷新失败返回 null
   */
  async getValidToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    // 没有 Token，需要授权
    if (!accessToken || !refreshToken) {
      console.log('[LarkTokenService] 无 Token，需要授权');
      return null;
    }

    // 没有过期时间记录，使用保守策略：尝试刷新
    if (!expiresAtStr) {
      console.log('[LarkTokenService] 无过期时间记录，尝试刷新');
      return await this.refreshToken();
    }

    const expiresAt = Number(expiresAtStr);
    const now = Date.now();

    // Token 已过期或即将过期（提前 5 分钟）
    if (now >= expiresAt - EXPIRE_THRESHOLD_MS) {
      console.log('[LarkTokenService] Token 已过期或即将过期，尝试刷新');
      console.log('[LarkTokenService] 过期时间:', new Date(expiresAt).toLocaleString(), '当前时间:', new Date(now).toLocaleString());
      return await this.refreshToken();
    }

    // Token 有效，直接返回
    console.log('[LarkTokenService] Token 有效，剩余时间:', Math.floor((expiresAt - now) / 1000 / 60), '分钟');
    return accessToken;
  }

  /**
   * 刷新 Token
   *
   * @returns 新 Token，刷新失败返回 null
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      console.log('[LarkTokenService] 无 refresh_token，无法刷新');
      this.clearTokens();
      return null;
    }

    try {
      console.log('[LarkTokenService] 开始刷新 Token...');

      const response = await fetch('/api/auth/lark/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.access_token) {
        // 刷新成功，更新存储
        const expiresIn = data.expires_in || 7200; // 飞书默认 2 小时
        this.saveTokens(data.access_token, data.refresh_token || refreshToken, expiresIn);

        console.log('[LarkTokenService] Token 刷新成功');
        return data.access_token;
      }

      // refresh_token 也过期了
      if (data.needReauth) {
        console.log('[LarkTokenService] refresh_token 已过期，需要重新授权');
        this.clearTokens();
        return null;
      }

      // 其他刷新失败
      console.error('[LarkTokenService] Token 刷新失败:', data.error);
      return null;
    } catch (error) {
      console.error('[LarkTokenService] Token 刷新请求失败:', error);
      return null;
    }
  }

  /**
   * 清除 Token 信息
   * 当 refresh_token 也过期时调用
   */
  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    console.log('[LarkTokenService] Token 已清除');
  }

  /**
   * 检查授权状态
   *
   * @returns 是否有有效授权
   */
  hasValidAuth(): boolean {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return !!accessToken && !!refreshToken;
  }

  /**
   * 获取 Token 信息（用于显示）
   *
   * @returns Token 信息对象
   */
  getTokenInfo(): LarkTokenInfo | null {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAtStr ? Number(expiresAtStr) : Date.now() + 7200 * 1000,
    };
  }

  /**
   * 获取剩余有效时间（分钟）
   *
   * @returns 剩余分钟数，-1 表示已过期或无记录
   */
  getRemainingMinutes(): number {
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAtStr) {
      return -1;
    }

    const expiresAt = Number(expiresAtStr);
    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      return -1; // 已过期
    }

    return Math.floor(remaining / 1000 / 60);
  }
}

// 单例导出
export const larkTokenService = new LarkTokenService();
export default larkTokenService;