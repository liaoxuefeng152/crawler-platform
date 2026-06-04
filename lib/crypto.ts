import crypto from 'crypto';

/**
 * 简单的密码哈希工具
 * 在生产环境中建议使用 bcrypt 等更安全的库
 */
export class PasswordHasher {
  private static readonly SALT_LENGTH = 32;
  private static readonly ITERATIONS = 10000;
  private static readonly KEY_LENGTH = 64;
  private static readonly ALGORITHM = 'sha512';

  /**
   * 生成密码哈希
   */
  static async hash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 生成随机盐值
      const salt = crypto.randomBytes(this.SALT_LENGTH).toString('hex');

      crypto.pbkdf2(
        password,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        this.ALGORITHM,
        (err, derivedKey) => {
          if (err) reject(err);

          // 将盐值和哈希值组合存储
          const hash = salt + ':' + derivedKey.toString('hex');
          resolve(hash);
        }
      );
    });
  }

  /**
   * 验证密码
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');

      if (!salt || !key) {
        resolve(false);
        return;
      }

      crypto.pbkdf2(
        password,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        this.ALGORITHM,
        (err, derivedKey) => {
          if (err) reject(err);

          const isValid = derivedKey.toString('hex') === key;
          resolve(isValid);
        }
      );
    });
  }
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${randomStr}`;
}

/**
 * 生成用户ID（带前缀）
 */
export function generateUserId(): string {
  return `user_${generateId()}`;
}
