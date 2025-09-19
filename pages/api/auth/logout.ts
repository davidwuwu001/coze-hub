import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../src/types/auth';

/**
 * 用户登出API接口
 * POST /api/auth/logout
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不被允许'
    });
  }

  try {
    // 清除Cookie
    res.setHeader('Set-Cookie', [
      'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
      'user=; Path=/; Max-Age=0; SameSite=Strict'
    ]);

    return res.status(200).json({
      success: true,
      message: '登出成功'
    });

  } catch (error) {
    console.error('登出失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}