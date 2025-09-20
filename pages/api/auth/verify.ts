import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { verifyToken, extractTokenFromHeader } from '../../../src/utils/auth';
import { ApiResponse, User } from '../../../src/types/auth';

/**
 * 验证登录状态API接口
 * GET /api/auth/verify
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ user: User }>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: '方法不被允许'
    });
  }

  try {
    // 从Cookie或Authorization头中获取token
    let token = req.cookies.token;
    
    if (!token) {
      token = extractTokenFromHeader(req.headers.authorization);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 验证JWT令牌
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }

    // 从数据库获取最新的用户信息
    const users = await executeQuery(
      `SELECT id, username, email, phone, avatar, points, invite_code, created_at, updated_at, is_active 
       FROM users 
       WHERE id = ? AND is_active = TRUE`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    const user: User = {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      phone: users[0].phone,
      avatar: users[0].avatar,
      points: users[0].points || 0,
      invite_code: users[0].invite_code,
      created_at: users[0].created_at,
      updated_at: users[0].updated_at,
      is_active: users[0].is_active
    };

    return res.status(200).json({
      success: true,
      message: '验证成功',
      data: { user }
    });

  } catch (error) {
    console.error('验证失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}