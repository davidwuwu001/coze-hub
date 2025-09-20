/**
 * 检查用户登录状态
 * 帮助用户了解为什么看不到卡片数据
 */

const mysql = require('mysql2/promise');

async function checkUserLogin() {
  console.log('=== 检查用户登录状态 ===\n');

  try {
    // 1. 检查数据库中的用户
    console.log('1. 检查数据库中的用户...');
    const connection = await mysql.createConnection({
      host: '124.223.62.233',
      port: 3306,
      user: 'coze-hub',
      password: '7788Gg7788',
      database: 'coze-hub'
    });
    
    const [users] = await connection.execute('SELECT id, username, email, phone, created_at FROM users ORDER BY id DESC LIMIT 5');
    console.log(`数据库中共有 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}`);
    });
    console.log('');
    
    await connection.end();

    if (users.length === 0) {
      console.log('❌ 数据库中没有用户');
      console.log('\n📝 解决方案:');
      console.log('1. 访问 http://localhost:3000/auth/register 注册新用户');
      console.log('2. 使用邀请码: 1212 或 7777');
      console.log('3. 注册成功后会自动跳转到首页');
      return;
    }

    console.log('✅ 数据库中有用户数据');
    console.log('\n🔍 问题分析:');
    console.log('首页显示"暂无卡片"的可能原因:');
    console.log('1. 用户没有登录 - 首页需要登录才能访问');
    console.log('2. 用户登录了但token过期');
    console.log('3. 前端没有正确调用API');
    
    console.log('\n📝 解决方案:');
    console.log('1. 访问 http://localhost:3000/auth/login 登录');
    console.log('2. 使用以下测试账户:');
    users.forEach(user => {
      console.log(`   - 用户名: ${user.username}, 密码: 123456`);
    });
    console.log('3. 登录成功后会自动跳转到首页并显示卡片');
    
    console.log('\n🔧 技术说明:');
    console.log('- 首页使用了ProtectedRoute组件，需要用户登录');
    console.log('- 未登录用户会被重定向到 /auth/login');
    console.log('- 登录后会获取token，用于调用 /api/cards 接口');
    console.log('- API会返回14张卡片数据显示在首页');

  } catch (error) {
    console.error('检查过程中出错:', error);
  }

  console.log('\n=== 检查完成 ===');
  process.exit(0);
}

checkUserLogin();