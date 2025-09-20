const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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

async function updateDavidPassword() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 为David用户设置已知密码
    const password = 'david123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 更新David用户的密码
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE username = ?',
      [passwordHash, 'David']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ David用户密码更新成功:');
      console.log('  - 用户名: David');
      console.log('  - 新密码: david123');
      console.log('  - 邮箱: 779695947@qq.com');
    } else {
      console.log('❌ 未找到David用户');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ 更新密码失败:', error.message);
  }
}

updateDavidPassword();