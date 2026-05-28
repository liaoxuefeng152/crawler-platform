import { userDataManager } from './db';
import { PasswordHasher } from './crypto';

/**
 * 默认用户配置
 */
const DEFAULT_USER = {
  username: 'az',
  password: '88888888',
  displayName: '深瞳用户',
  email: 'az@az-ai.com',
  avatar: '',
  status: 'active' as const,
  department: 'IT部门',
  phone: '13800138000',
};

/**
 * 确保默认用户存在
 * 如果不存在则创建，如果存在但密码不匹配则更新密码
 *
 * 此函数应在应用启动时调用，确保始终有可用的默认登录账号
 *
 * 注意：POC 阶段使用明文密码存储，避免构建时的文件系统问题
 */
export async function ensureDefaultUser(): Promise<void> {
  try {
    // 检查默认用户是否存在
    const existingUser = await userDataManager.getUserByUsername(DEFAULT_USER.username);

    if (!existingUser) {
      // 用户不存在，创建新用户（使用明文密码）
      await userDataManager.addUser({
        username: DEFAULT_USER.username,
        password: DEFAULT_USER.password, // 明文密码
        displayName: DEFAULT_USER.displayName,
        email: DEFAULT_USER.email,
        avatar: DEFAULT_USER.avatar,
        status: DEFAULT_USER.status,
        department: DEFAULT_USER.department,
        phone: DEFAULT_USER.phone,
      });

      console.log(`✅ 默认账号 "${DEFAULT_USER.username}" 已创建`);
      return;
    }

    // 用户存在，检查密码是否匹配（明文比较）
    const isPasswordValid = existingUser.password === DEFAULT_USER.password;

    if (!isPasswordValid) {
      // 密码不匹配，更新为正确的明文密码
      await userDataManager.updateUser(existingUser.id, {
        password: DEFAULT_USER.password, // 明文密码
      });

      console.log(`✅ 默认账号 "${DEFAULT_USER.username}" 密码已重置`);
    } else {
      console.log(`✅ 默认账号 "${DEFAULT_USER.username}" 已就绪`);
    }
  } catch (error) {
    console.error('❌ 初始化默认用户失败:', error);
    // 不抛出错误，避免影响应用启动
  }
}

/**
 * 重置默认用户密码（仅用于开发/调试）
 */
export async function resetDefaultUserPassword(): Promise<void> {
  try {
    const user = await userDataManager.getUserByUsername(DEFAULT_USER.username);

    if (!user) {
      console.warn(`⚠️ 用户 "${DEFAULT_USER.username}" 不存在`);
      return;
    }

    const hashedPassword = await PasswordHasher.hash(DEFAULT_USER.password);
    await userDataManager.updateUser(user.id, {
      password: hashedPassword,
    });

    console.log(`✅ 默认账号 "${DEFAULT_USER.username}" 密码已重置为: ${DEFAULT_USER.password}`);
  } catch (error) {
    console.error('❌ 重置密码失败:', error);
    throw error;
  }
}
