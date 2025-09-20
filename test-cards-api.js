const http = require('http');
const jwt = require('jsonwebtoken');

/**
 * 生成测试用的JWT令牌
 */
function generateTestToken() {
  const payload = {
    userId: 1,
    username: 'testuser',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1小时后过期
  };
  
  // 使用项目中实际的JWT密钥
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.sign(payload, secret);
}

/**
 * 发送HTTP请求的辅助函数
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * 测试获取卡片列表API
 */
async function testGetCards() {
  console.log('\n=== 测试获取卡片列表 ===');
  
  try {
    const token = generateTestToken();
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/cards',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await makeRequest(options);
    console.log('状态码:', response.statusCode);
    console.log('响应数据:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ 获取卡片列表成功');
      return response.body.data;
    } else {
      console.log('❌ 获取卡片列表失败');
      return null;
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    return null;
  }
}

/**
 * 测试获取卡片配置API
 */
async function testGetCardConfig(cardId) {
  console.log(`\n=== 测试获取卡片配置 (ID: ${cardId}) ===`);
  
  try {
    const token = generateTestToken();
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/cards/${cardId}/config`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await makeRequest(options);
    console.log('状态码:', response.statusCode);
    console.log('响应数据:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ 获取卡片配置成功');
    } else {
      console.log('❌ 获取卡片配置失败');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log('开始测试卡片API...');
  
  // 测试获取卡片列表
  const cards = await testGetCards();
  
  // 如果有卡片数据，测试获取第一个卡片的配置
  if (cards && cards.length > 0) {
    await testGetCardConfig(cards[0].id);
  }
  
  console.log('\n测试完成！');
}

// 运行测试
runTests().catch(console.error);