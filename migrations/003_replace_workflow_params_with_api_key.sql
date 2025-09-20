-- 将workflow_params字段替换为api_key字段
-- 用于存储API密钥而不是工作流参数

-- 删除原有的workflow_params字段
ALTER TABLE feature_cards DROP COLUMN workflow_params;

-- 添加新的api_key字段
ALTER TABLE feature_cards 
ADD COLUMN api_key VARCHAR(255) DEFAULT '' COMMENT 'API密钥';

-- 添加api_key字段的索引
ALTER TABLE feature_cards ADD INDEX idx_api_key (api_key);