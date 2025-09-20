-- 添加工作流相关字段到feature_cards表
-- 用于支持卡片与工作流的关联配置

ALTER TABLE feature_cards 
ADD COLUMN workflow_id VARCHAR(100) DEFAULT '' COMMENT '工作流ID',
ADD COLUMN workflow_params JSON DEFAULT NULL COMMENT '工作流参数配置(JSON格式)',
ADD COLUMN workflow_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否启用工作流(1:启用, 0:禁用)';

-- 添加工作流相关索引
ALTER TABLE feature_cards ADD INDEX idx_workflow_enabled (workflow_enabled);
ALTER TABLE feature_cards ADD INDEX idx_workflow_id (workflow_id);