import { NextApiRequest, NextApiResponse } from 'next';
import { createConnection } from '../../../src/utils/db';

/**
 * 批量更新卡片顺序API接口
 * PUT /api/cards/reorder - 批量更新卡片的排序顺序
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards } = req.body;

    // 验证数据格式
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: '无效的卡片数据' });
    }

    const connection = await createConnection();
    
    // 开始事务
    await connection.beginTransaction();

    try {
      // 批量更新卡片顺序
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        await connection.execute(
          'UPDATE feature_cards SET order_index = ?, updated_at = NOW() WHERE id = ?',
          [i, card.id]
        );
      }

      // 提交事务
      await connection.commit();
      await connection.end();

      res.status(200).json({ message: '卡片顺序更新成功' });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      await connection.end();
      throw error;
    }
  } catch (error) {
    console.error('更新卡片顺序失败:', error);
    res.status(500).json({ error: '更新卡片顺序失败' });
  }
}