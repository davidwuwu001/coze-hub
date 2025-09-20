import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

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
 * 验证重置令牌API接口
 * 检查重置令牌是否有效且未过期
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不被允许' });
  }

  const { token } = req.body;

  // 验证必填字段
  if (!token) {
    return res.status(400).json({ 
      message: '缺少重置令牌' 
    });
  }

  let connection;

  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);

    // 查询令牌信息
    const [rows] = await connection.execute(
      `SELECT id, username, email, phone, reset_token_expiry FROM users 
       WHERE reset_token = ? AND reset_token_expiry > NOW()`,
      [token]
    );

    const users = rows as any[];

    if (users.length === 0) {
      return res.status(404).json({ 
        message: '重置链接无效或已过期' 
      });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      message: '令牌验证成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('验证重置令牌失败:', error);
    return res.status(500).json({ 
      message: '服务器内部错误，请稍后重试' 
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}