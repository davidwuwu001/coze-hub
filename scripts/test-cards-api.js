const mysql = require('mysql2/promise');

/**
 * 测试卡片API接口
 * 验证首页和管理面板的数据加载
 */
async function testCardsAPI() {
  console.log('=== 测试卡片API接口 ===');
  
  try {
    // 1. 首先检查数据库中的卡片数据
    console.log('\n1. 检查数据库中的卡片数据...');
    const connection = await mysql.createConnection({
      host: '124.223.62.233',
      port: 3306,
      user: 'coze-hub',
      password: '7788Gg7788',
      database: 'coze-hub'
    });
    
    const [cards] = await connection.execute(
      'SELECT id, name, description, icon_name, bg_color, order_index, enabled FROM feature_cards ORDER BY order_index ASC'
    );
    
    console.log(`数据库中共有 ${cards.length} 张卡片:`);
    cards.forEach(card => {
      console.log(`  - ID: ${card.id}, 名称: ${card.name}, 启用: ${card.enabled ? '是' : '否'}`);
    });
    
    await connection.end();
    
    // 2. 测试登录获取token
    console.log('\n2. 测试用户登录...');
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
    
    if (!loginResponse.ok) {
      throw new Error(`登录失败: ${loginResponse.status}`);
    }
    
    const loginResult = await loginResponse.json();
    console.log('登录成功，获取到token');
    const token = loginResult.token;
    
    // 3. 测试首页卡片API（只返回启用的卡片）
    console.log('\n3. 测试首页卡片API...');
    const homeCardsResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (homeCardsResponse.ok) {
      const homeResult = await homeCardsResponse.json();
      console.log(`首页API返回 ${homeResult.data?.length || 0} 张卡片`);
      if (homeResult.data && homeResult.data.length > 0) {
        console.log('首页卡片数据:');
        homeResult.data.forEach(card => {
          console.log(`  - ${card.name}: ${card.desc}`);
        });
      } else {
        console.log('⚠️  首页没有返回卡片数据');
      }
    } else {
      console.log(`❌ 首页卡片API请求失败: ${homeCardsResponse.status}`);
    }
    
    // 4. 测试管理面板卡片API（返回所有卡片）
    console.log('\n4. 测试管理面板卡片API...');
    const adminCardsResponse = await fetch('http://localhost:3000/api/cards?admin=true', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (adminCardsResponse.ok) {
      const adminResult = await adminCardsResponse.json();
      console.log(`管理面板API返回 ${adminResult.data?.length || 0} 张卡片`);
      if (adminResult.data && adminResult.data.length > 0) {
        console.log('管理面板卡片数据:');
        adminResult.data.forEach(card => {
          console.log(`  - ${card.name}: ${card.desc} (启用: ${card.enabled ? '是' : '否'})`);
        });
      } else {
        console.log('⚠️  管理面板没有返回卡片数据');
      }
    } else {
      console.log(`❌ 管理面板卡片API请求失败: ${adminCardsResponse.status}`);
    }
    
    // 5. 测试无token访问（应该返回401）
    console.log('\n5. 测试无token访问...');
    const noTokenResponse = await fetch('http://localhost:3000/api/cards');
    console.log(`无token访问状态码: ${noTokenResponse.status} ${noTokenResponse.status === 401 ? '✅' : '❌'}`);
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行测试
testCardsAPI();