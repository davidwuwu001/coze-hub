const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const router = express.Router();

/**
 * 获取用户个人信息
 * GET /api/profile
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await db.execute(
      'SELECT id, username, email, phone, avatar, points, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 更新用户个人信息
 * PUT /api/profile/update
 */
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, phone, avatar } = req.body;
    
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
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, userId]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已被使用'
      });
    }
    
    // 检查邮箱是否已被其他用户使用
    const [existingEmails] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );
    
    if (existingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: '邮箱已被使用'
      });
    }
    
    // 检查手机号是否已被其他用户使用
    const [existingPhones] = await db.execute(
      'SELECT id FROM users WHERE phone = ? AND id != ?',
      [phone, userId]
    );
    
    if (existingPhones.length > 0) {
      return res.status(400).json({
        success: false,
        message: '手机号已被使用'
      });
    }
    
    // 更新用户信息
    await db.execute(
      'UPDATE users SET username = ?, email = ?, phone = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
      [username, email, phone, avatar || null, userId]
    );
    
    // 获取更新后的用户信息
    const [updatedUser] = await db.execute(
      'SELECT id, username, email, phone, avatar, points, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: '个人信息更新成功',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 获取积分记录
 * GET /api/profile/points-records
 */
router.get('/points-records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const [rows] = await db.execute(
      `SELECT id, user_id, points, type, description, created_at 
       FROM points_records 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // 获取总记录数
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM points_records WHERE user_id = ?',
      [userId]
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('获取积分记录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 积分充值
 * POST /api/profile/recharge-points
 */
router.post('/recharge-points', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, points, payment_method } = req.body;
    
    // 验证参数
    if (!amount || !points || amount <= 0 || points <= 0) {
      return res.status(400).json({
        success: false,
        message: '充值金额和积分必须大于0'
      });
    }
    
    // 验证支付方式
    const validPaymentMethods = ['alipay', 'wechat', 'bank_card'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: '不支持的支付方式'
      });
    }
    
    // 开始事务
    await db.execute('START TRANSACTION');
    
    try {
      // 更新用户积分
      await db.execute(
        'UPDATE users SET points = points + ?, updated_at = NOW() WHERE id = ?',
        [points, userId]
      );
      
      // 记录积分变动
      await db.execute(
        `INSERT INTO points_records (user_id, points, type, description, created_at) 
         VALUES (?, ?, 'recharge', ?, NOW())`,
        [userId, points, `充值获得 ${points} 积分（支付 ¥${amount}）`]
      );
      
      // 记录充值订单（可选，用于财务对账）
      await db.execute(
        `INSERT INTO recharge_orders (user_id, amount, points, payment_method, status, created_at) 
         VALUES (?, ?, ?, ?, 'completed', NOW())`,
        [userId, amount, points, payment_method]
      );
      
      // 提交事务
      await db.execute('COMMIT');
      
      // 获取更新后的用户积分
      const [userResult] = await db.execute(
        'SELECT points FROM users WHERE id = ?',
        [userId]
      );
      
      res.json({
        success: true,
        message: '充值成功',
        data: {
          points: userResult[0].points,
          recharge_points: points,
          amount: amount
        }
      });
    } catch (error) {
      // 回滚事务
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('积分充值失败:', error);
    res.status(500).json({
      success: false,
      message: '充值失败，请稍后重试'
    });
  }
});

/**
 * 消费积分
 * POST /api/profile/spend-points
 */
router.post('/spend-points', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { points, description } = req.body;
    
    // 验证参数
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: '消费积分必须大于0'
      });
    }
    
    // 检查用户积分是否足够
    const [userResult] = await db.execute(
      'SELECT points FROM users WHERE id = ?',
      [userId]
    );
    
    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const currentPoints = userResult[0].points;
    if (currentPoints < points) {
      return res.status(400).json({
        success: false,
        message: '积分不足'
      });
    }
    
    // 开始事务
    await db.execute('START TRANSACTION');
    
    try {
      // 扣除用户积分
      await db.execute(
        'UPDATE users SET points = points - ?, updated_at = NOW() WHERE id = ?',
        [points, userId]
      );
      
      // 记录积分变动
      await db.execute(
        `INSERT INTO points_records (user_id, points, type, description, created_at) 
         VALUES (?, ?, 'spend', ?, NOW())`,
        [userId, points, description || `消费 ${points} 积分`]
      );
      
      // 提交事务
      await db.execute('COMMIT');
      
      // 获取更新后的用户积分
      const [updatedUserResult] = await db.execute(
        'SELECT points FROM users WHERE id = ?',
        [userId]
      );
      
      res.json({
        success: true,
        message: '积分消费成功',
        data: {
          points: updatedUserResult[0].points,
          spent_points: points
        }
      });
    } catch (error) {
      // 回滚事务
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('积分消费失败:', error);
    res.status(500).json({
      success: false,
      message: '积分消费失败，请稍后重试'
    });
  }
});

module.exports = router;