-- 创建输入配置表
CREATE TABLE IF NOT EXISTS input_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_type ENUM('text', 'textarea', 'url', 'number', 'select', 'file') NOT NULL DEFAULT 'text',
  field_label VARCHAR(200) NOT NULL,
  field_placeholder VARCHAR(500),
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  field_options JSON,
  field_order INT NOT NULL DEFAULT 0,
  validation_rules JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 外键约束
  FOREIGN KEY (card_id) REFERENCES feature_cards(id) ON DELETE CASCADE,
  
  -- 索引
  INDEX idx_card_id (card_id),
  INDEX idx_field_order (card_id, field_order),
  
  -- 唯一约束
  UNIQUE KEY uk_card_field (card_id, field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='卡片输入配置表';

-- 插入示例数据
INSERT INTO input_configs (card_id, field_name, field_type, field_label, field_placeholder, is_required, field_options, field_order) VALUES
-- 假设卡片ID为1的配置
(1, 'prompt', 'textarea', '输入提示词', '请输入您的提示词...', TRUE, NULL, 1),
(1, 'style', 'select', '生成风格', '请选择生成风格', FALSE, '["写实", "卡通", "抽象", "水彩"]', 2),
(1, 'size', 'select', '图片尺寸', '请选择图片尺寸', FALSE, '["1024x1024", "1024x1792", "1792x1024"]', 3),

-- 假设卡片ID为2的配置
(2, 'content', 'textarea', '文章内容', '请输入需要总结的文章内容...', TRUE, NULL, 1),
(2, 'length', 'select', '总结长度', '请选择总结长度', FALSE, '["简短", "中等", "详细"]', 2),
(2, 'language', 'select', '输出语言', '请选择输出语言', FALSE, '["中文", "英文", "日文"]', 3),

-- 假设卡片ID为3的配置
(3, 'url', 'url', '网页链接', '请输入要分析的网页链接', TRUE, NULL, 1),
(3, 'analysis_type', 'select', '分析类型', '请选择分析类型', FALSE, '["内容摘要", "关键词提取", "情感分析", "结构分析"]', 2);

-- 更新feature_cards表，添加workflow_id字段（如果不存在）
ALTER TABLE feature_cards 
ADD COLUMN IF NOT EXISTS workflow_id VARCHAR(100) COMMENT 'Coze工作流ID';

-- 更新示例数据的workflow_id
UPDATE feature_cards SET workflow_id = 'workflow_001' WHERE id = 1;
UPDATE feature_cards SET workflow_id = 'workflow_002' WHERE id = 2;
UPDATE feature_cards SET workflow_id = 'workflow_003' WHERE id = 3;