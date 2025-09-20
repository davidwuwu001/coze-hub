const http = require('http');

/**
 * 测试登录API并获取token
 */
async function testLogin() {
  console.log('=== 测试登录流程 ===');
  
  // 测试登录
  const loginData = {
    identifier: 'David', // 使用数据库中的用户名
    password: '123456'   // 假设密码
  };
  
  console.log('\n1. 尝试登录...');
  console.log('用户名:', loginData.identifier);
  
  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      console.log(`登录API状态码: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log('\n登录API原始响应:');
          console.log(data);
          
          const jsonData = JSON.parse(data);
          
          if (res.statusCode === 200 && jsonData.success) {
            console.log('\n✅ 登录成功!');
            const token = jsonData.data.token;
            console.log('Token:', token.substring(0, 30) + '...');
            
            // 使用获取的token测试卡片API
            testCardsWithToken(token);
          } else {
            console.log('\n❌ 登录失败:', jsonData.message);
            
            // 尝试其他可能的密码
            console.log('\n尝试其他密码...');
            tryOtherPasswords();
          }
          
          resolve(data);
        } catch (error) {
          console.error('❌ 解析登录响应失败:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ 登录请求失败:', error.message);
      reject(error);
    });
    
    req.write(JSON.stringify(loginData));
    req.end();
  });
}

/**
 * 使用token测试卡片API
 */
function testCardsWithToken(token) {
  console.log('\n2. 使用token测试卡片API...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cards',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`卡片API状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n卡片API响应:', JSON.stringify(jsonData, null, 2));
        
        if (jsonData.success && jsonData.data) {
          console.log(`\n✅ 卡片API成功! 返回 ${jsonData.data.length} 条卡片数据`);
        } else {
          console.log('\n❌ 卡片API失败:', jsonData.message);
        }
      } catch (error) {
        console.error('❌ 解析卡片API响应失败:', error.message);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ 卡片API请求失败:', error.message);
  });
  
  req.end();
}

/**
 * 尝试其他可能的密码
 */
function tryOtherPasswords() {
  const passwords = ['password', 'admin', '123456789', 'david123', 'David123'];
  
  passwords.forEach((password, index) => {
    setTimeout(() => {
      console.log(`\n尝试密码 ${index + 1}: ${password}`);
      
      const loginData = {
        identifier: 'David',
        password: password
      };
      
      const loginOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode === 200 && jsonData.success) {
              console.log(`\n✅ 密码正确: ${password}`);
              console.log('Token:', jsonData.data.token.substring(0, 30) + '...');
              testCardsWithToken(jsonData.data.token);
            } else {
              console.log(`❌ 密码错误: ${password}`);
            }
          } catch (error) {
            console.log(`❌ 密码错误: ${password}`);
          }
        });
      });
      
      req.on('error', () => {
        console.log(`❌ 请求失败: ${password}`);
      });
      
      req.write(JSON.stringify(loginData));
      req.end();
    }, index * 1000); // 每秒尝试一个密码
  });
}

// 运行测试
testLogin().catch(console.error);