const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * 执行数据库迁移：将workflow_params字段替换为api_key字段
 */
async function migrateApiKey() {
  let connection;
  
  try {
    // 数据库连接配置
    const dbConfig = {
      host: '124.223.62.233',
      port: 3306,
      user: 'coze-hub',
      password: '7788Gg7788',
      database: 'coze-hub'
    };
    
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../migrations/003_replace_workflow_params_with_api_key.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 读取迁移文件:', migrationPath);
    console.log('📝 迁移SQL:', migrationSQL);
    
    // 分割SQL语句（按分号分割，排除注释）
    const sqlStatements = migrationSQL
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--'))
      .join(' ')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt);
    
    console.log('🔄 开始执行迁移...');
    
    // 逐条执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      if (sql) {
        console.log(`执行SQL ${i + 1}:`, sql);
        await connection.execute(sql);
        console.log(`✅ SQL ${i + 1} 执行成功`);
      }
    }
    
    console.log('🎉 数据库迁移完成！');
    
    // 验证迁移结果
    console.log('\n🔍 验证迁移结果...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'coze-hub' AND TABLE_NAME = 'feature_cards' AND COLUMN_NAME IN ('workflow_params', 'api_key')"
    );
    
    console.log('📋 相关字段信息:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.COLUMN_COMMENT})`);
    });
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行迁移
migrateApiKey();