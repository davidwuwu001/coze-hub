/**
 * 检查avatar字段的数据库脚本
 */
const mysql = require('mysql2/promise');

const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub'
};

async function checkAvatarField() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查avatar字段结构
    const [columns] = await connection.execute("SHOW COLUMNS FROM users LIKE 'avatar'");
    console.log('Avatar字段信息:', columns);
    
    // 查看示例数据
    const [sampleData] = await connection.execute('SELECT id, username, avatar FROM users LIMIT 5');
    console.log('示例数据:', sampleData);
    
    // 检查avatar字段的数据类型和约束
    const [tableInfo] = await connection.execute('DESCRIBE users');
    const avatarField = tableInfo.find(field => field.Field === 'avatar');
    console.log('Avatar字段详细信息:', avatarField);
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

checkAvatarField();