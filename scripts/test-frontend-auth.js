/**
 * 测试前端认证流程
 * 检查用户登录状态和token有效性
 */

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * 验证JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token验证失败: ' + error.message);
  }
}

async function testFrontendAuth() {
  console.log('=== 测试前端认证流程 ===\n');

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
      console.log('❌ 数据库中没有用户，请先注册一个用户');
      return;
    }

    // 2. 测试登录API
    console.log('2. 测试登录API...');
    const testUser = users[0];
    console.log(`尝试使用用户: ${testUser.username}`);
    
    // 这里需要知道用户的密码，通常测试用户的密码是已知的
    const loginData = {
      identifier: testUser.username,
      password: '123456' // 假设测试密码
    };

    try {
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      console.log('登录API响应状态:', loginResponse.status);
      const loginResult = await loginResponse.json();
      console.log('登录API响应:', loginResult);

      if (loginResult.success && loginResult.data.token) {
        const token = loginResult.data.token;
        console.log('✅ 登录成功，获取到token');
        console.log('Token前20字符:', token.substring(0, 20) + '...');

        // 3. 验证token
        console.log('\n3. 验证token...');
        try {
          const decoded = verifyToken(token);
          console.log('✅ Token验证成功');
          console.log('Token内容:', decoded);

          // 4. 测试cards API
          console.log('\n4. 测试cards API...');
          const cardsResponse = await fetch('http://localhost:3000/api/cards', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Cards API响应状态:', cardsResponse.status);
          const cardsResult = await cardsResponse.json();
          console.log('Cards API响应:', cardsResult);

          if (cardsResult.success) {
            console.log('✅ Cards API调用成功');
            console.log(`返回 ${cardsResult.data.length} 张卡片`);
          } else {
            console.log('❌ Cards API调用失败:', cardsResult.message);
          }

        } catch (tokenError) {
          console.log('❌ Token验证失败:', tokenError.message);
        }

      } else {
        console.log('❌ 登录失败:', loginResult.message);
        console.log('提示: 请确保测试用户的密码是 "123456"');
      }

    } catch (apiError) {
      console.log('❌ 登录API调用失败:', apiError.message);
    }

  } catch (error) {
    console.error('测试过程中出错:', error);
  }

  console.log('\n=== 测试完成 ===');
  process.exit(0);
}

testFrontendAuth();