/**
 * 数据库迁移脚本
 * 用于执行SQL迁移文件
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub',
  multipleStatements: true
};

/**
 * 执行迁移文件
 */
async function runMigration() {
  let connection;
  
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 执行迁移SQL语句
    const sqls = [
      `ALTER TABLE feature_cards 
       ADD COLUMN workflow_id VARCHAR(100) DEFAULT '' COMMENT '工作流ID',
       ADD COLUMN workflow_params JSON DEFAULT NULL COMMENT '工作流参数配置(JSON格式)',
       ADD COLUMN workflow_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否启用工作流(1:启用, 0:禁用)'`,
      
      `ALTER TABLE feature_cards ADD INDEX idx_workflow_enabled (workflow_enabled)`,
      
      `ALTER TABLE feature_cards ADD INDEX idx_workflow_id (workflow_id)`
    ];
    
    for (let i = 0; i < sqls.length; i++) {
      console.log(`执行SQL ${i + 1}:`);
      console.log(sqls[i]);
      
      try {
        await connection.execute(sqls[i]);
        console.log(`SQL ${i + 1} 执行成功`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log(`SQL ${i + 1} 跳过 (字段或索引已存在): ${error.message}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('迁移执行成功！工作流字段已添加到feature_cards表');
    
  } catch (error) {
    console.error('迁移执行失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行迁移
runMigration();