import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { verifyToken } from '../../../src/utils/auth';
import { PointsRecord, ApiResponse } from '../../../src/types/auth';

/**
 * 获取积分记录API接口
 * GET /api/profile/points-records
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PointsRecord[]>>
) {
  if (req.method !== 'GET') {
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // 获取积分记录
    const records = await executeQuery(
      `SELECT id, user_id, points, type, description, created_at 
       FROM points_records 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit ?? 20, offset ?? 0]
    );
    
    // 获取总记录数
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM points_records WHERE user_id = ?',
      [userId]
    );
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    const pointsRecords: PointsRecord[] = records.map(record => ({
      id: record.id,
      user_id: record.user_id,
      points: record.points,
      type: record.type,
      description: record.description,
      created_at: record.created_at
    }));
    
    return res.status(200).json({
      success: true,
      data: pointsRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('获取积分记录失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}