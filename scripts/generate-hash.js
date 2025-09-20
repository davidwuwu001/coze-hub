const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub'
};

/**
 * 生成正确的密码哈希并更新数据库
 */
async function generateAndUpdatePassword() {
  let connection;
  
  try {
    console.log('=== 生成正确的密码哈希 ===');
    
    // 生成密码哈希
    const testPassword = '123456';
    console.log(`正在为密码 "${testPassword}" 生成哈希...`);
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    console.log(`✅ 生成的哈希: ${hashedPassword}`);
    
    // 验证哈希是否正确
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`✅ 哈希验证: ${isValid ? '正确' : '错误'}`);
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 查询现有用户
    const [users] = await connection.execute(
      'SELECT id, username FROM users WHERE is_active = TRUE'
    );
    
    console.log(`\n找到 ${users.length} 个活跃用户`);
    
    // 更新所有用户的密码
    for (const user of users) {
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      console.log(`✅ 已为用户 ${user.username} 更新密码哈希`);
    }
    
    console.log('\n=== 更新完成 ===');
    console.log('现在可以使用以下信息登录:');
    users.forEach(user => {
      console.log(`- 用户名: ${user.username}`);
      console.log(`- 密码: ${testPassword}`);
    });
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 运行脚本
generateAndUpdatePassword().catch(console.error);