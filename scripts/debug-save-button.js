/**
 * 调试保存按钮问题的脚本
 * 检查数据库中卡片数据的格式
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

async function debugSaveButton() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 先查看表结构
    console.log('\n=== 查看表结构 ===');
    const [columns] = await connection.execute('DESCRIBE feature_cards');
    console.log('表字段:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    // 查询所有卡片数据
    const [rows] = await connection.execute(
      'SELECT * FROM feature_cards ORDER BY sort_order'
    );
    
    console.log('\n=== 数据库中的卡片数据 ===');
    rows.forEach((card, index) => {
      console.log(`\n卡片 ${index + 1}:`);
      console.log('  完整数据:', card);
      
      // 检查常见字段
      if (card.name !== undefined) {
        console.log('  名称:', card.name, '(类型:', typeof card.name, ')');
        console.log('  name为空?', !card.name);
      }
      
      if (card.description !== undefined) {
        console.log('  描述:', card.description, '(类型:', typeof card.description, ')');
        console.log('  description为空?', !card.description);
      }
      
      if (card.desc !== undefined) {
        console.log('  描述(desc):', card.desc, '(类型:', typeof card.desc, ')');
        console.log('  desc为空?', !card.desc);
      }
      
      // 检查保存按钮禁用条件
      const nameField = card.name || card.title;
      const descField = card.description || card.desc;
      console.log('  保存按钮应该禁用?', !nameField || !descField);
    });
    
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 运行调试
debugSaveButton().catch(console.error);