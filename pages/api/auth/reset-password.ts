import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { hashPassword } from '../../../src/utils/auth';
import { PasswordResetData, ApiResponse } from '../../../src/types/auth';

/**
 * 密码找回API接口
 * POST /api/auth/reset-password
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不被允许'
    });
  }

  try {
    const { username, phone, email, newPassword }: PasswordResetData = req.body;
    
    // 验证必填字段
    if (!username || !phone || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '所有字段都是必填的'
      });
    }
    
    // 验证密码长度
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少6位'
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }
    
    // 查找用户，验证用户名、手机号、邮箱是否匹配
    const users = await executeQuery(
      'SELECT id, username FROM users WHERE username = ? AND phone = ? AND email = ? AND is_active = TRUE',
      [username, phone, email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: '用户名、手机号或邮箱不匹配，请检查输入信息'
      });
    }
    
    const user = users[0];
    
    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);
    
    // 更新用户密码
    await executeQuery(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    return res.status(200).json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    });
    
  } catch (error) {
    console.error('密码重置失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}