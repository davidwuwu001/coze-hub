const http = require('http');

/**
 * 测试API接口
 */
async function testCardsAPI() {
  console.log('测试 /api/cards 接口...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cards',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 模拟认证token（如果需要的话）
      'Authorization': 'Bearer test-token'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      console.log(`响应头:`, res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log('\n原始响应数据:');
          console.log(data);
          
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log('\n解析后的JSON数据:');
            console.log(JSON.stringify(jsonData, null, 2));
            
            if (jsonData.success && jsonData.data) {
              console.log(`\n✅ API返回成功，共 ${jsonData.data.length} 条卡片数据`);
              
              // 显示前3条数据的详情
              console.log('\n前3条卡片数据:');
              jsonData.data.slice(0, 3).forEach((card, index) => {
                console.log(`${index + 1}. ${card.name} - ${card.description}`);
              });
            } else {
              console.log('❌ API返回格式异常');
            }
          } else {
            console.log(`❌ API返回错误状态码: ${res.statusCode}`);
          }
          
          resolve(data);
        } catch (error) {
          console.error('❌ 解析响应数据失败:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ 请求超时');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// 测试不带认证的请求
async function testWithoutAuth() {
  console.log('\n=== 测试不带认证的请求 ===');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cards',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('响应数据:', data);
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.error('请求失败:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

// 运行测试
async function runTests() {
  try {
    console.log('开始API测试...');
    
    // 测试带认证的请求
    await testCardsAPI();
    
    // 测试不带认证的请求
    await testWithoutAuth();
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

runTests();