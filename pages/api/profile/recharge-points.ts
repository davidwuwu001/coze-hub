import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { verifyToken } from '../../../src/utils/auth';
import { RechargePointsData, ApiResponse } from '../../../src/types/auth';

/**
 * 积分充值API接口
 * POST /api/profile/recharge-points
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
    const { amount, paymentMethod }: RechargePointsData = req.body;
    
    // 验证充值金额
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '充值金额必须大于0'
      });
    }
    
    if (amount > 10000) {
      return res.status(400).json({
        success: false,
        message: '单次充值金额不能超过10000积分'
      });
    }
    
    // 验证支付方式
    const validPaymentMethods = ['alipay', 'wechat', 'bank_card'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: '无效的支付方式'
      });
    }
    
    // 开始数据库事务
    await executeQuery('START TRANSACTION');
    
    try {
      // 更新用户积分
      await executeQuery(
        'UPDATE users SET points = points + ?, updated_at = NOW() WHERE id = ?',
        [amount, userId]
      );
      
      // 记录积分变动
      await executeQuery(
        `INSERT INTO points_records (user_id, points, type, description, created_at) 
         VALUES (?, ?, 'recharge', ?, NOW())`,
        [userId, amount, `通过${paymentMethod}充值${amount}积分`]
      );
      
      // 提交事务
      await executeQuery('COMMIT');
      
      // 获取用户当前积分
      const userResult = await executeQuery(
        'SELECT points FROM users WHERE id = ?',
        [userId]
      );
      
      const currentPoints = userResult[0]?.points || 0;
      
      return res.status(200).json({
        success: true,
        message: '积分充值成功',
        data: {
          rechargedAmount: amount,
          currentPoints: currentPoints
        }
      });
      
    } catch (transactionError) {
      // 回滚事务
      await executeQuery('ROLLBACK');
      throw transactionError;
    }
    
  } catch (error) {
    console.error('积分充值失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}