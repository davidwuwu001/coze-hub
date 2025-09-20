import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../src/utils/db';
import { verifyToken, extractTokenFromHeader } from '../../../src/utils/auth';
import {
  FileText,
  Video,
  BookOpen,
  Search,
  Image,
  Mic,
  Volume2,
  TrendingUp,
  FileEdit,
  Users,
  BarChart3,
  Target
} from 'lucide-react';

/**
 * 图标映射表
 * 将数据库中的图标名称映射到实际的Lucide图标组件
 */
const iconMap: Record<string, any> = {
  FileText,
  Video,
  BookOpen,
  Search,
  Image,
  Mic,
  Volume2,
  TrendingUp,
  FileEdit,
  Users,
  BarChart3,
  Target
};

/**
 * 卡片数据响应接口
 */
interface CardResponse {
  success: boolean;
  data?: any[];
  message?: string;
  error?: string;
}

/**
 * 获取功能卡片数据API接口
 * GET /api/cards - 获取卡片数据，按order_index排序
 * 查询参数：
 * - admin: 'true' 时返回所有卡片（包括禁用的），否则只返回启用的卡片
 * 需要用户认证
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CardResponse>
) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: '方法不被允许'
    });
  }

  // 验证用户认证
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  try {
    // 验证令牌有效性
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }

  } catch (authError) {
    return res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }

  try {
    const { admin } = req.query;
    const isAdminMode = admin === 'true';
    
    // 根据管理员模式决定查询条件
    const whereClause = isAdminMode ? '' : 'WHERE enabled = 1';
    const cards = await executeQuery(
      `SELECT id, name, description, icon_name, bg_color, order_index, enabled, created_at, updated_at 
       FROM feature_cards 
       ${whereClause} 
       ORDER BY order_index ASC, id ASC`
    );

    // 转换数据格式，添加图标组件
    const formattedCards = cards.map((card: any) => ({
      id: card.id.toString(),
      name: card.name,
      desc: card.description,
      icon: iconMap[card.icon_name] || FileText, // 默认使用FileText图标
      iconName: card.icon_name,
      bgColor: card.bg_color,
      order: card.order_index,
      enabled: card.enabled,
      createdAt: card.created_at?.toISOString(),
      updatedAt: card.updated_at?.toISOString()
    }));

    return res.status(200).json({
      success: true,
      data: formattedCards,
      message: '获取卡片数据成功'
    });

  } catch (error) {
    console.error('获取卡片数据失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}