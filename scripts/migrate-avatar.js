/**
 * 用户头像字段迁移脚本
 * 为users表添加avatar字段
 */
const mysql = require('mysql2/promise');

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
 * 执行avatar字段迁移
 */
async function runAvatarMigration() {
  let connection;
  
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查avatar字段是否已存在
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'avatar'"
    );
    
    if (columns.length > 0) {
      console.log('avatar字段已存在，跳过迁移');
      return;
    }
    
    // 添加avatar字段
    const sql = `ALTER TABLE users 
                 ADD COLUMN avatar VARCHAR(500) NULL COMMENT '用户头像URL' 
                 AFTER phone`;
    
    console.log('执行SQL:');
    console.log(sql);
    
    await connection.execute(sql);
    console.log('avatar字段添加成功！');
    
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
runAvatarMigration();