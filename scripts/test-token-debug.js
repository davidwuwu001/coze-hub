const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

/**
 * 调试token验证问题
 */
async function debugTokenIssue() {
  console.log('=== 调试Token验证问题 ===');
  
  try {
    // 1. 测试登录并获取详细的token信息
    console.log('\n1. 测试登录并分析token...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'David',
        password: '123456'
      })
    });
    
    console.log(`登录响应状态: ${loginResponse.status}`);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('登录失败响应:', errorText);
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('登录响应:', JSON.stringify(loginResult, null, 2));
    
    const token = loginResult.data?.token;
    if (!token) {
      console.log('❌ 登录响应中没有token');
      return;
    }
    
    console.log('Token:', token);
    
    // 2. 解码token查看内容
    console.log('\n2. 解码token内容...');
    try {
      const decoded = jwt.decode(token, { complete: true });
      console.log('Token解码结果:', JSON.stringify(decoded, null, 2));
    } catch (decodeError) {
      console.log('Token解码失败:', decodeError.message);
    }
    
    // 3. 验证token（使用相同的密钥）
    console.log('\n3. 验证token...');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    console.log('使用的JWT_SECRET:', JWT_SECRET);
    
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      console.log('Token验证成功:', JSON.stringify(verified, null, 2));
    } catch (verifyError) {
      console.log('❌ Token验证失败:', verifyError.message);
    }
    
    // 4. 测试API调用，查看详细的错误信息
    console.log('\n4. 测试API调用...');
    const apiResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API响应状态: ${apiResponse.status}`);
    const apiResult = await apiResponse.text();
    console.log('API响应内容:', apiResult);
    
    // 5. 测试不同的Authorization头格式
    console.log('\n5. 测试不同的Authorization头格式...');
    
    // 测试直接使用token（不带Bearer前缀）
    const directTokenResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    console.log(`直接token响应状态: ${directTokenResponse.status}`);
    
    // 测试Bearer格式但有额外空格
    const spaceTokenResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'GET',
      headers: {
        'Authorization': ` Bearer ${token} `,
        'Content-Type': 'application/json'
      }
    });
    console.log(`带空格Bearer响应状态: ${spaceTokenResponse.status}`);
    
    console.log('\n=== 调试完成 ===');
    
  } catch (error) {
    console.error('调试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行调试
debugTokenIssue();