-- 创建feature_cards表
-- 用于存储功能卡片的基本信息

CREATE TABLE IF NOT EXISTS feature_cards (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  name VARCHAR(100) NOT NULL COMMENT '卡片名称',
  description TEXT COMMENT '卡片描述',
  icon_name VARCHAR(50) NOT NULL COMMENT '图标名称(对应Lucide图标)',
  bg_color VARCHAR(20) NOT NULL DEFAULT '#3B82F6' COMMENT '背景颜色',
  order_index INT NOT NULL DEFAULT 0 COMMENT '排序索引',
  enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用(1:启用, 0:禁用)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_order_enabled (order_index, enabled),
  INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='功能卡片表';

-- 插入默认的12个卡片数据
INSERT INTO feature_cards (name, description, icon_name, bg_color, order_index, enabled) VALUES
('行业文案创作', 'AI智能创作', 'FileText', '#3B82F6', 1, 1),
('短视频标题', '爆款标题生成器', 'Video', '#F97316', 2, 1),
('小红书笔记', '社交文案助手', 'BookOpen', '#EF4444', 3, 1),
('朋友圈文案', '社交媒体文案', 'Search', '#10B981', 4, 1),
('文案配图', 'AI配图生成', 'Image', '#EC4899', 5, 1),
('完善音译', '声音创作系统', 'Mic', '#8B5CF6', 6, 1),
('配音', '智能配音服务', 'Volume2', '#F59E0B', 7, 1),
('热点监测文案', '实时热点监测', 'TrendingUp', '#06B6D4', 8, 1),
('公众号条创作', '公众号文案', 'Edit', '#EF4444', 9, 1),
('数字人制作', 'AI数字人', 'User', '#F97316', 10, 1),
('营销话IP分析', 'IP数据分析', 'BarChart3', '#10B981', 11, 1),
('关键词推荐', '智能关键词', 'Target', '#F59E0B', 12, 1);