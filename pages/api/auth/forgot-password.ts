import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

// 数据库连接配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub',
  charset: 'utf8mb4'
};

/**
 * 忘记密码API接口
 * 验证用户提供的用户名、邮箱和手机号是否匹配
 * 如果匹配则生成重置令牌
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不被允许' });
  }

  const { identifier, email, phone } = req.body;

  // 验证必填字段
  if (!identifier || !email || !phone) {
    return res.status(400).json({ 
      message: '请填写完整的用户信息' 
    });
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: '邮箱格式不正确' 
    });
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ 
      message: '手机号格式不正确' 
    });
  }

  let connection;

  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);

    // 查询用户信息
    const [rows] = await connection.execute(
      `SELECT id, username, email, phone FROM users 
       WHERE username = ? AND email = ? AND phone = ?`,
      [identifier, email, phone]
    );

    const users = rows as any[];

    if (users.length === 0) {
      return res.status(404).json({ 
        message: '用户信息不匹配，请检查输入的用户名、邮箱和手机号' 
      });
    }

    const user = users[0];

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期

    // 将重置令牌存储到数据库
    await connection.execute(
      `UPDATE users SET 
       reset_token = ?, 
       reset_token_expiry = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [resetToken, resetTokenExpiry, user.id]
    );

    // 记录操作日志
    await connection.execute(
      `INSERT INTO user_logs (user_id, action, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [
        user.id,
        'forgot_password_request',
        req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
        req.headers['user-agent'] || 'unknown'
      ]
    );

    console.log(`用户 ${user.username} 请求重置密码，令牌: ${resetToken}`);

    return res.status(200).json({
      success: true,
      message: '身份验证成功',
      token: resetToken
    });

  } catch (error) {
    console.error('忘记密码处理失败:', error);
    return res.status(500).json({ 
      message: '服务器内部错误，请稍后重试' 
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 验证重置令牌是否有效
 * @param token 重置令牌
 * @returns 用户信息或null
 */
export async function validateResetToken(token: string) {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT id, username, email, phone FROM users 
       WHERE reset_token = ? AND reset_token_expiry > NOW()`,
      [token]
    );

    const users = rows as any[];
    return users.length > 0 ? users[0] : null;

  } catch (error) {
    console.error('验证重置令牌失败:', error);
    return null;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}