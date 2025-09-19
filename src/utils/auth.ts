import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../types/auth';

/**
 * JWT密钥
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * 密码加密
 * @param password 明文密码
 * @returns Promise<string> 加密后的密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 密码验证
 * @param password 明文密码
 * @param hashedPassword 加密后的密码哈希
 * @returns Promise<boolean> 验证结果
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * 生成JWT令牌
 * @param user 用户信息
 * @returns string JWT令牌
 */
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证JWT令牌
 * @param token JWT令牌
 * @returns any 解码后的用户信息
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('无效的令牌');
  }
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns boolean 验证结果
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 * @param phone 手机号码
 * @returns boolean 验证结果
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证用户名格式
 * @param username 用户名
 * @returns boolean 验证结果
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns boolean 验证结果
 */
export function isValidPassword(password: string): boolean {
  // 至少6位，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,20}$/;
  return passwordRegex.test(password);
}

/**
 * 检测登录标识符类型
 * @param identifier 登录标识符（用户名/邮箱/手机号）
 * @returns string 标识符类型
 */
export function getIdentifierType(identifier: string): 'username' | 'email' | 'phone' {
  if (isValidEmail(identifier)) {
    return 'email';
  } else if (isValidPhone(identifier)) {
    return 'phone';
  } else {
    return 'username';
  }
}

/**
 * 从请求头中提取JWT令牌
 * @param authHeader Authorization头
 * @returns string | null JWT令牌
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}