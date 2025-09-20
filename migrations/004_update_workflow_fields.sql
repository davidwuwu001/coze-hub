-- 更新工作流字段结构
-- 1. 移除workflow_enabled字段（工作流默认启用）
-- 2. 将api_key字段重命名为api_token
-- 3. 删除原有的api_token字段（如果存在）

-- 删除workflow_enabled字段及其索引
ALTER TABLE feature_cards DROP INDEX idx_workflow_enabled;
ALTER TABLE feature_cards DROP COLUMN workflow_enabled;

-- 删除原有的api_token字段（如果存在）
ALTER TABLE feature_cards DROP COLUMN IF EXISTS api_token;

-- 将api_key字段重命名为api_token
ALTER TABLE feature_cards CHANGE COLUMN api_key api_token VARCHAR(255) DEFAULT '' COMMENT 'API令牌';

-- 更新api_key索引名称为api_token
ALTER TABLE feature_cards DROP INDEX idx_api_key;
ALTER TABLE feature_cards ADD INDEX idx_api_token (api_token);