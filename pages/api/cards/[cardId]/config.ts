import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../../../src/utils/db';
import { verifyToken, extractTokenFromHeader } from '../../../../src/utils/auth';

/**
 * 卡片配置响应接口
 */
interface CardConfigResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description: string;
    workflow_id?: string;
    input_configs: Array<{
      id: string;
      name: string;
      type: 'text' | 'textarea' | 'url' | 'number' | 'select' | 'file';
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
      };
    }>;
  };
  message?: string;
  error?: string;
}

/**
 * 获取卡片配置API接口
 * GET /api/cards/[cardId]/config - 获取指定卡片的配置信息
 * 包括卡片基本信息和输入配置
 * 需要用户认证
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CardConfigResponse>
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
    const { cardId } = req.query;
    
    if (!cardId || typeof cardId !== 'string') {
      return res.status(400).json({
        success: false,
        message: '无效的卡片ID'
      });
    }

    // 查询卡片基本信息
    const cardQuery = `
      SELECT id, title, description, icon, workflow_id
      FROM feature_cards 
      WHERE id = ? AND status = 'active'
    `;
    
    const [cardRows] = await connection.execute(cardQuery, [cardId]);
    const cards = cardRows as any[];
    
    if (cards.length === 0) {
      return res.status(404).json({ error: '卡片不存在' });
    }
    
    const card = cards[0];
    
    // 查询输入配置
    let inputConfig;
    try {
      const configQuery = `
        SELECT field_name, field_type, field_label, field_placeholder, 
               is_required, field_options, field_order, validation_rules
        FROM input_configs 
        WHERE card_id = ? 
        ORDER BY field_order ASC
      `;
      
      const [configRows] = await connection.execute(configQuery, [cardId]);
      const configs = configRows as any[];
      
      if (configs.length > 0) {
        // 从数据库读取配置
        inputConfig = {
          fields: configs.map(config => ({
            name: config.field_name,
            type: config.field_type,
            label: config.field_label,
            placeholder: config.field_placeholder,
            required: config.is_required,
            options: config.field_options ? JSON.parse(config.field_options) : undefined,
            validation: config.validation_rules ? JSON.parse(config.validation_rules) : undefined
          }))
        };
      } else {
        // 如果数据库中没有配置，使用默认配置
        inputConfig = {
          fields: [
            {
              name: 'prompt',
              type: 'textarea',
              label: '输入提示词',
              placeholder: '请输入您的提示词...',
              required: true,
              validation: {
                minLength: 1,
                maxLength: 1000
              }
            },
            {
              name: 'style',
              type: 'select',
              label: '生成风格',
              placeholder: '请选择生成风格',
              required: false,
              options: ['写实', '卡通', '抽象', '水彩']
            }
          ]
        };
      }
    } catch (configError) {
      console.error('查询输入配置失败:', configError);
      // 使用默认配置作为fallback
      inputConfig = {
        fields: [
          {
            name: 'prompt',
            type: 'textarea',
            label: '输入提示词',
            placeholder: '请输入您的提示词...',
            required: true
          }
        ]
      };
    }

    let inputConfigs = inputConfig.fields.map((field: any, index: number) => ({
      id: (index + 1).toString(),
      name: field.name,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      options: field.options,
      validation: field.validation
    }));

    const responseData = {
      id: card.id.toString(),
      name: card.title,
      description: card.description,
      workflow_id: card.workflow_id,
      input_configs: inputConfigs
    };

    return res.status(200).json({
      success: true,
      data: responseData,
      message: '获取卡片配置成功'
    });

  } catch (error) {
    console.error('获取卡片配置失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}