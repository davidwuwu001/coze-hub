/**
 * 数据库迁移脚本：更新feature_cards表结构
 * 1. 移除workflow_enabled字段（工作流默认启用）
 * 2. 将api_key字段重命名为api_token
 * 3. 删除原有的api_token字段
 */

const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub'
};

/**
 * 执行数据库迁移
 */
async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 开始数据库迁移...');
    
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'feature_cards'"
    );
    
    if (tables.length === 0) {
      console.log('❌ feature_cards表不存在，请先创建基础表结构');
      return;
    }
    
    console.log('📋 检查当前表结构...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM feature_cards"
    );
    
    const columnNames = columns.map(col => col.Field);
    console.log('当前字段:', columnNames);
    
    // 开始事务
    await connection.beginTransaction();
    
    // 1. 删除workflow_enabled字段（如果存在）
    if (columnNames.includes('workflow_enabled')) {
      console.log('🗑️ 删除workflow_enabled字段...');
      await connection.execute(
        'ALTER TABLE feature_cards DROP COLUMN workflow_enabled'
      );
      console.log('✅ workflow_enabled字段已删除');
    } else {
      console.log('ℹ️ workflow_enabled字段不存在，跳过删除');
    }
    
    // 2. 删除原有的api_token字段（如果存在）
    if (columnNames.includes('api_token')) {
      console.log('🗑️ 删除原有的api_token字段...');
      await connection.execute(
        'ALTER TABLE feature_cards DROP COLUMN api_token'
      );
      console.log('✅ 原有api_token字段已删除');
    } else {
      console.log('ℹ️ 原有api_token字段不存在，跳过删除');
    }
    
    // 3. 将api_key字段重命名为api_token（如果api_key存在）
    if (columnNames.includes('api_key')) {
      console.log('🔄 将api_key字段重命名为api_token...');
      await connection.execute(
        'ALTER TABLE feature_cards CHANGE COLUMN api_key api_token VARCHAR(500)'
      );
      console.log('✅ api_key字段已重命名为api_token');
    } else {
      console.log('ℹ️ api_key字段不存在，跳过重命名');
    }
    
    // 提交事务
    await connection.commit();
    
    console.log('📋 检查更新后的表结构...');
    const [newColumns] = await connection.execute(
      "SHOW COLUMNS FROM feature_cards"
    );
    
    console.log('\n📊 更新后的表结构:');
    newColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });
    
    console.log('\n🎉 数据库迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 事务已回滚');
      } catch (rollbackError) {
        console.error('❌ 回滚失败:', rollbackError.message);
      }
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行迁移
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };