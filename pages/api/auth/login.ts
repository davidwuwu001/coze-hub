import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { verifyPassword, generateToken, getIdentifierType } from '../../../src/utils/auth';
import { LoginCredentials, ApiResponse, LoginResponse, User } from '../../../src/types/auth';

/**
 * 用户登录API接口
 * POST /api/auth/login
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<LoginResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不被允许'
    });
  }

  try {
    const { identifier, password, remember }: LoginCredentials = req.body;

    // 验证必填字段
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写用户名和密码'
      });
    }

    // 根据标识符类型构建查询条件
    const identifierType = getIdentifierType(identifier);
    let whereClause = '';
    
    switch (identifierType) {
      case 'email':
        whereClause = 'email = ?';
        break;
      case 'phone':
        whereClause = 'phone = ?';
        break;
      default:
        whereClause = 'username = ?';
        break;
    }

    // 查询用户
    const users = await executeQuery(
      `SELECT id, username, email, phone, avatar, points, password_hash, invite_code, created_at, updated_at, is_active 
       FROM users 
       WHERE ${whereClause} AND is_active = TRUE`,
      [identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 构建用户信息（不包含密码哈希）
    const userInfo: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      points: user.points || 0,
      invite_code: user.invite_code,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: user.is_active
    };

    // 生成JWT令牌
    const token = generateToken(userInfo);

    // 设置Cookie（如果选择记住登录）
    if (remember) {
      res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`, // 7天
        `user=${JSON.stringify(userInfo)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
      ]);
    } else {
      res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Path=/; SameSite=Strict`, // 会话Cookie
        `user=${JSON.stringify(userInfo)}; Path=/; SameSite=Strict`
      ]);
    }

    return res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: userInfo
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}