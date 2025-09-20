import { NextApiRequest, NextApiResponse } from 'next';
import { createConnection } from '../../../src/utils/db';
import { FeatureCardData } from '../../../src/types';

/**
 * 创建新卡片API接口
 * POST /api/cards/create - 创建新的功能卡片
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, desc, iconName, bgColor, order, enabled, workflowId, apiKey, workflowEnabled } = req.body;

    // 验证必填字段
    if (!name || !desc || !iconName) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const connection = await createConnection();
    
    // 插入新卡片
    const [result] = await connection.execute(
      `INSERT INTO feature_cards (name, description, icon, background_color, sort_order, enabled, workflow_id, api_key, workflow_enabled, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, desc, iconName, bgColor || 'bg-blue-500', order || 0, enabled !== false, workflowId || '', apiKey || '', workflowEnabled || false]
    );

    await connection.end();

    const insertResult = result as any;
    const newCard: FeatureCardData = {
      id: insertResult.insertId.toString(),
      name,
      desc,
      iconName,
      bgColor: bgColor || 'bg-blue-500',
      order: order || 0,
      enabled: enabled !== false,
      workflowId: workflowId || '',
      apiKey: apiKey || '',
      workflowEnabled: workflowEnabled || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json(newCard);
  } catch (error) {
    console.error('创建卡片失败:', error);
    res.status(500).json({ error: '创建卡片失败' });
  }
}