const mysql = require('mysql2/promise');

/**
 * 数据库连接配置
 */
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

/**
 * 检查数据库连接和数据
 */
async function checkDatabase() {
  let connection;
  
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 测试连接
    await connection.ping();
    console.log('✅ 数据库ping测试成功');
    
    // 检查feature_cards表是否存在
    console.log('\n检查feature_cards表...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'feature_cards'"
    );
    
    if (tables.length === 0) {
      console.log('❌ feature_cards表不存在');
      return;
    }
    
    console.log('✅ feature_cards表存在');
    
    // 查询表结构
    console.log('\n表结构:');
    const [columns] = await connection.execute(
      "DESCRIBE feature_cards"
    );
    console.table(columns);
    
    // 查询数据总数
    const [countResult] = await connection.execute(
      "SELECT COUNT(*) as total FROM feature_cards"
    );
    const total = countResult[0].total;
    console.log(`\n数据总数: ${total}`);
    
    if (total === 0) {
      console.log('❌ feature_cards表为空，没有数据');
      return;
    }
    
    // 查询所有数据
    console.log('\n所有卡片数据:');
    const [cards] = await connection.execute(
      "SELECT id, name, description, icon, background_color, sort_order, enabled FROM feature_cards ORDER BY sort_order ASC"
    );
    console.table(cards);
    
    // 查询启用的卡片数量
    const [enabledResult] = await connection.execute(
      "SELECT COUNT(*) as enabled_count FROM feature_cards WHERE enabled = 1"
    );
    const enabledCount = enabledResult[0].enabled_count;
    console.log(`\n启用的卡片数量: ${enabledCount}`);
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 运行检查
checkDatabase();