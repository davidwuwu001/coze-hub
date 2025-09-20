import { NextApiRequest, NextApiResponse } from 'next';
import { createConnection } from '../../../src/utils/db';
import { FeatureCardData } from '../../../src/types';

/**
 * 更新卡片API接口
 * PUT /api/cards/update - 更新指定的功能卡片
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, desc, iconName, bgColor, order, enabled, workflowId, workflowParams, workflowEnabled } = req.body;

    // 验证必填字段
    if (!id || !name || !desc || !iconName) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    // 验证工作流参数格式
    if (workflowParams && typeof workflowParams !== 'object') {
      return res.status(400).json({ error: '工作流参数必须是有效的JSON对象' });
    }

    const connection = await createConnection();
    
    // 更新卡片（包含工作流字段）
    const [result] = await connection.execute(
      `UPDATE feature_cards 
       SET name = ?, description = ?, icon = ?, background_color = ?, sort_order = ?, enabled = ?, 
           workflow_id = ?, workflow_params = ?, workflow_enabled = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, desc, iconName, bgColor, order, enabled, workflowId || null, 
       workflowParams ? JSON.stringify(workflowParams) : null, workflowEnabled || 0, id]
    );

    await connection.end();

    const updateResult = result as any;
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: '卡片不存在' });
    }

    const updatedCard: FeatureCardData = {
      id: id.toString(),
      name,
      desc,
      iconName,
      bgColor,
      order,
      enabled,
      workflowId,
      workflowParams,
      workflowEnabled,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json(updatedCard);
  } catch (error) {
    console.error('更新卡片失败:', error);
    res.status(500).json({ error: '更新卡片失败' });
  }
}