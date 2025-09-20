import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { verifyToken } from '../../../src/utils/auth';
import { UpdateProfileData, ApiResponse, User } from '../../../src/types/auth';

/**
 * 更新用户个人信息API接口
 * PUT /api/profile/update
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: '方法不被允许'
    });
  }

  try {
    // 验证用户身份
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    }

    const userId = decoded.id;
    const { username, email, phone, avatar }: UpdateProfileData = req.body;
    
    // 验证必填字段
    if (!username || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和手机号不能为空'
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
    
    // 检查用户名是否已被其他用户使用
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE username = ? AND id != ? AND is_active = TRUE',
      [username, userId]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已被使用'
      });
    }
    
    // 检查邮箱是否已被其他用户使用
    const existingEmails = await executeQuery(
      'SELECT id FROM users WHERE email = ? AND id != ? AND is_active = TRUE',
      [email, userId]
    );
    
    if (existingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: '邮箱已被使用'
      });
    }
    
    // 检查手机号是否已被其他用户使用
    const existingPhones = await executeQuery(
      'SELECT id FROM users WHERE phone = ? AND id != ? AND is_active = TRUE',
      [phone, userId]
    );
    
    if (existingPhones.length > 0) {
      return res.status(400).json({
        success: false,
        message: '手机号已被使用'
      });
    }
    
    // 更新用户信息
    await executeQuery(
      'UPDATE users SET username = ?, email = ?, phone = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
      [username, email, phone, avatar ?? null, userId]
    );
    
    // 获取更新后的用户信息
    const updatedUsers = await executeQuery(
      'SELECT id, username, email, phone, avatar, points, invite_code, created_at, updated_at, is_active FROM users WHERE id = ?',
      [userId]
    );
    
    if (updatedUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const updatedUser: User = {
      id: updatedUsers[0].id,
      username: updatedUsers[0].username,
      email: updatedUsers[0].email,
      phone: updatedUsers[0].phone,
      avatar: updatedUsers[0].avatar,
      points: updatedUsers[0].points,
      invite_code: updatedUsers[0].invite_code,
      created_at: updatedUsers[0].created_at,
      updated_at: updatedUsers[0].updated_at,
      is_active: updatedUsers[0].is_active
    };
    
    return res.status(200).json({
      success: true,
      message: '个人信息更新成功',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}