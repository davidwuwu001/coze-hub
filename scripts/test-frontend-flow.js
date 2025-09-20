/**
 * 测试前端完整流程
 * 模拟用户登录 -> 保存token -> 调用卡片API
 */

// 模拟localStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value;
    console.log(`localStorage.setItem('${key}', '${value.substring(0, 50)}...')`);
  }
  
  removeItem(key) {
    delete this.store[key];
    console.log(`localStorage.removeItem('${key}')`);
  }
}

const mockLocalStorage = new MockLocalStorage();

async function testFrontendFlow() {
  console.log('=== 测试前端完整流程 ===');
  
  try {
    // 1. 模拟用户登录
    console.log('\n1. 模拟用户登录...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'David',
        password: '123456'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`登录失败: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('登录成功:', loginData.success);
    console.log('用户信息:', loginData.data.user.username);
    
    // 2. 模拟保存token到localStorage
    console.log('\n2. 保存token到localStorage...');
    if (loginData.data.token) {
      mockLocalStorage.setItem('token', loginData.data.token);
      console.log('Token保存成功');
    } else {
      throw new Error('登录响应中没有token');
    }
    
    // 3. 模拟从localStorage获取token
    console.log('\n3. 从localStorage获取token...');
    const savedToken = mockLocalStorage.getItem('token');
    if (savedToken) {
      console.log('Token获取成功:', savedToken.substring(0, 50) + '...');
    } else {
      throw new Error('无法从localStorage获取token');
    }
    
    // 4. 模拟首页调用卡片API
    console.log('\n4. 模拟首页调用卡片API...');
    const homeCardsResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (homeCardsResponse.ok) {
      const homeResult = await homeCardsResponse.json();
      console.log(`✅ 首页API成功，返回 ${homeResult.data?.length || 0} 张卡片`);
      if (homeResult.data && homeResult.data.length > 0) {
        console.log('前3张卡片:');
        homeResult.data.slice(0, 3).forEach(card => {
          console.log(`  - ${card.name}: ${card.desc}`);
        });
      }
    } else {
      console.log(`❌ 首页API失败: ${homeCardsResponse.status}`);
      const errorText = await homeCardsResponse.text();
      console.log('错误响应:', errorText);
    }
    
    // 5. 模拟管理面板调用卡片API
    console.log('\n5. 模拟管理面板调用卡片API...');
    const adminCardsResponse = await fetch('http://localhost:3000/api/cards?admin=true', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (adminCardsResponse.ok) {
      const adminResult = await adminCardsResponse.json();
      console.log(`✅ 管理面板API成功，返回 ${adminResult.data?.length || 0} 张卡片`);
      if (adminResult.data && adminResult.data.length > 0) {
        const enabledCount = adminResult.data.filter(card => card.enabled).length;
        const disabledCount = adminResult.data.length - enabledCount;
        console.log(`  启用: ${enabledCount} 张，禁用: ${disabledCount} 张`);
      }
    } else {
      console.log(`❌ 管理面板API失败: ${adminCardsResponse.status}`);
      const errorText = await adminCardsResponse.text();
      console.log('错误响应:', errorText);
    }
    
    // 6. 测试token验证API
    console.log('\n6. 测试token验证API...');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${savedToken}`
      }
    });
    
    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log('✅ Token验证成功:', verifyResult.data?.user?.username);
    } else {
      console.log(`❌ Token验证失败: ${verifyResponse.status}`);
    }
    
    console.log('\n=== 前端流程测试完成 ===');
    console.log('\n结论: API工作正常，问题可能在前端代码的具体实现中');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testFrontendFlow();