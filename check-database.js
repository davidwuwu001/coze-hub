const mysql = require('mysql2/promise');

/**
 * 数据库连接配置
 */
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
 * 检查数据库连接
 */
async function checkConnection() {
  console.log('\n=== 检查数据库连接 ===');
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    console.log('✅ 数据库连接成功');
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

/**
 * 检查表是否存在
 */
async function checkTableExists() {
  console.log('\n=== 检查feature_cards表是否存在 ===');
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'feature_cards'"
    );
    
    if (tables.length > 0) {
      console.log('✅ feature_cards表存在');
      return true;
    } else {
      console.log('❌ feature_cards表不存在');
      return false;
    }
  } catch (error) {
    console.error('❌ 检查表失败:', error.message);
    return false;
  } finally {
    await connection.end();
  }
}

/**
 * 检查表结构
 */
async function checkTableStructure() {
  console.log('\n=== 检查feature_cards表结构 ===');
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [columns] = await connection.execute(
      "DESCRIBE feature_cards"
    );
    
    console.log('表结构:');
    columns.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? column.Key : ''}`);
    });
    return true;
  } catch (error) {
    console.error('❌ 检查表结构失败:', error.message);
    return false;
  } finally {
    await connection.end();
  }
}

/**
 * 检查表中数据
 */
async function checkTableData() {
  console.log('\n=== 检查feature_cards表数据 ===');
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM feature_cards"
    );
    
    const count = rows[0].count;
    console.log(`表中共有 ${count} 条记录`);
    
    if (count > 0) {
      const [data] = await connection.execute(
        "SELECT id, name, description, icon, is_enabled FROM feature_cards LIMIT 5"
      );
      console.log('前5条记录:');
      data.forEach(row => {
        console.log(`  - ID: ${row.id}, 名称: ${row.name}, 描述: ${row.description}, 图标: ${row.icon}, 启用: ${row.is_enabled}`);
      });
    }
    
    return count;
  } catch (error) {
    console.error('❌ 检查表数据失败:', error.message);
    return -1;
  } finally {
    await connection.end();
  }
}

/**
 * 创建测试数据
 */
async function createTestData() {
  console.log('\n=== 创建测试卡片数据 ===');
  const connection = await mysql.createConnection(dbConfig);
  try {
    const testCards = [
      {
        name: '智能对话',
        description: '与AI进行智能对话交流',
        icon: 'MessageCircle',
        background_color: '#3B82F6',
        sort_order: 1,
        is_enabled: 1,
        workflow_enabled: 1,
        workflow_id: 'chat_workflow',
        workflow_params: JSON.stringify({ model: 'gpt-3.5-turbo' })
      },
      {
        name: '文档生成',
        description: '自动生成各类文档',
        icon: 'FileText',
        background_color: '#10B981',
        sort_order: 2,
        is_enabled: 1,
        workflow_enabled: 1,
        workflow_id: 'doc_workflow',
        workflow_params: JSON.stringify({ format: 'markdown' })
      },
      {
        name: '图片处理',
        description: '智能图片编辑和处理',
        icon: 'Image',
        background_color: '#F59E0B',
        sort_order: 3,
        is_enabled: 1,
        workflow_enabled: 0,
        workflow_id: null,
        workflow_params: null
      }
    ];
    
    for (const card of testCards) {
      await connection.execute(
        `INSERT INTO feature_cards (name, description, icon, background_color, sort_order, is_enabled, workflow_enabled, workflow_id, workflow_params, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [card.name, card.description, card.icon, card.background_color, card.sort_order, card.is_enabled, card.workflow_enabled, card.workflow_id, card.workflow_params]
      );
    }
    
    console.log(`✅ 成功创建 ${testCards.length} 条测试数据`);
    return true;
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error.message);
    return false;
  } finally {
    await connection.end();
  }
}

/**
 * 测试API接口
 */
async function testAPI() {
  console.log('\n=== 测试/api/cards接口 ===');
  try {
    const response = await fetch('http://localhost:3000/api/cards?admin=true');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API接口响应成功');
      console.log(`返回 ${data.length} 条卡片数据`);
      
      if (data.length > 0) {
        console.log('前3条卡片数据:');
        data.slice(0, 3).forEach(card => {
          console.log(`  - ${card.name}: ${card.description}`);
        });
      }
    } else {
      console.error('❌ API接口响应失败:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ 测试API接口失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始诊断后台管理卡片问题...');
  
  // 1. 检查数据库连接
  const connectionOk = await checkConnection();
  if (!connectionOk) {
    console.log('\n❌ 数据库连接失败，请检查数据库配置');
    return;
  }
  
  // 2. 检查表是否存在
  const tableExists = await checkTableExists();
  if (!tableExists) {
    console.log('\n❌ feature_cards表不存在，请先创建表结构');
    return;
  }
  
  // 3. 检查表结构
  await checkTableStructure();
  
  // 4. 检查表数据
  const dataCount = await checkTableData();
  
  // 5. 如果没有数据，创建测试数据
  if (dataCount === 0) {
    console.log('\n表中没有数据，正在创建测试数据...');
    await createTestData();
  }
  
  // 6. 测试API接口
  await testAPI();
  
  console.log('\n=== 诊断完成 ===');
}

// 运行主函数
main().catch(console.error);