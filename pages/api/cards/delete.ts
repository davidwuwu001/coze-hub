import { NextApiRequest, NextApiResponse } from 'next';
import { createConnection } from '../../../src/utils/db';

/**
 * 删除卡片API接口
 * DELETE /api/cards/delete - 删除指定的功能卡片
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body;

    // 验证必填字段
    if (!id) {
      return res.status(400).json({ error: '缺少卡片ID' });
    }

    const connection = await createConnection();
    
    // 删除卡片
    const [result] = await connection.execute(
      'DELETE FROM feature_cards WHERE id = ?',
      [id]
    );

    await connection.end();

    const deleteResult = result as any;
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ error: '卡片不存在' });
    }

    res.status(200).json({ message: '卡片删除成功', id });
  } catch (error) {
    console.error('删除卡片失败:', error);
    res.status(500).json({ error: '删除卡片失败' });
  }
}