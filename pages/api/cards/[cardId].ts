import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

/**
 * 获取指定卡片的详细信息API
 * 包括workflow_id和api_token等信息
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const { cardId } = req.query;

  if (!cardId || typeof cardId !== 'string') {
    return res.status(400).json({ error: '无效的卡片ID' });
  }

  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: '124.223.62.233',
      port: 3306,
      user: 'coze-hub',
      password: '7788Gg7788',
      database: 'coze-hub'
    });

    // 查询指定卡片的详细信息
    const [rows] = await connection.execute(
      'SELECT id, name, description, icon, background_color, workflow_id, api_token FROM feature_cards WHERE id = ? AND enabled = 1',
      [cardId]
    );

    await connection.end();

    const cards = rows as any[];
    
    if (cards.length === 0) {
      return res.status(404).json({ error: '卡片不存在或已禁用' });
    }

    const card = cards[0];

    // 检查必要的工作流信息
    if (!card.workflow_id || !card.api_token) {
      return res.status(400).json({ 
        error: '卡片工作流配置不完整',
        details: {
          hasWorkflowId: !!card.workflow_id,
          hasApiToken: !!card.api_token
        }
      });
    }

    // 返回卡片信息
    res.status(200).json({
      success: true,
      data: {
        id: card.id,
        title: card.name,
        description: card.description,
        icon: card.icon,
        backgroundColor: card.background_color,
        workflowId: card.workflow_id,
        apiToken: card.api_token
      }
    });

  } catch (error) {
    console.error('获取卡片信息失败:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}