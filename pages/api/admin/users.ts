import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../../../src/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 验证管理员权限
 */
async function verifyAdminAuth(req: NextApiRequest): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: '未提供认证令牌' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 验证用户是否存在且为管理员
    const users = await query(
      'SELECT id, username, email FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return { success: false, error: '用户不存在' };
    }

    const user = users[0] as any;
    // 简化管理员验证 - 使用现有用户ID 3 或 4 作为管理员
    if (user.id !== 3 && user.id !== 4 && user.username !== 'David' && user.username !== 'gg7788') {
      return { success: false, error: '权限不足' };
    }

    return { success: true, userId: decoded.userId };
  } catch (error) {
    console.error('管理员权限验证失败:', error);
    return { success: false, error: '认证失败' };
  }
}

/**
 * 用户管理API接口
 * GET: 获取用户列表
 * PUT: 更新用户信息
 * POST: 创建新用户
 * DELETE: 删除用户
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 验证管理员权限
  const authResult = await verifyAdminAuth(req);
  if (!authResult.success) {
    return res.status(401).json({ 
      success: false, 
      message: authResult.error 
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetUsers(req, res);
        break;
      case 'PUT':
        await handleUpdateUser(req, res);
        break;
      case 'POST':
        await handleCreateUser(req, res);
        break;
      case 'DELETE':
        await handleDeleteUser(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE']);
        res.status(405).json({ success: false, message: '方法不允许' });
    }
  } catch (error) {
    console.error('用户管理API错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
}

/**
 * 获取用户列表
 */
async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    // 搜索条件
    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // 获取用户列表（包含密码哈希，管理员可以查看）
    const users = await query(`
      SELECT 
        id, 
        username, 
        email, 
        phone, 
        password_hash,
        avatar,
        points,
        invite_code,
        is_active,
        created_at,
        updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    // 获取总数
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM users 
      ${whereClause}
    `, params);

    const total = (countResult[0] as any).total;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取用户列表失败' 
    });
  }
}

/**
 * 更新用户信息
 */
async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;
    const { 
      username, 
      email, 
      phone, 
      password, 
      avatar, 
      points, 
      is_active 
    } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: '用户ID不能为空' 
      });
    }

    // 验证用户是否存在
    const existingUsers = await query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (username !== undefined) {
      // 检查用户名是否已存在
      const duplicateUsers = await query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (duplicateUsers.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: '用户名已存在' 
        });
      }
      updateFields.push('username = ?');
      updateValues.push(username);
    }

    if (email !== undefined) {
      // 检查邮箱是否已存在
      const duplicateEmails = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (duplicateEmails.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: '邮箱已存在' 
        });
      }
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (phone !== undefined) {
      // 检查手机号是否已存在
      const duplicatePhones = await query(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, userId]
      );
      if (duplicatePhones.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: '手机号已存在' 
        });
      }
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }

    if (password !== undefined && password.trim() !== '') {
      // 加密新密码
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }

    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (points !== undefined) {
      updateFields.push('points = ?');
      updateValues.push(Number(points));
    }

    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '没有需要更新的字段' 
      });
    }

    // 添加更新时间
    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    // 执行更新
    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // 获取更新后的用户信息
    const updatedUsers = await query(
      `SELECT 
        id, username, email, phone, password_hash, avatar, points, 
        invite_code, is_active, created_at, updated_at
      FROM users WHERE id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: '用户信息更新成功',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新用户信息失败' 
    });
  }
}

/**
 * 创建新用户
 */
async function handleCreateUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, email, phone, password } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码为必填项' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' });
    }

    // 检查用户名是否已存在
    const existingUsername = await query(
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
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱已存在' 
      });
    }

    // 检查手机号是否已存在（如果提供）
    if (phone) {
      const existingPhone = await query(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );
      if (existingPhone.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: '手机号已存在' 
        });
      }
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 生成邀请码
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 创建用户
    const result = await query(
      `INSERT INTO users (username, email, phone, password_hash, invite_code, points) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, phone || null, hashedPassword, inviteCode, 0]
    );

    // 获取新创建的用户信息
    const newUsers = await query(
      `SELECT 
        id, username, email, phone, password_hash, avatar, points, 
        invite_code, is_active, created_at, updated_at
      FROM users WHERE id = ?`,
      [(result as any).insertId]
    )

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: newUsers[0]
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '创建用户失败' 
    });
  }
}

/**
 * 删除用户
 */
async function handleDeleteUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: '用户ID不能为空' 
      });
    }

    // 验证用户是否存在
    const existingUsers = await query(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 软删除用户（设置为非活跃状态）
    await query(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '删除用户失败' 
    });
  }
}