const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function checkUsers() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 检查users表是否存在
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    console.log('Users表存在:', tables.length > 0);
    
    if (tables.length > 0) {
      // 检查users表结构
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('\nUsers表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // 检查用户数据
      const [users] = await connection.execute('SELECT id, username, email, is_active FROM users LIMIT 5');
      console.log('\n用户数据:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 状态: ${user.is_active ? '激活' : '禁用'}`);
      });
    } else {
      console.log('❌ users表不存在');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkUsers();