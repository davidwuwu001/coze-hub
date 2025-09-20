-- 添加用户头像字段
-- 迁移文件：005_add_avatar_column.sql
-- 创建时间：2024-01-20

-- 为users表添加avatar字段
ALTER TABLE users 
ADD COLUMN avatar VARCHAR(500) NULL COMMENT '用户头像URL' 
AFTER phone;

-- 添加索引以提高查询性能（可选）
-- CREATE INDEX idx_users_avatar ON users(avatar);