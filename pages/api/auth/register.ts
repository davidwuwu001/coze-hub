import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { hashPassword, isValidEmail, isValidPhone, isValidUsername, isValidPassword } from '../../../src/utils/auth';
import { RegisterData, ApiResponse, RegisterResponse } from '../../../src/types/auth';

/**
 * 用户注册API接口
 * POST /api/auth/register
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<RegisterResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不被允许'
    });
  }

  try {
    const { username, email, phone, password, inviteCode }: RegisterData = req.body;

    // 验证必填字段
    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 验证字段格式
    if (!isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: '用户名格式不正确，只能包含字母、数字和下划线，长度3-20位'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: '密码格式不正确，至少6位且包含字母和数字'
      });
    }

    // 验证邀请码（如果提供）
    if (inviteCode) {
      const inviteCodeResult = await executeQuery(
        'SELECT * FROM invite_codes WHERE code = ? AND is_active = TRUE AND used_by_user_id IS NULL',
        [inviteCode]
      );

      if (inviteCodeResult.length === 0) {
        return res.status(400).json({
          success: false,
          message: '邀请码无效或已被使用'
        });
      }
    }

    // 检查用户名是否已存在
    const existingUsername = await executeQuery(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: '邮箱已被注册'
      });
    }

    // 检查手机号是否已存在
    const existingPhone = await executeQuery(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: '手机号已被注册'
      });
    }

    // 加密密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const insertResult = await executeQuery(
      'INSERT INTO users (username, email, phone, password_hash, invite_code) VALUES (?, ?, ?, ?, ?)',
      [username, email, phone, passwordHash, inviteCode || null]
    );

    const userId = insertResult.insertId;

    // 如果使用了邀请码，标记为已使用
    if (inviteCode) {
      await executeQuery(
        'UPDATE invite_codes SET used_by_user_id = ?, used_at = NOW() WHERE code = ?',
        [userId, inviteCode]
      );
    }

    return res.status(201).json({
      success: true,
      message: '注册成功',
      data: { userId }
    });

  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}