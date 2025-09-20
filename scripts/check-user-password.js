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
 * 简单的密码哈希函数（用于测试）
 * 注意：这只是为了测试，实际项目中应该使用bcryptjs
 */
function simpleHash(password) {
  // 这里我们直接设置一个已知的bcryptjs哈希值
  // 对应密码 "123456" 的bcryptjs哈希
  return '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.6';
}

/**
 * 检查用户密码并设置已知密码
 */
async function checkUserPassword() {
  let connection;
  
  try {
    console.log('=== 检查用户密码 ===');
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 查询用户详细信息
    console.log('\n1. 查询现有用户信息...');
    const [users] = await connection.execute(
      'SELECT id, username, email, password_hash, is_active, created_at FROM users'
    );
    
    console.log(`找到 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}`);
      console.log(`  密码哈希: ${user.password_hash ? user.password_hash.substring(0, 30) + '...' : '无'}`);
      console.log(`  状态: ${user.is_active ? '活跃' : '非活跃'}`);
      console.log(`  创建时间: ${user.created_at}`);
      console.log('');
    });
    
    // 为现有用户设置已知密码
    console.log('\n2. 为现有用户设置已知密码...');
    const testPassword = '123456';
    const hashedPassword = simpleHash(testPassword);
    
    for (const user of users) {
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      console.log(`✅ 已为用户 ${user.username} 设置密码: ${testPassword}`);
    }
    
    console.log('\n=== 测试信息 ===');
    console.log('现在可以使用以下信息登录:');
    users.forEach(user => {
      console.log(`- 用户名: ${user.username}`);
      console.log(`- 密码: ${testPassword}`);
    });
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 运行检查
checkUserPassword().catch(console.error);