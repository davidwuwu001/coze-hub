/**
 * 测试卡片保存功能
 * 验证后台管理页面的卡片创建和更新API是否正常工作
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

/**
 * 测试数据库连接
 */
async function testDatabaseConnection() {
  try {
    console.log('🔍 测试数据库连接...');
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    console.log('✅ 数据库连接成功');
    
    // 检查feature_cards表结构
    const [columns] = await connection.execute('DESCRIBE feature_cards');
    console.log('📋 feature_cards表结构:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

/**
 * 测试卡片创建API
 */
async function testCreateCardAPI() {
  try {
    console.log('\n🔍 测试卡片创建API...');
    
    // 模拟登录获取token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'David',
        password: 'david123'
      })
    });
    
    let token = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.data.token;
      console.log('✅ 登录成功');
    } else {
      console.log('⚠️  登录失败，使用模拟token测试');
      token = 'mock-token-for-testing';
    }
    
    // 测试创建卡片
    const testCard = {
      name: '测试卡片_' + Date.now(),
      desc: '这是一个测试卡片，用于验证保存功能',
      iconName: 'TestTube',
      bgColor: 'bg-green-500',
      order: 999,
      enabled: true,
      workflowId: 'test-workflow-123',
      workflowEnabled: true,
      apiToken: 'test-api-token-456'
    };
    
    const createResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testCard)
    });
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      const createdCard = createResult.data;
      console.log('✅ 卡片创建成功:', createdCard.name);
      console.log('📝 卡片ID:', createdCard.id);
      
      // 测试更新卡片
      const updateData = {
        ...testCard,
        id: createdCard.id,
        name: testCard.name + '_已更新',
        desc: testCard.desc + ' (已更新)'
      };
      
      const updateResponse = await fetch('http://localhost:3000/api/cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        const updatedCard = updateResult.data;
        console.log('✅ 卡片更新成功:', updatedCard.name);
        console.log('ℹ️  测试卡片已创建，请手动清理 (ID: ' + createdCard.id + ')');
        
        return true;
      } else {
        const updateError = await updateResponse.text();
        console.error('❌ 卡片更新失败:', updateError);
        return false;
      }
    } else {
      const createError = await createResponse.text();
      console.error('❌ 卡片创建失败:', createError);
      return false;
    }
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    return false;
  }
}

/**
 * 检查现有卡片数据
 */
async function checkExistingCards() {
  try {
    console.log('\n🔍 检查现有卡片数据...');
    const connection = await mysql.createConnection(dbConfig);
    
    const [cards] = await connection.execute(
      'SELECT id, name, description, sort_order, enabled FROM feature_cards ORDER BY sort_order ASC LIMIT 5'
    );
    console.log(`📊 数据库中共有 ${cards.length} 张卡片:`);
    
    cards.forEach((card, index) => {
      console.log(`  ${index + 1}. ${card.name} (ID: ${card.id}) - ${card.enabled ? '启用' : '禁用'}`);
    });
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ 检查卡片数据失败:', error.message);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试卡片保存功能\n');
  
  const dbTest = await testDatabaseConnection();
  if (!dbTest) {
    console.log('\n❌ 数据库连接失败，无法继续测试');
    return;
  }
  
  await checkExistingCards();
  
  const apiTest = await testCreateCardAPI();
  
  console.log('\n📋 测试结果总结:');
  console.log(`  - 数据库连接: ${dbTest ? '✅ 正常' : '❌ 失败'}`);
  console.log(`  - API功能: ${apiTest ? '✅ 正常' : '❌ 失败'}`);
  
  if (dbTest && apiTest) {
    console.log('\n🎉 所有测试通过！卡片保存功能正常工作。');
    console.log('💡 如果后台管理页面保存按钮无效，可能是前端JavaScript错误或网络问题。');
  } else {
    console.log('\n⚠️  存在问题，请检查上述错误信息。');
  }
}

// 运行测试
runTests().catch(console.error);