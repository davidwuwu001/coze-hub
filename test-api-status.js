/**
 * API状态检查脚本
 * 检查卡片相关API接口的工作状态
 */
const http = require('http');

/**
 * 发送HTTP请求的辅助函数
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * 测试卡片列表API
 */
async function testCardsAPI() {
  console.log('\n=== 测试 /api/cards 接口 ===');
  
  try {
    // 测试不带认证的请求
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/cards',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const result = await makeRequest(options);
    console.log(`状态码: ${result.status}`);
    console.log('响应数据:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 401) {
      console.log('✓ API需要认证，这是正常的');
    } else if (result.status === 200) {
      console.log('✓ API返回成功');
      if (result.data.success && result.data.data) {
        console.log(`✓ 返回了 ${result.data.data.length} 个卡片`);
      }
    } else {
      console.log('⚠ API返回异常状态码');
    }
    
  } catch (error) {
    console.error('✗ API测试失败:', error.message);
  }
}

/**
 * 测试管理员模式的卡片API
 */
async function testAdminCardsAPI() {
  console.log('\n=== 测试 /api/cards?admin=true 接口 ===');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/cards?admin=true',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const result = await makeRequest(options);
    console.log(`状态码: ${result.status}`);
    console.log('响应数据:', JSON.stringify(result.data, null, 2));
    
  } catch (error) {
    console.error('✗ 管理员API测试失败:', error.message);
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('开始API状态检查...');
  
  await testCardsAPI();
  await testAdminCardsAPI();
  
  console.log('\n=== API检查完成 ===');
}

// 运行测试
runTests().catch(console.error);